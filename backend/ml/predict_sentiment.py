"""
============================================================
 GourmetGo — Sentiment inference
 Reads review text from STDIN, prints JSON:
     {"label": "positive|neutral|negative", "score": 0.0-1.0}

 Uses a pretrained multilingual 3-class DistilBERT sentiment
 model (classifies by the review TEXT — the dataset's star
 ratings were found to be unreliable). The model is cached
 locally after first download.

 Invoked per-review by backend/utils/sentimentPredictor.js.
 Any failure degrades to a neutral fallback so the API never
 breaks.
============================================================
"""
import sys
import json

MODEL_ID = "lxyuan/distilbert-base-multilingual-cased-sentiments-student"
VALID = ("positive", "neutral", "negative")

_clf = None


def get_classifier():
    global _clf
    if _clf is None:
        from transformers import pipeline
        _clf = pipeline("sentiment-analysis", model=MODEL_ID, top_k=None)
    return _clf


def classify(text):
    scores = get_classifier()(text[:2000], truncation=True)[0]
    top = max(scores, key=lambda s: s["score"])
    label = top["label"].lower()
    if label not in VALID:
        label = "neutral"
    return {"label": label, "score": round(float(top["score"]), 3)}


def main():
    text = sys.stdin.read().strip()
    if not text:
        print(json.dumps({"label": "neutral", "score": 0.0}))
        return
    try:
        print(json.dumps(classify(text)))
    except Exception as e:  # noqa: BLE001 — degrade gracefully
        print(json.dumps({"label": "neutral", "score": 0.0, "error": str(e)}))


if __name__ == "__main__":
    main()
