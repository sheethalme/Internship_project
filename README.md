# GourmetGo — Smart Canteen Demand Forecasting and Load Optimization System

**Internship Project | Christ University**
**Duration:** 1 March 2026 – 30 August 2026

---

## Project Overview

This project is the design and development of a **Smart Canteen Demand Forecasting and Load Optimization System** aimed at reducing peak-hour congestion and improving operational efficiency within campus dining facilities at Christ University.

The core problem being solved: campus canteens face extreme crowding during peak hours (typically 9–10 AM, 12–1 PM), leading to long queues, food waste from over/under-preparation, and poor student experience. Traditional canteens have no visibility into upcoming demand, no ability to distribute load across time, and no structured feedback loop.

GourmetGo addresses this through:

- **Time-slot based ordering** — students pre-select a 15-minute pickup window, spreading demand across the day instead of it all hitting at once
- **Pickup slot recommendations** — the system analyzes current order distribution per slot and recommends the least-busy windows to students, actively encouraging load balancing
- **Pre-order support** — students can schedule orders for the next day, giving vendors advance demand visibility
- **Real-time capacity indicators** — canteen load is displayed as green/yellow/red so students naturally avoid overcrowded canteens
- **Vendor analytics** — order heatmaps by day and hour let vendors anticipate demand patterns and prep accordingly
- **Grievance and refund management** — structured feedback loop for quality control
- **Loyalty system** — incentivizes students to use the platform consistently, generating richer demand data over time

The system integrates a React frontend, an Express/Node.js REST API backend, and a relational MySQL database — all communicating in real time.

---

## Project Structure

```
gourmetgo/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool (socket-based)
│   ├── controllers/
│   │   ├── authController.js           # Register/login logic for all roles
│   │   ├── menuController.js           # Canteen + menu item CRUD
│   │   ├── orderController.js          # Order placement, tracking, cancellation
│   │   ├── vendorController.js         # Vendor dashboard, order queue, analytics
│   │   ├── adminController.js          # Admin dashboard, grievance/refund mgmt
│   │   ├── paymentController.js        # Simulated payment flow
│   │   ├── refundController.js         # Refund request + processing
│   │   ├── grievanceController.js      # Grievance creation and status updates
│   │   ├── reviewController.js         # Review submission + canteen rating update + admin manage
│   │   └── notificationController.js   # Per-user notifications CRUD (real DB)
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification + role-based access
│   │   └── uploadMiddleware.js    # Multer file upload handler
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── menu.js                # /api/canteens/*, /api/items/*
│   │   ├── orders.js              # /api/orders/*
│   │   ├── vendor.js              # /api/vendor/*
│   │   ├── admin.js               # /api/admin/*
│   │   ├── payments.js            # /api/payments/*
│   │   ├── refunds.js             # /api/refunds/*
│   │   ├── reviews.js             # /api/reviews/*
│   │   ├── grievances.js          # /api/grievances/*
│   │   └── notifications.js       # /api/notifications/*
│   ├── utils/
│   │   ├── loyaltyEngine.js       # Award and redeem loyalty points logic
│   │   ├── qrGenerator.js         # QR code data URI generation
│   │   └── slotUtils.js           # Pickup slot generation + recommendation
│   ├── scripts/
│   │   └── fetchFoodImages.js     # One-time Pexels migration script (updates mockData.js image URLs)
│   ├── schema.sql                 # Run first — creates all 12 tables
│   ├── seed.sql                   # Run second — inserts all demo data
│   ├── seed.js                    # (Alternative) Node.js seed script
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   └── .env                       # Environment variables
│
└── frontend/
    ├── src/
    │   ├── api.js                 # Central API utility (fetch wrapper)
    │   ├── main.jsx               # React entry point
    │   ├── App.jsx                # Route definitions
    │   ├── index.css              # Global styles + Tailwind
    │   │
    │   ├── contexts/              # Global React state (Context API)
    │   │   ├── AuthContext.jsx    # Login, register, logout, user state
    │   │   ├── CartContext.jsx    # Cart state (per canteen)
    │   │   ├── CanteenContext.jsx # Canteen list + menu item state
    │   │   ├── OrdersContext.jsx  # Order placement + order history
    │   │   ├── NotificationsContext.jsx  # In-app notification state
    │   │   ├── ThemeContext.jsx   # Dark/light mode toggle
    │   │   └── ToastContext.jsx   # Toast notification system
    │   │
    │   ├── pages/
    │   │   ├── Landing/
    │   │   │   └── LandingPage.jsx        # Home/marketing page
    │   │   ├── auth/
    │   │   │   ├── StudentAuth.jsx        # Student login + register
    │   │   │   ├── VendorAuth.jsx         # Vendor login
    │   │   │   └── AdminAuth.jsx          # Admin login
    │   │   ├── student/
    │   │   │   ├── StudentLayout.jsx      # Student sidebar + nav
    │   │   │   ├── Dashboard.jsx          # Student home + active orders
    │   │   │   ├── BrowseCanteens.jsx     # Canteen list with capacity
    │   │   │   ├── CanteenMenu.jsx        # Menu with cart actions
    │   │   │   ├── MyOrders.jsx           # Order history + tracking
    │   │   │   ├── LoyaltyPage.jsx        # GourmetCoins dashboard
    │   │   │   ├── GrievancesPage.jsx     # Student grievance list
    │   │   │   ├── RefundsPage.jsx        # Refund request + status
    │   │   │   └── NotificationsPage.jsx  # In-app notifications
    │   │   ├── vendor/
    │   │   │   ├── VendorLayout.jsx       # Vendor sidebar + nav
    │   │   │   ├── VendorDashboard.jsx    # Today's stats
    │   │   │   ├── OrderQueue.jsx         # Live order queue (real-time)
    │   │   │   ├── MenuManagement.jsx     # Add/edit/toggle menu items
    │   │   │   ├── VendorAnalytics.jsx    # Revenue + heatmap charts
    │   │   │   ├── VendorGrievances.jsx   # Grievances from students
    │   │   │   └── VendorRefunds.jsx      # Refund requests
    │   │   └── admin/
    │   │       ├── AdminLayout.jsx        # Admin sidebar + nav
    │   │       ├── AdminDashboard.jsx     # Platform-wide stats
    │   │       ├── AdminOrders.jsx        # All orders across canteens
    │   │       ├── AdminCanteens.jsx      # Manage all canteens
    │   │       ├── AdminGrievances.jsx    # All grievances
    │   │       ├── AdminRefunds.jsx       # All refund requests
    │   │       ├── AdminReviews.jsx       # All reviews
    │   │       └── AdminAnalytics.jsx     # Cross-canteen analytics
    │   │
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── CartDrawer.jsx         # Slide-out cart panel
    │   │   ├── modals/
    │   │   │   ├── CheckoutModal.jsx      # Slot selection + payment
    │   │   │   ├── RatingModal.jsx        # Star rating + comment
    │   │   │   └── GrievanceModal.jsx     # Raise a complaint
    │   │   └── ui/
    │   │       ├── QRCodeDisplay.jsx      # QR code renderer
    │   │       ├── StarRating.jsx         # Star rating input
    │   │       ├── Skeleton.jsx           # Loading skeleton
    │   │       └── Confetti.jsx           # Order success animation
    │   │
    │   └── data/
    │       └── mockData.js        # Static canteen/menu data + helpers (food images from Pexels CDN)
    │
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## Tech Stack — Backend

### Runtime & Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | v24.x | JavaScript runtime for the server |
| **Express.js** | ^4.18.2 | HTTP server framework, routing, middleware |
| **nodemon** | ^3.0.2 | Auto-restarts server on file changes (dev only) |

### Database
| Technology | Version | Purpose |
|-----------|---------|---------|
| **MySQL** | 9.6.0 (Homebrew) | Relational database — stores all persistent data |
| **mysql2** | ^3.6.5 | Node.js MySQL driver with Promise support |

The database connection uses a **connection pool** (not a single connection) so multiple simultaneous requests share a set of up to 10 reusable connections. On macOS with MySQL 9, the connection is made via a **Unix socket** (`/tmp/mysql.sock`) instead of TCP because MySQL 9 uses `caching_sha2_password` which requires SSL for TCP connections.

### Authentication & Security
| Technology | Version | Purpose |
|-----------|---------|---------|
| **jsonwebtoken** | ^9.0.2 | Signs and verifies JWT tokens for session management |
| **bcryptjs** | ^2.4.3 | Hashes passwords before storing; compares on login |

### File Handling
| Technology | Version | Purpose |
|-----------|---------|---------|
| **multer** | ^1.4.5 | Handles `multipart/form-data` for image uploads |

### Utilities
| Technology | Version | Purpose |
|-----------|---------|---------|
| **qrcode** | ^1.5.3 | Generates QR code as a base64 data URI from order code |
| **dotenv** | ^16.3.1 | Loads environment variables from `.env` into `process.env` |
| **cors** | ^2.8.5 | Enables cross-origin requests from the React frontend |

---

## Tech Stack — Frontend

### Core Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^18.x | Component-based UI library |
| **Vite** | ^5.x | Build tool and dev server (faster than CRA) |
| **React Router DOM** | ^6.x | Client-side routing between pages |

### Styling
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Tailwind CSS** | ^3.x | Utility-first CSS framework for all styling |
| **PostCSS** | ^8.x | CSS processor (required by Tailwind) |

### Icons & UI
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Lucide React** | latest | Icon library (all icons in the app) |
| **Victory** | latest | Charts library for analytics (revenue graphs, heatmaps) |

### State Management
React's built-in **Context API** is used for all global state — no Redux or external state library. Each context wraps the relevant section of the app.

### API Communication
A custom `api.js` utility wraps the native browser `fetch` API. It automatically attaches the JWT token from `localStorage` to every request header.

---

## Backend Logic — Detailed

### Server Entry Point (`server.js`)
- Creates an Express app
- Applies global middleware: CORS (allows ports 5173 and 5174), JSON body parser (10mb limit), URL-encoded body parser
- Serves the `/uploads` directory as static files for images
- Mounts all route modules under `/api/...`
- Has a direct inline route for `/api/canteens/:id/slots` (slot recommendation)
- Has a health check at `/api/health`
- Starts listening on port 5001

### Database Connection (`config/db.js`)
- Creates a `mysql2` connection **pool** (not a single connection)
- Uses Unix socket path `/tmp/mysql.sock` to bypass MySQL 9's TCP authentication requirement
- Wraps the pool in `.promise()` so all queries return Promises instead of using callbacks
- `connectionLimit: 10` means up to 10 simultaneous DB connections
- All controllers import this single pool instance

### Authentication System (`controllers/authController.js`)

**JWT Strategy:**
- Tokens are signed with `HS256` algorithm using `JWT_SECRET` from `.env`
- Tokens expire in 7 days
- The token payload contains: `{ id, email, role }` — and for vendors, also `canteen_id`
- No refresh token system — users re-login after 7 days

**Student Registration:**
1. Validates required fields (name, email, password, roll_number)
2. Checks if email or roll_number already exists in `students` table
3. Hashes password with bcrypt (10 salt rounds)
4. Inserts new student with 50 loyalty points as welcome bonus
5. Returns JWT token + student data (password hash excluded)

**Student Login:**
1. Finds student by email
2. Compares submitted password against stored hash using `bcrypt.compare`
3. Returns JWT token + full student record (minus password hash)

**Vendor Login:**
- Same flow as student but queries `vendors` table
- Token includes `canteen_id` so vendor can only access their own canteen's data

**Admin Login:**
- No database lookup — credentials are compared directly against `.env` values (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- Returns a hardcoded admin user object

### Auth Middleware (`middleware/authMiddleware.js`)

**`verifyToken`:**
1. Reads `Authorization: Bearer <token>` header
2. Verifies token signature and expiry using `jwt.verify`
3. Attaches decoded payload to `req.user`
4. Passes to next middleware or returns 401/403

**`roleCheck(...roles)`:**
- Factory function that returns a middleware
- Checks `req.user.role` against allowed roles
- Returns 403 if role doesn't match
- Used like: `router.post('/', verifyToken, roleCheck('student'), handler)`

### Order Placement (`controllers/orderController.js` — `placeOrder`)

This is the most complex operation in the system. It uses a **database transaction** to ensure all-or-nothing execution:

1. **Begin transaction** — gets a dedicated connection from the pool
2. **Validate each item** — for every item in the order:
   - Queries `menu_items` to check it exists, belongs to the right canteen, is available, and has sufficient stock
   - Accumulates total price
3. **Apply loyalty discount** — if `loyalty_used > 0`, calculates discount as `floor(loyalty_used / 100) * 10` (100 coins = ₹10 off)
4. **Calculate delivery fee** — if `fulfillment_type = 'delivery'`, applies a location-based fee: Central Block floors ₹5, Block II ₹10, Block IV ₹15, R&D Block ₹20
5. **Generate order code** — format `GG-YYYY-XXXXX` with a random 5-digit number
6. **Generate QR code** — calls `qrGenerator.js` which uses the `qrcode` library to convert the order code string into a base64 PNG data URI
7. **Insert into `orders`** — stores all order metadata including `fulfillment_type`, `delivery_location`, and `delivery_fee`
8. **Insert into `order_items`** — one row per item with quantity and unit price at time of order (price is captured so future price changes don't affect past orders)
9. **Decrement stock** — `stock_remaining -= quantity` for each item; if stock hits 0, sets `is_available = FALSE`
10. **Log loyalty redemption** — if coins were used, calls `redeemPoints` which deducts from student's balance and logs to `loyalty_log`
11. **Create notifications** — inserts notification rows for both the vendor and the student (labeled `🛵 DELIVERY` or `🏃 Pickup`)
12. **Commit transaction** — all changes are saved atomically
13. If any step fails → **rollback** → no partial data is saved

### Loyalty Engine (`utils/loyaltyEngine.js`)

**`awardPoints(studentId, orderId, amount)`:**
- Called when vendor marks order as `picked_up`
- Formula: `earned = floor(amount / 10)` → ₹1 spent = 0.1 points, ₹10 = 1 point
- Updates `students.loyalty_points += earned`
- Inserts row in `loyalty_log` with `points_earned`

**`redeemPoints(studentId, orderId, pointsToRedeem)`:**
- Called during order placement if student chooses to use coins
- Formula: `discount = floor(pointsToRedeem / 100) * 10` → 100 coins = ₹10 off
- Updates `students.loyalty_points -= pointsToRedeem`
- Inserts row in `loyalty_log` with `points_redeemed`

### Slot Recommendation (`utils/slotUtils.js`)

This is the core **load optimization** feature:

1. Generates all 15-minute time slots between 8:00 AM and 7:00 PM (44 slots)
2. Queries the `orders` table to count how many non-cancelled orders exist per pickup slot for today
3. Maps order counts onto each slot
4. Finds the minimum order count across all slots
5. Marks a slot as `recommended: true` if its count equals the minimum AND the minimum is below 5
6. Returns the full slot list with counts and recommendations

This is what drives the green lightning bolt ⚡ indicators in the checkout modal — students are nudged toward empty slots, distributing kitchen load evenly throughout the day.

### Vendor Order Queue (`controllers/vendorController.js`)

**Order Status Flow:**
```
placed → accepted → preparing → ready → picked_up
                                              ↓
                                    awardPoints() called
```

Each transition is a separate API endpoint. When an order reaches `picked_up`, `awardPoints` is triggered automatically.

**`getLiveOrders`:** Fetches all orders for the vendor's canteen that are NOT in `picked_up` or `cancelled` status. Joins with `students` table to get student name. Joins with `order_items` and `menu_items` to get item names and quantities.

**Vendor Analytics:** Queries for:
- 30-day revenue grouped by date
- Top 5 most-ordered items
- Order heatmap grouped by day-of-week and hour (used to show peak times)
- Fulfillment split (pickup vs delivery counts and delivery revenue)
- Completion stats: total completed, pending, and cancelled orders for all time

### Notification System (`controllers/notificationController.js`)

Serves real per-user notifications stored in the `notifications` table (created by `orderController.js`, `grievanceController.js`, etc.).

- `GET /api/notifications` — returns the 50 most recent notifications for the logged-in user, filtered by their `user_id` and `user_role`
- `PUT /api/notifications/:id/read` — marks a single notification as read (`is_read = 1`)
- `PUT /api/notifications/read-all` — marks all of the user's unread notifications as read in one query
- `DELETE /api/notifications/:id` — permanently removes a notification (dismiss)

All routes require a valid JWT. The controller matches on both `user_id` and `user_role` so a student and a vendor who share the same numeric ID cannot read each other's notifications.

### Admin Reviews (`controllers/reviewController.js`)

Two new admin-only endpoints added:

- `GET /api/admin/reviews?canteen_id=` — returns all reviews joined with student name and canteen name; optionally filtered by `canteen_id`
- `DELETE /api/admin/reviews/:id` — deletes a review and immediately recalculates and updates `canteens.avg_rating` for the affected canteen using `AVG(rating)` from remaining reviews

### Admin Analytics Enhancements (`controllers/adminController.js`)

The `GET /api/admin/analytics` response now includes two additional fields:

- `revenue_7days` — daily revenue and order count for the last 7 days (grouped by `DATE(placed_at)` and `DAYNAME(placed_at)`), used to render the campus revenue bar chart with real data
- `active_orders` per canteen in `canteen_stats` — count of orders currently in an active (non-terminal) state per canteen, used in the canteen comparison card

### Payment System (`controllers/paymentController.js`)

The payment system is **simulated** — no real payment gateway (Razorpay, Stripe, etc.) is integrated.

Flow:
1. `POST /api/payments/initiate` → inserts a `payments` row with `status = 'pending'`
2. `POST /api/payments/confirm` → updates that row to `status = 'completed'` and sets `paid_at = NOW()`, also sets the linked order to `status = 'placed'`

The frontend calls both endpoints automatically after a successful order creation.

### Grievance System

**Student creates grievance:**
1. Verifies the order belongs to the student
2. Generates ticket code in format `GRV-XXXX`
3. Inserts grievance linked to order and canteen
4. Notifies the vendor

**Vendor/Admin replies:**
- Updates `vendor_reply` or `admin_reply` field
- Updates status to `in_review`
- Notifies the student

**Admin processing:**
- Can also process refunds directly from the grievance
- Marks grievances older than 24 hours as urgent in the dashboard query

---

## Frontend Logic — Detailed

### API Utility (`src/api.js`)

A thin wrapper around the browser's `fetch` API:
- Base URL defaults to `http://localhost:5001/api` (overridable via `VITE_API_URL` env var)
- Before every request, reads JWT token from `localStorage` and adds `Authorization: Bearer <token>` header
- If the response status is not OK (2xx), throws an `Error` with the server's error message
- Exports `api.get()`, `api.post()`, `api.put()`, `api.delete()`
- Exports `setToken()` and `clearToken()` for auth state management

### Auth Context (`contexts/AuthContext.jsx`)

Manages the currently logged-in user across the entire app.

**State:** `user` (object), `role` ('student' | 'vendor' | 'admin'), `loading` (boolean)

**On mount:** Reads saved auth from `localStorage` to restore session after page refresh.

**`loginStudent(email, password)`:**
1. Calls `POST /api/auth/student/login`
2. Saves JWT token via `setToken()`
3. Saves user + role to state and `localStorage`

**`registerStudent(formData)`:**
1. Calls `POST /api/auth/student/register` with name, email, password, roll_number, department, year_of_study
2. On success, saves token and user to state

**`loginVendor(email, password)`:**
- Calls `POST /api/auth/vendor/login`
- The returned user object includes `canteen_id` which is embedded in the JWT — this is how the vendor's canteen is known throughout the session

**`loginAdmin(email, password)`:**
- Calls `POST /api/auth/admin/login`

**`logout()`:** Clears user state, removes token and auth from `localStorage`

**`updateUser(updates)`:** Merges updates into current user (used after loyalty point changes, wallet deductions)

### Cart Context (`contexts/CartContext.jsx`)

Manages the shopping cart. Cart is persisted to `localStorage` so it survives page refresh.

**Cart structure:**
```js
{
  [canteen_id]: {
    canteen_id,
    canteen_name,
    items: {
      [item_id]: { item: { ...itemData }, qty: number }
    }
  }
}
```

A student can have items from multiple canteens in their cart simultaneously. Each canteen's items are checked out separately.

**Key functions:**
- `addItem(canteen_id, canteen_name, item, qty)` — adds or increments item
- `removeItem(canteen_id, item_id)` — removes item; if last item in canteen, removes canteen entry
- `updateQty(canteen_id, item_id, qty)` — sets quantity; if 0, removes item
- `getTotal(canteen_id)` — calculates subtotal for one canteen's cart
- `getTotalItems()` — total item count across all canteens (for cart badge)

### Orders Context (`contexts/OrdersContext.jsx`)

**On mount:** If a student JWT token exists in `localStorage`, automatically fetches order history from `GET /api/orders/my` and populates state.

**`placeOrder(orderData)`** — the key function:
1. Calls `POST /api/orders` with canteen_id, pickup_slot, items array, loyalty_used, fulfillment_type, delivery_location
2. On success, calls `POST /api/payments/initiate` then `POST /api/payments/confirm` to simulate payment
3. Builds a normalized order object and adds it to local state
4. Returns the order object so `CheckoutModal` can display the order code and QR

**Order polling:** On mount, and every **8 seconds** thereafter, fetches `GET /api/orders/my` to sync the latest real order statuses from the database. Local state only preserves the `rated` flag (whether the student has already rated the order) — all status fields come from the API. The "Simulate Next Step" debug button has been removed.

**Grievances and Refunds** remain in `localStorage` (not yet wired to the API) — they use the mock data as initial state and persist changes locally.

### Canteen Context (`contexts/CanteenContext.jsx`)

Uses the **static mock data** from `mockData.js` for canteen listings and menus. The item IDs in the mock data (101–117, 201–215, etc.) intentionally match the IDs seeded into the real database, so when a student adds item 101 (Masala Dosa) to cart and places an order, the backend correctly finds item 101 in the `menu_items` table.

Menu item images are served from **Pexels CDN** — all 62 food items have verified image URLs fetched via `backend/scripts/fetchFoodImages.js`. Menu items are no longer cached in `localStorage` (the cache was removed to ensure the latest `mockData.js` images are always used). The context still polls `GET /api/canteens` every 30 seconds to sync live `active_orders`, `capacity_pct`, `avg_rating`, and `status` fields from the database.

Vendor menu operations (toggle availability, restock, add/edit/delete items) update local state. These are not yet wired to the API.

### Checkout Modal (`components/modals/CheckoutModal.jsx`)

The checkout flow has three steps:

**Step 1 — Slot Selection:**
- Calls `generateTimeSlots()` from `mockData.js` to display 15-min pickup windows
- Slots are color-coded: green (< 8 orders), yellow (8–14 orders), red (≥ 15 orders)
- Slots with a ⚡ icon are recommended (least busy)

**Step 2 — Payment:**
- Shows order summary with itemized prices
- If student has ≥ 100 loyalty coins, shows option to apply discount
- Discount formula: `floor(loyalty_points / 100) * 10` = ₹10 off per 100 coins
- Payment methods: UPI, Card, GourmetWallet (wallet balance deducted locally)
- **Delivery fee is location-based** — the dropdown shows all delivery locations with their fee inline:
  - Central Block (all floors): ₹5
  - Block II: ₹10
  - Block IV: ₹15
  - R&D Block: ₹20
  - Fee chip updates live as the student picks a location
- On "Pay" button: calls `await placeOrder(...)` which hits the real API

**Step 3 — Success:**
- Shows order code (e.g. `GG-2026-84321`) from the real API response
- Renders QR code using `QRCodeDisplay` component (generates QR from order code string)
- Triggers confetti animation

### Vendor Order Queue (`pages/vendor/OrderQueue.jsx`)

- On mount, fetches live orders from `GET /api/vendor/orders/live`
- Sets up a `setInterval` to re-fetch every **8 seconds** (auto-refresh without WebSockets)
- Normalizes API response: renames `total_amount` → `total`, `quantity` → `qty` for UI compatibility
- Advance button calls the appropriate API endpoint based on current status:
  - `placed` → `PUT /api/vendor/orders/:id/accept`
  - `accepted` → `PUT /api/vendor/orders/:id/prepare`
  - `preparing` → `PUT /api/vendor/orders/:id/ready`
  - `ready` → `PUT /api/vendor/orders/:id/complete` (triggers loyalty point award)
- Updates local state immediately on button click (optimistic update) so UI feels instant

### Vendor Dashboard (`pages/vendor/VendorDashboard.jsx`)

Previously used hardcoded mock values. Now fully wired to real APIs:

- On mount, calls `GET /api/vendor/dashboard` to populate the four stat cards: **Orders Today**, **Revenue Today**, **Pending**, and **Avg Rating** — all from live database data
- Also fetches `GET /api/vendor/orders/live` (polling every 8 seconds) to display the live queue preview (up to 3 orders shown inline, with a "+N more" count)

### Notifications Context (`contexts/NotificationsContext.jsx`)

Previously stored in `localStorage` as mock data. Now fully wired to the real `notifications` table:

- On mount (and every **15 seconds**), calls `GET /api/notifications` to fetch the 50 most recent notifications for the logged-in user
- `markRead(id)` — optimistic local update + `PUT /api/notifications/:id/read`
- `markAllRead()` — optimistic local update + `PUT /api/notifications/read-all`
- `dismiss(id)` — removes from local state + `DELETE /api/notifications/:id`
- Old `localStorage` cache (`gg_notifs`) is cleared on mount
- Notifications are created server-side by `orderController.js` (order placed/confirmed), `vendorController.js` (order ready for pickup), and `grievanceController.js` (grievance replies)

### Admin Dashboard (`pages/admin/AdminDashboard.jsx`)

Previously used mock/hardcoded stats. Now fully wired to real APIs:

- Calls `GET /api/admin/dashboard` for live KPIs: total orders today, revenue today, active canteens, open grievances, pending refunds
- Calls `GET /api/admin/analytics` for the 7-day campus revenue bar chart (real `revenue_7days` data from DB)
- Falls back to `—` while loading; shows "No order data yet" placeholder if the DB has no orders

### Admin Analytics (`pages/admin/AdminAnalytics.jsx`)

Previously used mock data (`DEMAND_FORECAST`, `HEATMAP_DATA`, `generateRevenueData`). Now fully wired to real APIs:

- Calls `GET /api/admin/analytics` on mount for all three sections
- **Revenue chart** — built from `revenue_7days` array (real daily revenue + order counts for last 7 days)
- **Peak Hours Heatmap** — built from `heatmap` rows (MySQL `DAYOFWEEK` converted to Mon-first index); heatmap intensity scales dynamically to the actual max order count rather than a hardcoded ceiling
- **Canteen Comparison** — shows real `total_orders`, `revenue`, `avg_rating`, and `active_orders` per canteen from `canteen_stats`
- The static "7-Day Demand Forecast" section has been removed (it was mock-only data with no real backing)

### Admin Reviews (`pages/admin/AdminReviews.jsx`)

Previously used `MOCK_REVIEWS` from mockData. Now fully wired to real APIs:

- Loads reviews from `GET /api/admin/reviews` on mount and whenever the canteen filter changes
- Delete calls `DELETE /api/admin/reviews/:id` which also recalculates the canteen's `avg_rating` server-side
- Shows a loading state while fetching

### My Orders — Polling (`pages/student/MyOrders.jsx`)

- The "Simulate Next Step" debug button has been removed — order status is now always fetched live from the API (via `OrdersContext` polling every 8 seconds), so simulating status locally is no longer needed

---

## Database Schema — All 12 Tables

### `students`
| Column | Type | Notes |
|--------|------|-------|
| student_id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(100) | |
| email | VARCHAR(150) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt hash |
| roll_number | VARCHAR(50) UNIQUE | |
| department | VARCHAR(100) | |
| year_of_study | INT | |
| loyalty_points | INT DEFAULT 50 | 50 on signup |
| wallet_balance | DECIMAL(10,2) DEFAULT 0 | GourmetWallet |
| created_at | TIMESTAMP | |

### `vendors`
| Column | Type | Notes |
|--------|------|-------|
| vendor_id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(100) | |
| email | VARCHAR(150) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt hash |
| canteen_id | INT FK → canteens | |
| created_at | TIMESTAMP | |

### `canteens`
| Column | Type | Notes |
|--------|------|-------|
| canteen_id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(100) | |
| description | TEXT | |
| operating_hours | VARCHAR(100) | |
| status | ENUM('open','closed','unavailable') | |
| max_capacity | INT DEFAULT 50 | Used for capacity % calc |
| avg_rating | DECIMAL(3,2) | Recalculated on each review |
| banner_image | VARCHAR(500) | URL |
| created_at | TIMESTAMP | |

### `menu_items`
| Column | Type | Notes |
|--------|------|-------|
| item_id | INT PK | Seeded with specific IDs (101-415) to match frontend |
| canteen_id | INT FK → canteens | |
| name | VARCHAR(100) | |
| price | DECIMAL(8,2) | |
| category | VARCHAR(50) | meals/snacks/beverages/bakery/healthy |
| is_veg | TINYINT(1) | 1 = veg, 0 = non-veg |
| prep_time_mins | INT | |
| daily_stock_limit | INT | Resets on restock |
| stock_remaining | INT | Decremented on order |
| is_available | TINYINT(1) DEFAULT 1 | Auto-set to 0 when stock hits 0 |
| image_url | VARCHAR(500) | Pexels CDN URL (fetched via fetchFoodImages.js script) |
| created_at | TIMESTAMP | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| order_id | INT PK AUTO_INCREMENT | |
| order_code | VARCHAR(20) UNIQUE | Format: GG-YYYY-XXXXX |
| student_id | INT FK → students | |
| canteen_id | INT FK → canteens | |
| pickup_slot | VARCHAR(20) | e.g. "9:30 AM" |
| is_preorder | TINYINT(1) DEFAULT 0 | |
| preorder_date | DATE NULL | |
| total_amount | DECIMAL(10,2) | Final amount after discounts |
| loyalty_used | INT DEFAULT 0 | Points redeemed |
| qr_code | LONGTEXT | Base64 PNG data URI |
| fulfillment_type | ENUM('pickup','delivery') DEFAULT 'pickup' | |
| delivery_location | VARCHAR(200) NULL | e.g. "Block II" |
| delivery_fee | DECIMAL(8,2) DEFAULT 0 | Location-based: ₹5/10/15/20 |
| status | ENUM('placed','accepted','preparing','ready','picked_up','cancelled') | |
| placed_at | TIMESTAMP | Auto-set |
| ready_at | TIMESTAMP NULL | Set when vendor marks ready |
| picked_at | TIMESTAMP NULL | Set when vendor marks picked up |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| order_item_id | INT PK AUTO_INCREMENT | |
| order_id | INT FK → orders | |
| item_id | INT FK → menu_items | |
| quantity | INT | |
| unit_price | DECIMAL(8,2) | Price at time of order (snapshot) |

### `payments`
| Column | Type | Notes |
|--------|------|-------|
| payment_id | INT PK AUTO_INCREMENT | |
| order_id | INT FK → orders | |
| method | VARCHAR(50) | upi/card/wallet |
| amount | DECIMAL(10,2) | |
| status | ENUM('pending','completed','failed') | |
| paid_at | TIMESTAMP NULL | |

### `grievances`
| Column | Type | Notes |
|--------|------|-------|
| grievance_id | INT PK AUTO_INCREMENT | |
| ticket_code | VARCHAR(20) | Format: GRV-XXXX |
| order_id | INT FK → orders | |
| student_id | INT FK → students | |
| canteen_id | INT FK → canteens | |
| issue_type | VARCHAR(100) | quality_issue/wrong_item/etc |
| description | TEXT | |
| status | ENUM('open','in_review','resolved') | |
| vendor_reply | TEXT NULL | |
| admin_reply | TEXT NULL | |
| created_at | TIMESTAMP | |

### `refunds`
| Column | Type | Notes |
|--------|------|-------|
| refund_id | INT PK AUTO_INCREMENT | |
| order_id | INT FK → orders | |
| student_id | INT FK → students | |
| grievance_id | INT FK → grievances NULL | Optional link |
| amount | DECIMAL(10,2) | |
| reason | TEXT | |
| status | ENUM('requested','under_review','approved','processed') | |
| requested_at | TIMESTAMP | |
| processed_at | TIMESTAMP NULL | Set when admin processes |

### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| review_id | INT PK AUTO_INCREMENT | |
| order_id | INT FK → orders | |
| student_id | INT FK → students | |
| canteen_id | INT FK → canteens | |
| rating | INT | 1–5, CHECK constraint |
| comment | TEXT | |
| created_at | TIMESTAMP | |

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| notification_id | INT PK AUTO_INCREMENT | |
| user_id | INT | student_id or vendor_id |
| user_role | ENUM('student','vendor','admin') | |
| type | VARCHAR(50) | order_placed/order_ready/grievance_update/etc |
| message | TEXT | |
| is_read | TINYINT(1) DEFAULT 0 | |
| created_at | TIMESTAMP | |

### `loyalty_log`
| Column | Type | Notes |
|--------|------|-------|
| log_id | INT PK AUTO_INCREMENT | |
| student_id | INT FK → students | |
| order_id | INT FK → orders | |
| points_earned | INT DEFAULT 0 | |
| points_redeemed | INT DEFAULT 0 | |
| created_at | TIMESTAMP | |

---

## Running the Project (For New Contributors / Cloners)

This section is for anyone cloning this repo fresh and running it for the first time.

---

### Prerequisites

#### On macOS
- **Node.js** — install from [nodejs.org](https://nodejs.org) or via Homebrew:
  ```bash
  brew install node
  ```
- **MySQL** — install via Homebrew:
  ```bash
  brew install mysql
  brew services start mysql
  ```
- **MySQL Workbench** — download from [mysql.com/products/workbench](https://www.mysql.com/products/workbench/)
- **Git** — comes pre-installed on macOS, or install via Homebrew: `brew install git`

#### On Windows
- **Node.js** — download the installer from [nodejs.org](https://nodejs.org) (choose LTS version)
- **MySQL** — download the MySQL Installer from [dev.mysql.com/downloads/installer](https://dev.mysql.com/downloads/installer/) — install both MySQL Server and MySQL Workbench from the same installer
- **Git** — download from [git-scm.com](https://git-scm.com)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/gourmetgo.git
cd gourmetgo
```

---

### Step 2 — Configure the Database Connection

#### On macOS (MySQL 9 via Homebrew)

MySQL 9 on macOS uses a Unix socket for local connections. The `db.js` file is already configured for this (`socketPath: '/tmp/mysql.sock'`). You just need to set your credentials.

Create `backend/.env` by copying the example:
```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in your MySQL root password:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD="YourMySQLPassword"
DB_NAME=gourmetgo_db
JWT_SECRET=gourmetgo_secret_key_change_in_prod
PORT=5001
ADMIN_EMAIL=admin@christuniversity.in
ADMIN_PASSWORD=admin2024
```

> **Important:** If your MySQL password contains special characters (like `#`, `@`, `!`), wrap it in double quotes in the `.env` file. Without quotes, dotenv treats `#` as the start of a comment and silently truncates your password.

#### On Windows (MySQL via Installer)

Windows MySQL uses TCP instead of a Unix socket. You need to change one line in `backend/config/db.js`.

Open [backend/config/db.js](backend/config/db.js) and replace:
```js
socketPath: '/tmp/mysql.sock',
```
with:
```js
host: process.env.DB_HOST || 'localhost',
port: 3306,
```

Then create `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD="YourMySQLPassword"
DB_NAME=gourmetgo_db
JWT_SECRET=gourmetgo_secret_key_change_in_prod
PORT=5001
ADMIN_EMAIL=admin@christuniversity.in
ADMIN_PASSWORD=admin2024
```

> **Note for Windows MySQL 8+:** If you get an `Access denied` error from Node.js even though MySQL Workbench connects fine, your root user may use `caching_sha2_password`. Fix it by running this in MySQL Workbench:
> ```sql
> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourPassword';
> FLUSH PRIVILEGES;
> ```

---

### Step 3 — Create the Database and Tables

1. Open **MySQL Workbench** and connect to your local MySQL server
2. Go to **File → Open SQL Script** and open `backend/schema.sql`
3. Click the ⚡ **Execute** button — this creates the `gourmetgo_db` database and all 12 tables
4. In the left panel under **Schemas**, double-click `gourmetgo_db` to select it (it should go **bold**)

---

### Step 4 — Seed Demo Data

1. In MySQL Workbench, go to **File → Open SQL Script** and open `backend/seed.sql`
2. Make sure `gourmetgo_db` is still selected (bold) in the left panel
3. Click ⚡ **Execute** — this inserts 4 canteens, 4 vendors, 62 menu items, and 8 test students

---

### Step 5 — Install Dependencies and Start the Backend

#### macOS
```bash
cd backend
npm install
node server.js
```

#### Windows (Command Prompt)
```cmd
cd backend
npm install
node server.js
```

#### Windows (PowerShell)
```powershell
cd backend
npm install
node server.js
```

You should see:
```
🚀 GourmetGo API running on http://localhost:5001
📊 Environment: development
```

---

### Step 6 — Install Dependencies and Start the Frontend

Open a **new terminal tab/window** (keep the backend running):

#### macOS
```bash
cd frontend
npm install
npm run dev
```

#### Windows
```cmd
cd frontend
npm install
npm run dev
```

Open your browser and go to `http://localhost:5173` (or `5174` if 5173 is already in use).

---

### Step 7 — Verify Everything Works

1. Go to `http://localhost:5001/api/health` in your browser — you should see `{"status":"ok"}`
2. Go to the frontend URL and try logging in:
   - **Student:** `aarav.sharma@christuniversity.in` / `student2024`
   - **Vendor:** `bakery@christuniversity.in` / `bakery123`
   - **Admin:** `admin@christuniversity.in` / `admin2024`

---

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| `Access denied for user 'root'` in Node.js | Password with special chars truncated by dotenv | Wrap password in double quotes in `.env` |
| `Access denied` even with correct password (macOS) | MySQL 9 uses socket auth, Node.js tries TCP | Make sure `socketPath: '/tmp/mysql.sock'` is in `db.js` |
| `Access denied` even with correct password (Windows) | MySQL 8+ uses `caching_sha2_password` | Run the `ALTER USER` command in Workbench (see Step 2) |
| `EADDRINUSE: port 5001 already in use` | Old backend process still running | macOS: `kill -9 $(lsof -ti :5001)` — Windows: `netstat -ano \| findstr :5001` then `taskkill /PID <pid> /F` |
| Frontend shows "Load failed" on login | Backend not running or wrong port in CORS | Make sure backend is running; check that frontend port (5173 or 5174) is in `server.js` CORS list |
| Tables are empty after running seed | Wrong database selected in Workbench | Double-click `gourmetgo_db` in left panel to make it bold before running seed.sql |

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 9 (Homebrew on macOS)
- MySQL Workbench

### Step 1 — Create the database schema
1. Open MySQL Workbench, connect to localhost with root credentials
2. File → Open SQL Script → select `backend/schema.sql`
3. Click ⚡ to run — this creates `gourmetgo_db` and all 12 tables

### Step 2 — Seed demo data
1. In MySQL Workbench, double-click `gourmetgo_db` to select it (it should go bold)
2. File → Open SQL Script → select `backend/seed.sql`
3. Click ⚡ to run — this inserts canteens, vendors, menu items, and 8 test students

### Step 3 — Configure environment
Ensure `backend/.env` contains:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD="YourMySQLPassword"    ← quote it if it contains special characters
DB_NAME=gourmetgo_db
JWT_SECRET=gourmetgo_secret_key_change_in_prod
PORT=5001
ADMIN_EMAIL=admin@christuniversity.in
ADMIN_PASSWORD=admin2024
```

### Step 4 — Start the backend
```bash
cd backend
npm install
node server.js
# → GourmetGo API running on http://localhost:5001
```

### Step 5 — Start the frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173 (or 5174 if 5173 is busy)
```

---

## Login Credentials

### Admin
| Email | Password |
|-------|----------|
| admin@christuniversity.in | admin2024 |

### Vendors
| Email | Password | Canteen |
|-------|----------|---------|
| bakery@christuniversity.in | bakery123 | Christ Bakery |
| michaels@christuniversity.in | michaels123 | Michael's Corner |
| mingos@christuniversity.in | mingos123 | Mingos |
| freshateria@christuniversity.in | fresh123 | Freshateria |

### Students (all password: `student2024`)
| Name | Email | Loyalty | Wallet |
|------|-------|---------|--------|
| Aarav Sharma | aarav.sharma@christuniversity.in | 340 pts | ₹500 |
| Priya Krishnan | priya.k@christuniversity.in | 120 pts | ₹300 |
| Rohan Mathew | rohan.m@christuniversity.in | 50 pts | ₹200 |
| Sneha Iyer | sneha.iyer@christuniversity.in | 200 pts | ₹400 |
| Karthik Nair | karthik.n@christuniversity.in | 80 pts | ₹150 |
| Divya Pillai | divya.p@christuniversity.in | 500 pts | ₹600 |
| Arun Varghese | arun.v@christuniversity.in | 30 pts | ₹100 |
| Meera Thomas | meera.t@christuniversity.in | 150 pts | ₹250 |

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | /student/register | None | name, email, password, roll_number, department, year_of_study | token, student_id, loyalty_points |
| POST | /student/login | None | email, password | token, user object |
| POST | /vendor/login | None | email, password | token, user object (includes canteen_id) |
| POST | /admin/login | None | email, password | token, admin object |

### Canteens & Menu — `/api`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /canteens | None | Returns canteens with live active_orders, capacity_pct, capacity_color |
| GET | /canteens/:id | None | Single canteen + avg_rating |
| GET | /canteens/:id/menu | None | Filter with ?category= and ?veg=true/false |
| GET | /canteens/:id/slots | None | 44 time slots with order counts and recommended flags |
| POST | /items | Vendor | Add menu item |
| PUT | /items/:id | Vendor | Update item fields |
| PUT | /items/:id/toggle | Vendor | Toggle is_available |
| PUT | /items/:id/restock | Vendor | Reset stock_remaining to daily_stock_limit |
| DELETE | /items/:id | Vendor | Delete item |

### Orders — `/api/orders`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | / | Student | Place order — full transaction with stock decrement + notifications |
| GET | /my | Student | All orders for logged-in student with items |
| GET | /:id | Any | Single order with items |
| GET | /:id/track | Any | Status + queue position |
| PUT | /:id/cancel | Student | Only works if status = 'placed' |

### Vendor — `/api/vendor`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /dashboard | Vendor | Today's orders, revenue, pending count, avg rating |
| GET | /orders/live | Vendor | Active orders for vendor's canteen |
| GET | /orders/preorders | Vendor | Tomorrow's pre-orders |
| PUT | /orders/:id/accept | Vendor | placed → accepted |
| PUT | /orders/:id/prepare | Vendor | accepted → preparing |
| PUT | /orders/:id/ready | Vendor | preparing → ready + student notification |
| PUT | /orders/:id/complete | Vendor | ready → picked_up + loyalty points awarded |
| PUT | /canteen/status | Vendor | Set open/closed/unavailable |
| GET | /analytics | Vendor | 30-day revenue, top 5 items, order heatmap |

### Admin — `/api/admin`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /dashboard | Admin | Platform totals: orders, revenue, canteens, grievances, refunds |
| GET | /orders | Admin | All orders — filter by ?canteen_id=&status=&date= |
| PUT | /orders/:id | Admin | Override order status |
| GET | /canteens | Admin | All canteens with active order counts |
| PUT | /canteens/:id | Admin | Update canteen metadata |
| GET | /grievances | Admin | All grievances, urgent ones (>24h open) first |
| PUT | /grievances/:id/reply | Admin | Admin reply → sets status to in_review |
| GET | /refunds | Admin | All refund requests |
| PUT | /refunds/:id/process | Admin | Credit refund amount to student wallet_balance |
| GET | /analytics | Admin | Cross-canteen heatmap + per-canteen revenue stats + loyalty totals |

### Payments — `/api/payments`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | /initiate | Any (token) | Creates pending payment record |
| POST | /confirm | Any (token) | Marks payment complete, sets order to 'placed' |
| GET | /:order_id | Any (token) | Get payment status for an order |

### Grievances — `/api/grievances`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | / | Student | Create grievance tied to order |
| GET | /my | Student | Student's own grievances |
| PUT | /:id | Vendor/Admin | Update status + reply |

### Refunds — `/api/refunds`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | / | Student | Request refund (can link to grievance) |
| GET | /my | Student | Student's own refund requests |

### Reviews — `/api/reviews`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | / | Student | Submit review (order must be picked_up) |
| GET | /canteen/:canteen_id | Any | All reviews for a canteen |

### Notifications — `/api/notifications`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | / | Any (token) | Returns 50 most recent notifications for logged-in user |
| PUT | /read-all | Any (token) | Mark all notifications as read |
| PUT | /:id/read | Any (token) | Mark a single notification as read |
| DELETE | /:id | Any (token) | Dismiss/delete a notification |

### Admin Reviews — `/api/admin/reviews`
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /reviews | Admin | All reviews; filter by ?canteen_id= |
| DELETE | /reviews/:id | Admin | Delete review + recalculate canteen avg_rating |

---

## What Has Been Completed

### Backend
- [x] Express REST API with full routing structure
- [x] MySQL database with 12 normalized tables
- [x] JWT authentication for all three roles (student, vendor, admin)
- [x] bcrypt password hashing
- [x] Role-based access control middleware
- [x] Student registration and login
- [x] Vendor login (admin-created accounts)
- [x] Admin login (env-based credentials)
- [x] Full order placement with DB transaction (validation, stock decrement, QR generation)
- [x] Order tracking with queue position
- [x] Order cancellation (placed status only)
- [x] Simulated payment flow (initiate + confirm)
- [x] Loyalty points engine (earn on pickup, redeem on order)
- [x] Loyalty transaction logging
- [x] Pickup slot recommendation algorithm (load balancing core feature)
- [x] Vendor order queue management (accept → prepare → ready → complete)
- [x] Vendor analytics (30-day revenue, top items, order heatmap)
- [x] Vendor canteen status toggle
- [x] Pre-order support (next-day ordering)
- [x] Grievance system (create, reply, status updates)
- [x] Refund system (request + admin processing → wallet credit)
- [x] Review system with automatic canteen rating recalculation
- [x] In-DB notification system
- [x] Admin dashboard (platform-wide statistics)
- [x] Admin order management
- [x] Admin canteen management
- [x] Admin grievance handling
- [x] Admin refund processing
- [x] Admin analytics (cross-canteen heatmap, loyalty stats) — now uses **real DB data**
- [x] Admin reviews management — list + delete (with avg_rating recalculation)
- [x] Notification system — real DB-backed `/api/notifications` with read/dismiss endpoints
- [x] Location-based delivery fee (Central Block ₹5, Block II ₹10, Block IV ₹15, R&D ₹20)
- [x] Vendor analytics completion stats (completed / pending / cancelled order totals)
- [x] File upload middleware (Multer)
- [x] MySQL socket connection fix for MySQL 9 on macOS
- [x] Pexels CDN food images — all 62 menu items have verified image URLs (via fetchFoodImages.js migration script)
- [x] Graceful broken-image fallback — broken `<img>` tags fade to a dark gradient instead of showing a `?`

### Frontend
- [x] Landing page
- [x] Student authentication (login + register) — connected to real API
- [x] Vendor authentication — connected to real API
- [x] Admin authentication — connected to real API
- [x] Student dashboard
- [x] Canteen browsing with live capacity indicators
- [x] Menu browsing with veg/category filters and search
- [x] Cart (multi-canteen support, localStorage persistence)
- [x] Checkout modal (slot selection → payment → success)
- [x] Order placement — connected to real API (pickup + delivery with location-based fee)
- [x] QR code display on order confirmation
- [x] Confetti animation on order success
- [x] My Orders page with status stepper — polls real status every 8 seconds
- [x] Loyalty page (GourmetCoins dashboard)
- [x] Grievances page
- [x] Refunds page
- [x] Notifications page — wired to real API (polls every 15 seconds)
- [x] Vendor dashboard — wired to real API (live stats + live queue preview)
- [x] Vendor order queue — connected to real API (polls every 8 seconds)
- [x] Order status advancement through all stages
- [x] Vendor menu management UI
- [x] Vendor analytics (charts via Victory library, including real completion stats)
- [x] Vendor grievances view
- [x] Vendor refunds view
- [x] Admin dashboard — wired to real API (live KPIs + 7-day revenue chart)
- [x] Admin orders management
- [x] Admin canteens management
- [x] Admin grievances management
- [x] Admin refunds management
- [x] Admin analytics — wired to real API (real heatmap, real revenue chart, real canteen comparison)
- [x] Admin reviews management — wired to real API (list + delete)
- [x] Dark theme (navy + gold design system)
- [x] Toast notification system
- [x] Responsive layout

---

## What Still Needs To Be Done

### High Priority (Core Functionality)
- [ ] **Wire CanteenContext to real API** — currently uses static mock data. Canteen listings and menu items should be fetched from the database so vendor menu edits are reflected for students in real time
- [ ] **Wire Vendor Menu Management to real API** — add/edit/toggle/restock/delete menu items currently only update local state, not the database
- [ ] **Wire Grievances to real API** — student grievance creation and vendor replies should persist to DB
- [ ] **Wire Refunds to real API** — refund requests should persist to DB
- [ ] **Wire Reviews to real API** — student star rating submission should be saved and update canteen avg_rating in DB
- [ ] **Real slot data in checkout** — `CheckoutModal` uses `generateTimeSlots()` from mockData (static/random counts). It should call `GET /api/canteens/:id/slots` to get real order counts

### Medium Priority (Feature Completeness)
- [ ] **Real payment gateway** — integrate Razorpay or Stripe instead of the simulated flow
- [ ] **WebSocket / SSE for live updates** — vendor queue and student orders currently poll every 8 seconds. Real-time push (Socket.io or Server-Sent Events) would be more efficient and reduce server load
- [ ] **Admin: Create vendor accounts** — currently vendors must be seeded directly into the DB. Admin should be able to create vendor accounts through the UI
- [ ] **Actual demand forecasting model** — the core academic contribution of this project. Should include time-series analysis (e.g. ARIMA, Prophet, or LSTM) trained on order history to predict demand by canteen, day, and hour
- [ ] **Pre-order flow for students** — the UI for scheduling next-day orders needs to be built out fully
- [ ] **Image upload for menu items** — Multer is wired up on the backend but the frontend doesn't have a file picker for menu item images
- [ ] **Student wallet top-up** — students can't add money to their GourmetWallet through the app yet

### Low Priority (Polish & Extras)
- [ ] **Push notifications** — browser push or email notifications when order status changes
- [ ] **Admin: Create/delete canteens** — currently only updates existing canteens
- [ ] **Pagination** — admin order list is limited to 100 rows via SQL LIMIT; needs proper pagination for production
- [ ] **Reorder button stock check** — "Reorder" in MyOrders adds items back to cart but does not verify current stock availability first
- [ ] **JWT refresh tokens** — tokens expire in 7 days with no refresh mechanism; user is simply logged out
- [ ] **Input validation** — backend does basic field checking but no schema-level validation (e.g. Joi or Zod)
- [ ] **Rate limiting** — no rate limiting on auth endpoints; needed before production deployment
- [ ] **Production deployment** — no deployment config (Docker, PM2, nginx, etc.)
- [ ] **Environment-based CORS** — CORS origins are hardcoded to localhost ports; needs to be dynamic for production
