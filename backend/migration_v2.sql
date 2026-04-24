-- ============================================================
--  GourmetGo v2 Migration
--  Feature 1: Delivery to Campus Location
--  Feature 2: Scheduled Bulk Orders
--  Run against gourmetgo_db after the base schema
-- ============================================================

USE gourmetgo_db;

-- ── FEATURE 1: Delivery columns on orders ─────────────────────────────────────

ALTER TABLE orders
  MODIFY COLUMN status
    ENUM('placed','accepted','preparing','ready','out_for_delivery','delivered','picked_up','cancelled')
    DEFAULT 'placed',
  ADD COLUMN fulfillment_type   ENUM('pickup','delivery') DEFAULT 'pickup'   AFTER pickup_slot,
  ADD COLUMN delivery_location  VARCHAR(100)                                  AFTER fulfillment_type,
  ADD COLUMN delivery_fee       DECIMAL(8,2) DEFAULT 0.00                    AFTER delivery_location,
  ADD COLUMN delivery_agent_name VARCHAR(100)                                 AFTER delivery_fee,
  ADD COLUMN delivered_at       DATETIME                                      AFTER delivery_agent_name;

-- ── FEATURE 2: Bulk orders ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bulk_orders (
  bulk_order_id    INT AUTO_INCREMENT PRIMARY KEY,
  bulk_order_code  VARCHAR(20) UNIQUE NOT NULL,
  student_id       INT NOT NULL,
  canteen_id       INT NOT NULL,
  event_name       VARCHAR(200) NOT NULL,
  event_type       VARCHAR(100),
  venue            VARCHAR(200) NOT NULL,
  event_date       DATE NOT NULL,
  event_time       TIME NOT NULL,
  num_participants INT NOT NULL,
  organizer_name   VARCHAR(100) NOT NULL,
  organizer_roll   VARCHAR(50) NOT NULL,
  organizer_phone  VARCHAR(20) NOT NULL,
  department_club  VARCHAR(100),
  additional_notes TEXT,
  status           ENUM('pending','approved','rejected','fulfilled') DEFAULT 'pending',
  admin_note       TEXT,
  rejection_reason TEXT,
  submitted_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at      DATETIME,
  fulfilled_at     DATETIME,
  FOREIGN KEY (student_id)  REFERENCES students(student_id),
  FOREIGN KEY (canteen_id)  REFERENCES canteens(canteen_id)
);

CREATE TABLE IF NOT EXISTS bulk_order_items (
  bulk_item_id         INT AUTO_INCREMENT PRIMARY KEY,
  bulk_order_id        INT NOT NULL,
  item_id              INT NOT NULL,
  quantity             INT NOT NULL,
  special_instructions TEXT,
  FOREIGN KEY (bulk_order_id) REFERENCES bulk_orders(bulk_order_id),
  FOREIGN KEY (item_id)       REFERENCES menu_items(item_id)
);
