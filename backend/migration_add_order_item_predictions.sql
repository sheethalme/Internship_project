-- Migration: create order_item_predictions table for logging ML inputs and outputs
CREATE TABLE IF NOT EXISTS order_item_predictions (
  prediction_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  item_id INT,
  quantity INT,
  queue_length INT,
  is_peak_hour TINYINT,
  chef_availability INT,
  food_complexity INT,
  prep_time_mins FLOAT,
  prediction FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (order_id),
  INDEX (item_id)
);
