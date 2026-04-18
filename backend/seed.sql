-- ============================================================
--  GourmetGo Seed Data
--  Run this in MySQL Workbench after schema.sql
-- ============================================================

USE gourmetgo_db;

-- ── CANTEENS ─────────────────────────────────────────────────
INSERT INTO canteens (name, description, operating_hours, status, max_capacity, avg_rating, banner_image) VALUES
('Christ Bakery',    'South Indian breakfast, baked goods & healthy bites',        '7:30 AM - 6:00 PM', 'open', 20, 4.3, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80'),
("Michael's Corner", 'Snacks, rolls, burgers & freshly brewed beverages',          '8:00 AM - 7:00 PM', 'open', 20, 4.1, 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80'),
('Mingos',           'Continental favourites — pasta, fries, wraps & smoothies',   '9:00 AM - 8:00 PM', 'open', 20, 4.5, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'),
('Freshateria',      'Clean eating — salads, bowls, protein shakes & detox juices','8:00 AM - 6:00 PM', 'open', 20, 4.4, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80');

-- ── VENDORS ──────────────────────────────────────────────────
INSERT INTO vendors (name, email, password_hash, canteen_id) VALUES
('Ravi Kumar',       'bakery@christuniversity.in',     '$2a$10$FmPvE1NiZ8Hgey1rOTAqZ.T2SDBjvTbuh6icamkr/SyQENNroV5fe', 1),
("Michael D'Souza",  'michaels@christuniversity.in',   '$2a$10$.oA877zsY3gbh8lZ6hgAju3cthccYztWEMz2a93wkeIKLm2Je0Ri6', 2),
('Priya Nair',       'mingos@christuniversity.in',     '$2a$10$L1yxOqIIutkUCZche4FsvON96TiD6uSvw8lUpvtOrSEm7qqReD0Fy', 3),
('Anita Sharma',     'freshateria@christuniversity.in','$2a$10$f9jDNOGpUCfL/nzF37AK7uxQfAVgNVWoKkqZCvlMh0ieIKEBdYZSu', 4);

-- ── STUDENTS ─────────────────────────────────────────────────
-- All passwords are: student2024
INSERT INTO students (name, email, password_hash, roll_number, department, year_of_study, loyalty_points, wallet_balance) VALUES
('Aarav Sharma',   'aarav.sharma@christuniversity.in',  '$2a$10$LnZL1IgcSniSdSQkp2ikeuhEEifkSup4sCt45PcEI4nS/Rpk4gbh6', 'CHR2024CS001', 'Computer Science',   2, 340, 500),
('Priya Krishnan', 'priya.k@christuniversity.in',       '$2a$10$LnZL1IgcSniSdSQkp2ikeuhEEifkSup4sCt45PcEI4nS/Rpk4gbh6', 'CHR2024EC002', 'Electronics',        3, 120, 300),
('Rohan Mathew',   'rohan.m@christuniversity.in',       '$2a$10$LnZL1IgcSniSdSQkp2ikeuhEEifkSup4sCt45PcEI4nS/Rpk4gbh6', 'CHR2024ME003', 'Mechanical Engg',    1,  50, 200),
('Sneha Iyer',     'sneha.iyer@christuniversity.in',    '$2a$10$LnZL1IgcSniSdSQkp2ikeuhEEifkSup4sCt45PcEI4nS/Rpk4gbh6', 'CHR2024BA004', 'Business Admin',     2, 200, 400),
('Karthik Nair',   'karthik.n@christuniversity.in',     '$2a$10$LnZL1IgcSniSdSQkp2ikeuhEEifkSup4sCt45PcEI4nS/Rpk4gbh6', 'CHR2024CS005', 'Computer Science',   3,  80, 150),
('Divya Pillai',   'divya.p@christuniversity.in',       '$2a$10$LnZL1IgcSniSdSQkp2ikeuhEEifkSup4sCt45PcEI4nS/Rpk4gbh6', 'CHR2024PS006', 'Psychology',         2, 500, 600),
('Arun Varghese',  'arun.v@christuniversity.in',        '$2a$10$LnZL1IgcSniSdSQkp2ikeuhEEifkSup4sCt45PcEI4nS/Rpk4gbh6', 'CHR2024CE007', 'Civil Engg',         4,  30, 100),
('Meera Thomas',   'meera.t@christuniversity.in',       '$2a$10$LnZL1IgcSniSdSQkp2ikeuhEEifkSup4sCt45PcEI4nS/Rpk4gbh6', 'CHR2024EN008', 'English Literature', 1, 150, 250);

-- ── MENU ITEMS — Christ Bakery (canteen 1) ───────────────────
INSERT INTO menu_items (item_id, canteen_id, name, price, category, is_veg, prep_time_mins, daily_stock_limit, stock_remaining, image_url) VALUES
(101,1,'Masala Dosa',      40,'meals',    1,8, 50,38,'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80'),
(102,1,'Poori',            30,'meals',    1,7, 40,28,'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80'),
(103,1,'Idly (2 pcs)',     25,'meals',    1,5, 60,44,'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80'),
(104,1,'Vada',             20,'snacks',   1,6, 40,30,'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80'),
(105,1,'Upma',             30,'meals',    1,6, 30,18,'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80'),
(106,1,'Pongal',           35,'meals',    1,7, 30,22,'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80'),
(107,1,'Bread Omelette',   40,'meals',    0,8, 25,15,'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80'),
(108,1,'Mini Idly (6 pcs)',35,'meals',    1,5, 40,32,'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80'),
(109,1,'Croissant',        45,'bakery',   1,3, 20,12,'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80'),
(110,1,'Banana Bread',     50,'bakery',   1,2, 15, 9,'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80'),
(111,1,'Tea Cake',         30,'bakery',   1,2, 20,14,'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80'),
(112,1,'Protein Cookies',  60,'healthy',  1,1, 30,20,'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80'),
(113,1,'Protein Bars',     80,'healthy',  1,1, 25,18,'https://images.unsplash.com/photo-1622484212850-5a4b4a0e7e5a?w=400&q=80'),
(114,1,'Coffee',           30,'beverages',1,4, 80,60,'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80'),
(115,1,'Tea',              20,'beverages',1,3, 80,65,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'),
(116,1,'Cold Coffee',      60,'beverages',1,5, 40,28,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80'),
(117,1,'Vanilla Milkshake',70,'beverages',1,5, 30,20,'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80');

-- ── MENU ITEMS — Michael's Corner (canteen 2) ────────────────
INSERT INTO menu_items (item_id, canteen_id, name, price, category, is_veg, prep_time_mins, daily_stock_limit, stock_remaining, image_url) VALUES
(201,2,'Bun Samosa',       25,'snacks',   1,5, 40,28,'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80'),
(202,2,'Blueberry Muffin', 55,'bakery',   1,2, 20,13,'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80'),
(203,2,'Chocolate Muffin', 55,'bakery',   1,2, 20,10,'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80'),
(204,2,'Brownie',          60,'snacks',   1,2, 25,16,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80'),
(205,2,'French Toast',     50,'meals',    1,8, 25,17,'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80'),
(206,2,'Veg Sandwich',     45,'snacks',   1,7, 30,20,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80'),
(207,2,'Paneer Roll',      70,'snacks',   1,10,25,15,'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80'),
(208,2,'Egg Roll',         65,'snacks',   0,10,20,14,'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80'),
(209,2,'Chicken Roll',     80,'snacks',   0,12,20,12,'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80'),
(210,2,'Aloo Tikki Burger',60,'snacks',   1,10,25,16,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'),
(211,2,'Chicken Burger',   90,'snacks',   0,12,20,13,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'),
(212,2,'Masala Tea',       25,'beverages',1,4, 60,45,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'),
(213,2,'Lemon Tea',        30,'beverages',1,4, 50,38,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80'),
(214,2,'Coffee',           35,'beverages',1,4, 60,44,'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80'),
(215,2,'Cold Coffee',      65,'beverages',1,5, 40,28,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80');

-- ── MENU ITEMS — Mingos (canteen 3) ─────────────────────────
INSERT INTO menu_items (item_id, canteen_id, name, price, category, is_veg, prep_time_mins, daily_stock_limit, stock_remaining, image_url) VALUES
(301,3,'Fries',              60,'snacks',   1,8, 40,28,'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80'),
(302,3,'Garlic Bread',       55,'snacks',   1,7, 30,20,'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&q=80'),
(303,3,'Pasta (Arrabbiata)', 90,'meals',    1,12,25,16,'https://images.unsplash.com/photo-1567608286699-8f2e96af9540?w=400&q=80'),
(304,3,'Mac & Cheese',       95,'meals',    1,10,20,12,'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&q=80'),
(305,3,'Noodles',            80,'meals',    1,10,25,17,'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80'),
(306,3,'Grilled Sandwich',   70,'snacks',   1,8, 25,18,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80'),
(307,3,'Veg Wrap',           75,'snacks',   1,8, 25,15,'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80'),
(308,3,'Chicken Wrap',      100,'snacks',   0,10,20,12,'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80'),
(309,3,'Nachos',             85,'snacks',   1,7, 25,16,'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80'),
(310,3,'Boiled Eggs (2 pcs)',30,'snacks',   0,5, 30,22,'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80'),
(311,3,'Brownie Sundae',    110,'snacks',   1,5, 15, 8,'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80'),
(312,3,'Iced Tea',           50,'beverages',1,3, 40,28,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80'),
(313,3,'Iced Chocolate',     65,'beverages',1,4, 30,20,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80'),
(314,3,'Cold Coffee',        70,'beverages',1,4, 35,24,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80'),
(315,3,'Mango Smoothie',     75,'beverages',1,5, 30,20,'https://images.unsplash.com/photo-1553530979-7ee46c8e7a44?w=400&q=80');

-- ── MENU ITEMS — Freshateria (canteen 4) ────────────────────
INSERT INTO menu_items (item_id, canteen_id, name, price, category, is_veg, prep_time_mins, daily_stock_limit, stock_remaining, image_url) VALUES
(401,4,'Egg Salad',           70,'healthy',  0,7,20,14,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'),
(402,4,'Hummus Sandwich',     80,'healthy',  1,6,20,13,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80'),
(403,4,'Avocado Toast',       95,'healthy',  1,7,15, 9,'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&q=80'),
(404,4,'PB Banana Sandwich',  75,'healthy',  1,5,20,15,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80'),
(405,4,'Oat Bowl',            85,'healthy',  1,5,20,14,'https://images.unsplash.com/photo-1517673408919-bfcedf5b4367?w=400&q=80'),
(406,4,'Acai Bowl',          120,'healthy',  1,8,15, 9,'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80'),
(407,4,'Greek Yogurt Parfait',100,'healthy', 1,5,15,10,'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80'),
(408,4,'Quinoa Salad',       110,'healthy',  1,8,15,10,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80'),
(409,4,'Fruit Bowl',          80,'healthy',  1,4,20,15,'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80'),
(410,4,'Chia Pudding',        90,'healthy',  1,2,15,11,'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&q=80'),
(411,4,'Granola Bar',         55,'snacks',   1,1,30,22,'https://images.unsplash.com/photo-1622484212850-5a4b4a0e7e5a?w=400&q=80'),
(412,4,'Protein Shake',      120,'beverages',1,5,20,14,'https://images.unsplash.com/photo-1553530979-7ee46c8e7a44?w=400&q=80'),
(413,4,'Green Smoothie',      95,'beverages',1,5,20,14,'https://images.unsplash.com/photo-1510970438969-ec3a4d46e33b?w=400&q=80'),
(414,4,'Detox Juice',         75,'beverages',1,5,20,15,'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80'),
(415,4,'Energy Bites',        65,'snacks',   1,1,25,18,'https://images.unsplash.com/photo-1622484212850-5a4b4a0e7e5a?w=400&q=80');
