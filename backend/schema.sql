-- ============================================================
--  GourmetGo Database Schema
--  Run this in MySQL Workbench to create all tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS gourmetgo_db;
USE gourmetgo_db;

-- ── CANTEENS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS canteens (
  canteen_id       INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  description      TEXT,
  operating_hours  VARCHAR(100) DEFAULT '8:00 AM - 7:00 PM',
  status           ENUM('open','closed','unavailable') DEFAULT 'open',
  max_capacity     INT DEFAULT 50,
  avg_rating       DECIMAL(3,2) DEFAULT 0.00,
  banner_image     VARCHAR(500),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── VENDORS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id        INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(150) UNIQUE NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,
  canteen_id       INT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (canteen_id) REFERENCES canteens(canteen_id)
);

-- ── STUDENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  student_id       INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  email            VARCHAR(150) UNIQUE NOT NULL,
  password_hash    VARCHAR(255) NOT NULL,
  roll_number      VARCHAR(50) UNIQUE NOT NULL,
  department       VARCHAR(100),
  year_of_study    INT,
  loyalty_points   INT DEFAULT 50,
  wallet_balance   DECIMAL(10,2) DEFAULT 0.00,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── MENU ITEMS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  item_id          INT AUTO_INCREMENT PRIMARY KEY,
  canteen_id       INT NOT NULL,
  name             VARCHAR(100) NOT NULL,
  price            DECIMAL(8,2) NOT NULL,
  category         VARCHAR(50),
  is_veg           TINYINT(1) DEFAULT 1,
  prep_time_mins   INT DEFAULT 10,
  daily_stock_limit INT DEFAULT 50,
  stock_remaining  INT DEFAULT 50,
  is_available     TINYINT(1) DEFAULT 1,
  image_url        VARCHAR(500),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (canteen_id) REFERENCES canteens(canteen_id)
);

-- ── ORDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  order_id         INT AUTO_INCREMENT PRIMARY KEY,
  order_code       VARCHAR(20) UNIQUE NOT NULL,
  student_id       INT NOT NULL,
  canteen_id       INT NOT NULL,
  pickup_slot      VARCHAR(20),
  is_preorder      TINYINT(1) DEFAULT 0,
  preorder_date    DATE,
  total_amount     DECIMAL(10,2) NOT NULL,
  loyalty_used     INT DEFAULT 0,
  qr_code          LONGTEXT,
  status           ENUM('placed','accepted','preparing','ready','picked_up','cancelled') DEFAULT 'placed',
  placed_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ready_at         TIMESTAMP NULL,
  picked_at        TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (canteen_id) REFERENCES canteens(canteen_id)
);

-- ── ORDER ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id    INT AUTO_INCREMENT PRIMARY KEY,
  order_id         INT NOT NULL,
  item_id          INT NOT NULL,
  quantity         INT NOT NULL DEFAULT 1,
  unit_price       DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  payment_id       INT AUTO_INCREMENT PRIMARY KEY,
  order_id         INT NOT NULL,
  method           VARCHAR(50),
  amount           DECIMAL(10,2) NOT NULL,
  status           ENUM('pending','completed','failed') DEFAULT 'pending',
  paid_at          TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ── GRIEVANCES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grievances (
  grievance_id     INT AUTO_INCREMENT PRIMARY KEY,
  ticket_code      VARCHAR(20) NOT NULL,
  order_id         INT NOT NULL,
  student_id       INT NOT NULL,
  canteen_id       INT NOT NULL,
  issue_type       VARCHAR(100),
  description      TEXT,
  status           ENUM('open','in_review','resolved') DEFAULT 'open',
  vendor_reply     TEXT,
  admin_reply      TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (canteen_id) REFERENCES canteens(canteen_id)
);

-- ── REFUNDS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refunds (
  refund_id        INT AUTO_INCREMENT PRIMARY KEY,
  order_id         INT NOT NULL,
  student_id       INT NOT NULL,
  grievance_id     INT,
  amount           DECIMAL(10,2) NOT NULL,
  reason           TEXT,
  status           ENUM('requested','under_review','approved','processed') DEFAULT 'requested',
  requested_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at     TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (grievance_id) REFERENCES grievances(grievance_id)
);

-- ── REVIEWS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  review_id        INT AUTO_INCREMENT PRIMARY KEY,
  order_id         INT NOT NULL,
  student_id       INT NOT NULL,
  canteen_id       INT NOT NULL,
  rating           INT CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (canteen_id) REFERENCES canteens(canteen_id)
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  notification_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  user_role        ENUM('student','vendor','admin') NOT NULL,
  type             VARCHAR(50),
  message          TEXT,
  is_read          TINYINT(1) DEFAULT 0,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── LOYALTY LOG ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_log (
  log_id           INT AUTO_INCREMENT PRIMARY KEY,
  student_id       INT NOT NULL,
  order_id         INT NOT NULL,
  points_earned    INT DEFAULT 0,
  points_redeemed  INT DEFAULT 0,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
