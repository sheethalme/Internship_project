-- ============================================================
--  GourmetGo Sentiment Analysis Migration
--  Feature: Review Sentiment Analysis (DistilBERT)
--  Adds sentiment label + confidence to each review.
--  Run against gourmetgo_db after the base schema.
--    mysql -u root -p gourmetgo_db < migration_sentiment.sql
-- ============================================================
USE gourmetgo_db;

-- sentiment      : model classification of the review comment
-- sentiment_score: confidence of that classification (0.000 - 1.000)
ALTER TABLE reviews ADD COLUMN sentiment ENUM('positive','neutral','negative') DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN sentiment_score DECIMAL(4,3) DEFAULT NULL;

-- Helps the vendor dashboard's per-canteen, last-7-day aggregation.
CREATE INDEX idx_reviews_canteen_created ON reviews (canteen_id, created_at);
