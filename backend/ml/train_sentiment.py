"""
============================================================
 NOTE: This rating-based training path is NOT the active one.
 This dataset's star ratings were found to NOT match the
 review text, so training on rating-derived labels yields a
 near-random model. The app instead uses a pretrained
 multilingual sentiment model directly (see predict_sentiment.py
 and score_dataset.py). This file is kept for its reusable
 column/label helpers and as an optional experiment.
============================================================
 GourmetGo — Review Sentiment Model (DistilBERT)
 Run: python3 ml/train_sentiment.py

 Fine-tunes distilbert-base-uncased for 3-class sentiment
 (negative / neutral / positive) on a Zomato review CSV.

 - Labels are derived from the 1-5 rating:
       1-2 -> negative,  3 -> neutral,  4-5 -> positive
 - The DistilBERT base is FROZEN; only the classifier head
   is trained (lightweight, fast on CPU).
 - Class-weighted CrossEntropy compensates for the rare
   "neutral" class.
 - Saves the fine-tuned model + tokenizer to ml/sentiment_model/
   and prints a per-class classification report.
============================================================
"""
import os
import sys
import numpy as np
import pandas as pd

import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.utils.class_weight import compute_class_weight
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# ── Config ────────────────────────────────────────────────
HERE         = os.path.dirname(__file__)
DATA_PATH    = os.path.join(HERE, 'data', 'zomato_reviews.csv')
MODEL_OUT    = os.path.join(HERE, 'sentiment_model')
BASE_MODEL   = 'distilbert-base-uncased'
MAX_LEN      = 128
EPOCHS       = 3
BATCH_SIZE   = 16
LR           = 2e-5
SEED         = 42
FREEZE_BASE  = os.environ.get('FREEZE_BASE', '0') == '1'   # default: full fine-tune (best accuracy)

LABELS   = ['negative', 'neutral', 'positive']   # index 0,1,2
ID2LABEL = {i: l for i, l in enumerate(LABELS)}
LABEL2ID = {l: i for i, l in enumerate(LABELS)}

torch.manual_seed(SEED)
np.random.seed(SEED)


# ── Column auto-detection ─────────────────────────────────
def detect_columns(df):
    """Find the rating column and the review-text column regardless of header naming."""
    rating_col, text_col = None, None
    for c in df.columns:
        lc = str(c).strip().lower()
        if rating_col is None and lc in ('rating', 'ratings', 'stars', 'score', 'rate'):
            rating_col = c
        if text_col is None and lc in ('review', 'reviews', 'review_text', 'text',
                                       'comment', 'comments', 'review text', 'body'):
            text_col = c
    # Fallbacks: first numeric-ish column = rating, longest-string column = text
    if rating_col is None:
        for c in df.columns:
            if pd.to_numeric(df[c], errors='coerce').notna().mean() > 0.8:
                rating_col = c
                break
    if text_col is None:
        text_col = max(df.columns, key=lambda c: df[c].astype(str).str.len().mean())
    return rating_col, text_col


def rating_to_label(r):
    try:
        r = float(r)
    except (TypeError, ValueError):
        return None
    if r <= 2:   return 0   # negative
    if r == 3:   return 1   # neutral
    if r >= 4:   return 2   # positive
    return None             # e.g. 3.5 — ambiguous, drop


def load_dataframe():
    if not os.path.exists(DATA_PATH):
        print(f"ERROR: dataset not found at {DATA_PATH}", file=sys.stderr)
        print("Place your Zomato CSV there (columns: rating 1-5 + review text).", file=sys.stderr)
        sys.exit(1)
    df = pd.read_csv(DATA_PATH)
    rating_col, text_col = detect_columns(df)
    print(f"Detected rating column: '{rating_col}'  |  text column: '{text_col}'")
    df = df[[rating_col, text_col]].rename(columns={rating_col: 'rating', text_col: 'text'})
    df['text'] = df['text'].astype(str).str.strip()
    df['label'] = df['rating'].apply(rating_to_label)
    df = df[(df['text'].str.len() > 0) & (df['text'].str.lower() != 'nan') & df['label'].notna()]
    df['label'] = df['label'].astype(int)
    print(f"Usable rows: {len(df)}")
    print("Label distribution:",
          {ID2LABEL[k]: int(v) for k, v in df['label'].value_counts().sort_index().items()})
    return df


# ── Torch dataset ─────────────────────────────────────────
class ReviewDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        item = {k: v[idx] for k, v in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item


def main():
    df = load_dataframe()

    X_train, X_test, y_train, y_test = train_test_split(
        df['text'].tolist(), df['label'].tolist(),
        test_size=0.2, random_state=SEED, stratify=df['label'].tolist()
    )

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    enc_train = tokenizer(X_train, truncation=True, padding=True, max_length=MAX_LEN, return_tensors='pt')
    enc_test  = tokenizer(X_test,  truncation=True, padding=True, max_length=MAX_LEN, return_tensors='pt')

    train_ds = ReviewDataset(enc_train, y_train)
    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)

    model = AutoModelForSequenceClassification.from_pretrained(
        BASE_MODEL, num_labels=3, id2label=ID2LABEL, label2id=LABEL2ID
    )

    # By default we FULL fine-tune (best accuracy). Inference cost is identical
    # either way — freezing only speeds up training — so full fine-tune is the
    # better default. Set FREEZE_BASE=1 to train the classifier head only
    # (lighter/faster training, but needs a higher LR + more epochs to converge).
    if FREEZE_BASE:
        for name, param in model.named_parameters():
            if name.startswith('distilbert'):
                param.requires_grad = False
        print("Mode: HEAD-ONLY (DistilBERT base frozen)")
    else:
        print("Mode: FULL FINE-TUNE (DistilBERT base trainable)")
    n_trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Trainable parameters: {n_trainable:,}")

    # Prefer Apple-Silicon GPU (MPS) for full fine-tuning; fall back to CPU.
    if torch.backends.mps.is_available():
        device = torch.device('mps')
    elif torch.cuda.is_available():
        device = torch.device('cuda')
    else:
        device = torch.device('cpu')
    print(f"Device: {device}")
    model.to(device)

    # Class weights for the imbalanced neutral class.
    classes = np.array([0, 1, 2])
    weights = compute_class_weight('balanced', classes=classes, y=np.array(y_train))
    class_weights = torch.tensor(weights, dtype=torch.float).to(device)
    print("Class weights:", {ID2LABEL[i]: round(float(w), 3) for i, w in enumerate(weights)})

    loss_fn = torch.nn.CrossEntropyLoss(weight=class_weights)
    optimizer = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad], lr=LR)

    # ── Training loop ─────────────────────────────────────
    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            input_ids = batch['input_ids'].to(device)
            attn      = batch['attention_mask'].to(device)
            labels    = batch['labels'].to(device)
            logits = model(input_ids=input_ids, attention_mask=attn).logits
            loss = loss_fn(logits, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        print(f"Epoch {epoch + 1}/{EPOCHS} — avg loss: {total_loss / len(train_loader):.4f}")

    # ── Evaluation ────────────────────────────────────────
    model.eval()
    preds = []
    test_ds = ReviewDataset(enc_test, y_test)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE)
    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch['input_ids'].to(device)
            attn      = batch['attention_mask'].to(device)
            logits = model(input_ids=input_ids, attention_mask=attn).logits
            preds.extend(torch.argmax(logits, dim=1).cpu().tolist())

    print("\n================ CLASSIFICATION REPORT ================")
    print(classification_report(y_test, preds, target_names=LABELS, digits=3, zero_division=0))

    # ── Save ──────────────────────────────────────────────
    os.makedirs(MODEL_OUT, exist_ok=True)
    model.save_pretrained(MODEL_OUT)
    tokenizer.save_pretrained(MODEL_OUT)
    print(f"Model + tokenizer saved to {MODEL_OUT}")


if __name__ == '__main__':
    main()
