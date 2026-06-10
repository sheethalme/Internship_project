-- Migration: add prep_time_mins column to order_item_predictions if missing
ALTER TABLE order_item_predictions
  ADD COLUMN IF NOT EXISTS prep_time_mins FLOAT;
