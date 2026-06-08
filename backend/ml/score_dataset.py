"""
============================================================
 GourmetGo — Label a sample of the Zomato dataset
 Run: python3 ml/score_dataset.py [N]

 Classifies review TEXT with the pretrained multilingual
 DistilBERT sentiment model and writes ml/data/seed_reviews.json
 for scripts/seedReviews.js. (The dataset's star ratings are
 unreliable, so sentiment comes from the text, not the rating.)

 Samples a larger pool, then rebalances to ~N reviews so the
 vendor dashboard shows a realistic mix of moods.
============================================================
"""
import os
import sys
import json
import numpy as np
import pandas as pd

HERE      = os.path.dirname(__file__)
DATA_PATH = os.path.join(HERE, 'data', 'zomato_reviews.csv')
OUT_PATH  = os.path.join(HERE, 'data', 'seed_reviews.json')
SEED      = 42

sys.path.insert(0, HERE)
from train_sentiment import detect_columns  # noqa: E402  (reused column auto-detect)


def main():
    n_target = int(sys.argv[1]) if len(sys.argv) > 1 else 400

    if not os.path.exists(DATA_PATH):
        print(f"ERROR: dataset not found at {DATA_PATH}", file=sys.stderr)
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)
    rating_col, text_col = detect_columns(df)
    df = df[[text_col]].rename(columns={text_col: 'text'})
    df['text'] = df['text'].astype(str).str.strip()
    df = df[(df['text'].str.len() > 5) & (df['text'].str.lower() != 'nan')]

    # Classify a pool ~2x the target so we can rebalance the moods afterwards.
    pool = df.sample(n=min(len(df), n_target * 2), random_state=SEED)['text'].tolist()
    print(f"Classifying {len(pool)} reviews with the pretrained model...")

    from transformers import pipeline
    clf = pipeline("sentiment-analysis",
                   model="lxyuan/distilbert-base-multilingual-cased-sentiments-student",
                   top_k=None)

    scored = []
    BATCH = 64
    for i in range(0, len(pool), BATCH):
        chunk = pool[i:i + BATCH]
        for text, scores in zip(chunk, clf(chunk, truncation=True, batch_size=BATCH)):
            top = max(scores, key=lambda s: s['score'])
            label = top['label'].lower()
            if label not in ('positive', 'neutral', 'negative'):
                label = 'neutral'
            scored.append({"text": text, "rating": None,
                           "sentiment": label, "score": round(float(top['score']), 3)})
        print(f"  scored {min(i + BATCH, len(pool))}/{len(pool)}", end='\r')
    print()

    # Rebalance to ~N with a realistic mix (so negatives/neutrals are visible).
    rng = np.random.RandomState(SEED)
    targets = {'positive': int(n_target * 0.45), 'neutral': int(n_target * 0.25), 'negative': int(n_target * 0.30)}
    out = []
    for lbl, want in targets.items():
        bucket = [s for s in scored if s['sentiment'] == lbl]
        rng.shuffle(bucket)
        out.extend(bucket[:want])
    rng.shuffle(out)

    with open(OUT_PATH, 'w') as f:
        json.dump(out, f)
    mix = {l: sum(1 for o in out if o['sentiment'] == l) for l in ('positive', 'neutral', 'negative')}
    print(f"Wrote {len(out)} labeled reviews to {OUT_PATH}  (mix: {mix})")


if __name__ == '__main__':
    main()
