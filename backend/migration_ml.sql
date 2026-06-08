USE gourmetgo_db;

ALTER TABLE menu_items ADD COLUMN complexity INT DEFAULT 3;

ALTER TABLE canteens ADD COLUMN chef_count INT DEFAULT 2;

ALTER TABLE orders ADD COLUMN estimated_prep_time INT DEFAULT 15;

UPDATE menu_items SET complexity = 1 WHERE category IN ('Drinks', 'Beverages', 'Snacks');

UPDATE menu_items SET complexity = 4 WHERE category IN ('Main Course', 'Special');

UPDATE menu_items SET complexity = 5 WHERE name LIKE '%Biryani%' OR name LIKE '%Thali%';
