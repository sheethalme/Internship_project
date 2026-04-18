// ─── CANTEENS ─────────────────────────────────────────────────────────────────
export const CANTEENS = [
  {
    canteen_id: 1,
    name: 'Christ Bakery',
    description: 'South Indian breakfast, baked goods & healthy bites',
    operating_hours: '7:30 AM – 6:00 PM',
    status: 'open',
    max_capacity: 20,
    avg_rating: 4.3,
    banner_image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    cuisine: 'South Indian & Bakery',
    active_orders: 6,
  },
  {
    canteen_id: 2,
    name: "Michael's Corner",
    description: 'Snacks, rolls, burgers & freshly brewed beverages',
    operating_hours: '8:00 AM – 7:00 PM',
    status: 'open',
    max_capacity: 20,
    avg_rating: 4.1,
    banner_image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80',
    cuisine: 'Snacks & Beverages',
    active_orders: 11,
  },
  {
    canteen_id: 3,
    name: 'Mingos',
    description: 'Continental favourites — pasta, fries, wraps & smoothies',
    operating_hours: '9:00 AM – 8:00 PM',
    status: 'open',
    max_capacity: 20,
    avg_rating: 4.5,
    banner_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    cuisine: 'Continental',
    active_orders: 15,
  },
  {
    canteen_id: 4,
    name: 'Freshateria',
    description: 'Clean eating — salads, bowls, protein shakes & detox juices',
    operating_hours: '8:00 AM – 6:00 PM',
    status: 'open',
    max_capacity: 20,
    avg_rating: 4.4,
    banner_image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    cuisine: 'Healthy & Clean',
    active_orders: 4,
  },
];

// ─── MENU ITEMS ───────────────────────────────────────────────────────────────
export const MENU_ITEMS = {
  1: [
    { item_id: 101, canteen_id: 1, name: 'Masala Dosa', price: 40, category: 'meals', is_veg: true, prep_time_mins: 8, daily_stock_limit: 50, stock_remaining: 38, is_available: true, avg_rating: 4.6, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
    { item_id: 102, canteen_id: 1, name: 'Poori', price: 30, category: 'meals', is_veg: true, prep_time_mins: 7, daily_stock_limit: 40, stock_remaining: 28, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80' },
    { item_id: 103, canteen_id: 1, name: 'Idly (2 pcs)', price: 25, category: 'meals', is_veg: true, prep_time_mins: 5, daily_stock_limit: 60, stock_remaining: 44, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
    { item_id: 104, canteen_id: 1, name: 'Vada', price: 20, category: 'snacks', is_veg: true, prep_time_mins: 6, daily_stock_limit: 40, stock_remaining: 30, is_available: true, avg_rating: 4.1, image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80' },
    { item_id: 105, canteen_id: 1, name: 'Upma', price: 30, category: 'meals', is_veg: true, prep_time_mins: 6, daily_stock_limit: 30, stock_remaining: 18, is_available: true, avg_rating: 4.0, image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
    { item_id: 106, canteen_id: 1, name: 'Pongal', price: 35, category: 'meals', is_veg: true, prep_time_mins: 7, daily_stock_limit: 30, stock_remaining: 22, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
    { item_id: 107, canteen_id: 1, name: 'Bread Omelette', price: 40, category: 'meals', is_veg: false, prep_time_mins: 8, daily_stock_limit: 25, stock_remaining: 15, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80' },
    { item_id: 108, canteen_id: 1, name: 'Mini Idly (6 pcs)', price: 35, category: 'meals', is_veg: true, prep_time_mins: 5, daily_stock_limit: 40, stock_remaining: 32, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80' },
    { item_id: 109, canteen_id: 1, name: 'Croissant', price: 45, category: 'bakery', is_veg: true, prep_time_mins: 3, daily_stock_limit: 20, stock_remaining: 12, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },
    { item_id: 110, canteen_id: 1, name: 'Banana Bread', price: 50, category: 'bakery', is_veg: true, prep_time_mins: 2, daily_stock_limit: 15, stock_remaining: 9, is_available: true, avg_rating: 4.6, image_url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80' },
    { item_id: 111, canteen_id: 1, name: 'Tea Cake', price: 30, category: 'bakery', is_veg: true, prep_time_mins: 2, daily_stock_limit: 20, stock_remaining: 14, is_available: true, avg_rating: 4.1, image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80' },
    { item_id: 112, canteen_id: 1, name: 'Protein Cookies', price: 60, category: 'healthy', is_veg: true, prep_time_mins: 1, daily_stock_limit: 30, stock_remaining: 20, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
    { item_id: 113, canteen_id: 1, name: 'Protein Bars', price: 80, category: 'healthy', is_veg: true, prep_time_mins: 1, daily_stock_limit: 25, stock_remaining: 18, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1622484212850-5a4b4a0e7e5a?w=400&q=80' },
    { item_id: 114, canteen_id: 1, name: 'Coffee', price: 30, category: 'beverages', is_veg: true, prep_time_mins: 4, daily_stock_limit: 80, stock_remaining: 60, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80' },
    { item_id: 115, canteen_id: 1, name: 'Tea', price: 20, category: 'beverages', is_veg: true, prep_time_mins: 3, daily_stock_limit: 80, stock_remaining: 65, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
    { item_id: 116, canteen_id: 1, name: 'Cold Coffee', price: 60, category: 'beverages', is_veg: true, prep_time_mins: 5, daily_stock_limit: 40, stock_remaining: 28, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
    { item_id: 117, canteen_id: 1, name: 'Vanilla Milkshake', price: 70, category: 'beverages', is_veg: true, prep_time_mins: 5, daily_stock_limit: 30, stock_remaining: 20, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80' },
  ],
  2: [
    { item_id: 201, canteen_id: 2, name: 'Bun Samosa', price: 25, category: 'snacks', is_veg: true, prep_time_mins: 5, daily_stock_limit: 40, stock_remaining: 28, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
    { item_id: 202, canteen_id: 2, name: 'Blueberry Muffin', price: 55, category: 'bakery', is_veg: true, prep_time_mins: 2, daily_stock_limit: 20, stock_remaining: 13, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
    { item_id: 203, canteen_id: 2, name: 'Chocolate Muffin', price: 55, category: 'bakery', is_veg: true, prep_time_mins: 2, daily_stock_limit: 20, stock_remaining: 10, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
    { item_id: 204, canteen_id: 2, name: 'Brownie', price: 60, category: 'snacks', is_veg: true, prep_time_mins: 2, daily_stock_limit: 25, stock_remaining: 16, is_available: true, avg_rating: 4.6, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80' },
    { item_id: 205, canteen_id: 2, name: 'French Toast', price: 50, category: 'meals', is_veg: true, prep_time_mins: 8, daily_stock_limit: 25, stock_remaining: 17, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80' },
    { item_id: 206, canteen_id: 2, name: 'Veg Sandwich', price: 45, category: 'snacks', is_veg: true, prep_time_mins: 7, daily_stock_limit: 30, stock_remaining: 20, is_available: true, avg_rating: 4.1, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80' },
    { item_id: 207, canteen_id: 2, name: 'Paneer Roll', price: 70, category: 'snacks', is_veg: true, prep_time_mins: 10, daily_stock_limit: 25, stock_remaining: 15, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80' },
    { item_id: 208, canteen_id: 2, name: 'Egg Roll', price: 65, category: 'snacks', is_veg: false, prep_time_mins: 10, daily_stock_limit: 20, stock_remaining: 14, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80' },
    { item_id: 209, canteen_id: 2, name: 'Chicken Roll', price: 80, category: 'snacks', is_veg: false, prep_time_mins: 12, daily_stock_limit: 20, stock_remaining: 12, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80' },
    { item_id: 210, canteen_id: 2, name: 'Aloo Tikki Burger', price: 60, category: 'snacks', is_veg: true, prep_time_mins: 10, daily_stock_limit: 25, stock_remaining: 16, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
    { item_id: 211, canteen_id: 2, name: 'Chicken Burger', price: 90, category: 'snacks', is_veg: false, prep_time_mins: 12, daily_stock_limit: 20, stock_remaining: 13, is_available: true, avg_rating: 4.6, image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
    { item_id: 212, canteen_id: 2, name: 'Masala Tea', price: 25, category: 'beverages', is_veg: true, prep_time_mins: 4, daily_stock_limit: 60, stock_remaining: 45, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
    { item_id: 213, canteen_id: 2, name: 'Lemon Tea', price: 30, category: 'beverages', is_veg: true, prep_time_mins: 4, daily_stock_limit: 50, stock_remaining: 38, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
    { item_id: 214, canteen_id: 2, name: 'Coffee', price: 35, category: 'beverages', is_veg: true, prep_time_mins: 4, daily_stock_limit: 60, stock_remaining: 44, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80' },
    { item_id: 215, canteen_id: 2, name: 'Cold Coffee', price: 65, category: 'beverages', is_veg: true, prep_time_mins: 5, daily_stock_limit: 40, stock_remaining: 28, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
  ],
  3: [
    { item_id: 301, canteen_id: 3, name: 'Fries', price: 60, category: 'snacks', is_veg: true, prep_time_mins: 8, daily_stock_limit: 40, stock_remaining: 28, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&q=80' },
    { item_id: 302, canteen_id: 3, name: 'Garlic Bread', price: 55, category: 'snacks', is_veg: true, prep_time_mins: 7, daily_stock_limit: 30, stock_remaining: 20, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&q=80' },
    { item_id: 303, canteen_id: 3, name: 'Pasta (Arrabbiata)', price: 90, category: 'meals', is_veg: true, prep_time_mins: 12, daily_stock_limit: 25, stock_remaining: 16, is_available: true, avg_rating: 4.6, image_url: 'https://images.unsplash.com/photo-1567608286699-8f2e96af9540?w=400&q=80' },
    { item_id: 304, canteen_id: 3, name: 'Mac & Cheese', price: 95, category: 'meals', is_veg: true, prep_time_mins: 10, daily_stock_limit: 20, stock_remaining: 12, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&q=80' },
    { item_id: 305, canteen_id: 3, name: 'Noodles', price: 80, category: 'meals', is_veg: true, prep_time_mins: 10, daily_stock_limit: 25, stock_remaining: 17, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
    { item_id: 306, canteen_id: 3, name: 'Grilled Sandwich', price: 70, category: 'snacks', is_veg: true, prep_time_mins: 8, daily_stock_limit: 25, stock_remaining: 18, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80' },
    { item_id: 307, canteen_id: 3, name: 'Veg Wrap', price: 75, category: 'snacks', is_veg: true, prep_time_mins: 8, daily_stock_limit: 25, stock_remaining: 15, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80' },
    { item_id: 308, canteen_id: 3, name: 'Chicken Wrap', price: 100, category: 'snacks', is_veg: false, prep_time_mins: 10, daily_stock_limit: 20, stock_remaining: 12, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1565299543923-37de43cb1dbd?w=400&q=80' },
    { item_id: 309, canteen_id: 3, name: 'Nachos', price: 85, category: 'snacks', is_veg: true, prep_time_mins: 7, daily_stock_limit: 25, stock_remaining: 16, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80' },
    { item_id: 310, canteen_id: 3, name: 'Boiled Eggs (2 pcs)', price: 30, category: 'snacks', is_veg: false, prep_time_mins: 5, daily_stock_limit: 30, stock_remaining: 22, is_available: true, avg_rating: 4.0, image_url: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80' },
    { item_id: 311, canteen_id: 3, name: 'Brownie Sundae', price: 110, category: 'snacks', is_veg: true, prep_time_mins: 5, daily_stock_limit: 15, stock_remaining: 8, is_available: true, avg_rating: 4.8, image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
    { item_id: 312, canteen_id: 3, name: 'Iced Tea', price: 50, category: 'beverages', is_veg: true, prep_time_mins: 3, daily_stock_limit: 40, stock_remaining: 28, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
    { item_id: 313, canteen_id: 3, name: 'Iced Chocolate', price: 65, category: 'beverages', is_veg: true, prep_time_mins: 4, daily_stock_limit: 30, stock_remaining: 20, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
    { item_id: 314, canteen_id: 3, name: 'Cold Coffee', price: 70, category: 'beverages', is_veg: true, prep_time_mins: 4, daily_stock_limit: 35, stock_remaining: 24, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
    { item_id: 315, canteen_id: 3, name: 'Mango Smoothie', price: 75, category: 'beverages', is_veg: true, prep_time_mins: 5, daily_stock_limit: 30, stock_remaining: 20, is_available: true, avg_rating: 4.6, image_url: 'https://images.unsplash.com/photo-1553530979-7ee46c8e7a44?w=400&q=80' },
  ],
  4: [
    { item_id: 401, canteen_id: 4, name: 'Egg Salad', price: 70, category: 'healthy', is_veg: false, prep_time_mins: 7, daily_stock_limit: 20, stock_remaining: 14, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
    { item_id: 402, canteen_id: 4, name: 'Hummus Sandwich', price: 80, category: 'healthy', is_veg: true, prep_time_mins: 6, daily_stock_limit: 20, stock_remaining: 13, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80' },
    { item_id: 403, canteen_id: 4, name: 'Avocado Toast', price: 95, category: 'healthy', is_veg: true, prep_time_mins: 7, daily_stock_limit: 15, stock_remaining: 9, is_available: true, avg_rating: 4.6, image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&q=80' },
    { item_id: 404, canteen_id: 4, name: 'PB Banana Sandwich', price: 75, category: 'healthy', is_veg: true, prep_time_mins: 5, daily_stock_limit: 20, stock_remaining: 15, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80' },
    { item_id: 405, canteen_id: 4, name: 'Oat Bowl', price: 85, category: 'healthy', is_veg: true, prep_time_mins: 5, daily_stock_limit: 20, stock_remaining: 14, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1517673408919-bfcedf5b4367?w=400&q=80' },
    { item_id: 406, canteen_id: 4, name: 'Acai Bowl', price: 120, category: 'healthy', is_veg: true, prep_time_mins: 8, daily_stock_limit: 15, stock_remaining: 9, is_available: true, avg_rating: 4.7, image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80' },
    { item_id: 407, canteen_id: 4, name: 'Greek Yogurt Parfait', price: 100, category: 'healthy', is_veg: true, prep_time_mins: 5, daily_stock_limit: 15, stock_remaining: 10, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
    { item_id: 408, canteen_id: 4, name: 'Quinoa Salad', price: 110, category: 'healthy', is_veg: true, prep_time_mins: 8, daily_stock_limit: 15, stock_remaining: 10, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
    { item_id: 409, canteen_id: 4, name: 'Fruit Bowl', price: 80, category: 'healthy', is_veg: true, prep_time_mins: 4, daily_stock_limit: 20, stock_remaining: 15, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=80' },
    { item_id: 410, canteen_id: 4, name: 'Chia Pudding', price: 90, category: 'healthy', is_veg: true, prep_time_mins: 2, daily_stock_limit: 15, stock_remaining: 11, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&q=80' },
    { item_id: 411, canteen_id: 4, name: 'Granola Bar', price: 55, category: 'snacks', is_veg: true, prep_time_mins: 1, daily_stock_limit: 30, stock_remaining: 22, is_available: true, avg_rating: 4.1, image_url: 'https://images.unsplash.com/photo-1622484212850-5a4b4a0e7e5a?w=400&q=80' },
    { item_id: 412, canteen_id: 4, name: 'Protein Shake', price: 120, category: 'beverages', is_veg: true, prep_time_mins: 5, daily_stock_limit: 20, stock_remaining: 14, is_available: true, avg_rating: 4.5, image_url: 'https://images.unsplash.com/photo-1553530979-7ee46c8e7a44?w=400&q=80' },
    { item_id: 413, canteen_id: 4, name: 'Green Smoothie', price: 95, category: 'beverages', is_veg: true, prep_time_mins: 5, daily_stock_limit: 20, stock_remaining: 14, is_available: true, avg_rating: 4.4, image_url: 'https://images.unsplash.com/photo-1510970438969-ec3a4d46e33b?w=400&q=80' },
    { item_id: 414, canteen_id: 4, name: 'Detox Juice', price: 75, category: 'beverages', is_veg: true, prep_time_mins: 5, daily_stock_limit: 20, stock_remaining: 15, is_available: true, avg_rating: 4.3, image_url: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80' },
    { item_id: 415, canteen_id: 4, name: 'Energy Bites', price: 65, category: 'snacks', is_veg: true, prep_time_mins: 1, daily_stock_limit: 25, stock_remaining: 18, is_available: true, avg_rating: 4.2, image_url: 'https://images.unsplash.com/photo-1622484212850-5a4b4a0e7e5a?w=400&q=80' },
  ],
};

// ─── COMBO PAIRINGS ──────────────────────────────────────────────────────────
export const COMBOS = {
  101: { item_id: 114, name: 'Coffee' },
  103: { item_id: 114, name: 'Coffee' },
  109: { item_id: 116, name: 'Cold Coffee' },
  110: { item_id: 115, name: 'Tea' },
  204: { item_id: 214, name: 'Coffee' },
  209: { item_id: 215, name: 'Cold Coffee' },
  211: { item_id: 215, name: 'Cold Coffee' },
  301: { item_id: 312, name: 'Iced Tea' },
  303: { item_id: 314, name: 'Cold Coffee' },
  311: { item_id: 313, name: 'Iced Chocolate' },
  405: { item_id: 413, name: 'Green Smoothie' },
  406: { item_id: 413, name: 'Green Smoothie' },
  408: { item_id: 414, name: 'Detox Juice' },
};

// ─── VENDOR CREDENTIALS ───────────────────────────────────────────────────────
export const VENDORS = [
  { vendor_id: 1, name: 'Ravi Kumar', email: 'bakery@christuniversity.in', password: 'bakery123', canteen_id: 1 },
  { vendor_id: 2, name: 'Michael D\'Souza', email: 'michaels@christuniversity.in', password: 'michaels123', canteen_id: 2 },
  { vendor_id: 3, name: 'Priya Nair', email: 'mingos@christuniversity.in', password: 'mingos123', canteen_id: 3 },
  { vendor_id: 4, name: 'Anita Sharma', email: 'freshateria@christuniversity.in', password: 'fresh123', canteen_id: 4 },
];

// ─── ADMIN CREDENTIALS ───────────────────────────────────────────────────────
export const ADMIN_CREDS = {
  email: 'admin@christuniversity.in',
  password: 'admin2024',
  name: 'Dr. Suresh Mathew',
};

// ─── MOCK STUDENT ─────────────────────────────────────────────────────────────
export const MOCK_STUDENT = {
  student_id: 1001,
  name: 'Aarav Sharma',
  email: 'aarav.sharma@christuniversity.in',
  roll_number: 'CHR2024CS001',
  department: 'Computer Science',
  year_of_study: 2,
  loyalty_points: 340,
  wallet_balance: 500,
};

// ─── MOCK PAST ORDERS ────────────────────────────────────────────────────────
const now = new Date();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

export const MOCK_ORDERS = [
  {
    order_id: 10001, order_code: 'GG-2025-00142', student_id: 1001,
    canteen_id: 1, canteen_name: 'Christ Bakery',
    status: 'picked_up', pickup_slot: '9:00 AM', is_preorder: false,
    total_amount: 100, loyalty_used: 0,
    placed_at: daysAgo(0.1),
    items: [
      { item_id: 101, name: 'Masala Dosa', quantity: 1, unit_price: 40 },
      { item_id: 114, name: 'Coffee', quantity: 1, unit_price: 30 },
      { item_id: 109, name: 'Croissant', quantity: 1, unit_price: 45 },
    ],
    payment_method: 'upi', rated: false,
  },
  {
    order_id: 10002, order_code: 'GG-2025-00139', student_id: 1001,
    canteen_id: 2, canteen_name: "Michael's Corner",
    status: 'ready', pickup_slot: '11:30 AM', is_preorder: false,
    total_amount: 155, loyalty_used: 0,
    placed_at: daysAgo(0.05),
    items: [
      { item_id: 211, name: 'Chicken Burger', quantity: 1, unit_price: 90 },
      { item_id: 215, name: 'Cold Coffee', quantity: 1, unit_price: 65 },
    ],
    payment_method: 'wallet', rated: false,
  },
  {
    order_id: 10003, order_code: 'GG-2025-00128', student_id: 1001,
    canteen_id: 3, canteen_name: 'Mingos',
    status: 'picked_up', pickup_slot: '1:00 PM', is_preorder: false,
    total_amount: 225, loyalty_used: 100,
    placed_at: daysAgo(2),
    items: [
      { item_id: 303, name: 'Pasta (Arrabbiata)', quantity: 1, unit_price: 90 },
      { item_id: 301, name: 'Fries', quantity: 1, unit_price: 60 },
      { item_id: 314, name: 'Cold Coffee', quantity: 1, unit_price: 70 },
    ],
    payment_method: 'upi', rated: true,
  },
  {
    order_id: 10004, order_code: 'GG-2025-00117', student_id: 1001,
    canteen_id: 4, canteen_name: 'Freshateria',
    status: 'picked_up', pickup_slot: '12:15 PM', is_preorder: false,
    total_amount: 215, loyalty_used: 0,
    placed_at: daysAgo(3),
    items: [
      { item_id: 406, name: 'Acai Bowl', quantity: 1, unit_price: 120 },
      { item_id: 413, name: 'Green Smoothie', quantity: 1, unit_price: 95 },
    ],
    payment_method: 'wallet', rated: true,
  },
  {
    order_id: 10005, order_code: 'GG-2025-00105', student_id: 1001,
    canteen_id: 1, canteen_name: 'Christ Bakery',
    status: 'picked_up', pickup_slot: '8:30 AM', is_preorder: false,
    total_amount: 90, loyalty_used: 0,
    placed_at: daysAgo(5),
    items: [
      { item_id: 103, name: 'Idly (2 pcs)', quantity: 2, unit_price: 25 },
      { item_id: 115, name: 'Tea', quantity: 2, unit_price: 20 },
    ],
    payment_method: 'upi', rated: true,
  },
  {
    order_id: 10006, order_code: 'GG-2025-00098', student_id: 1001,
    canteen_id: 2, canteen_name: "Michael's Corner",
    status: 'picked_up', pickup_slot: '10:45 AM', is_preorder: false,
    total_amount: 145, loyalty_used: 0,
    placed_at: daysAgo(7),
    items: [
      { item_id: 209, name: 'Chicken Roll', quantity: 1, unit_price: 80 },
      { item_id: 204, name: 'Brownie', quantity: 1, unit_price: 60 },
    ],
    payment_method: 'wallet', rated: true,
  },
  {
    order_id: 10007, order_code: 'GG-2025-00087', student_id: 1001,
    canteen_id: 3, canteen_name: 'Mingos',
    status: 'picked_up', pickup_slot: '2:00 PM', is_preorder: false,
    total_amount: 195, loyalty_used: 0,
    placed_at: daysAgo(9),
    items: [
      { item_id: 304, name: 'Mac & Cheese', quantity: 1, unit_price: 95 },
      { item_id: 312, name: 'Iced Tea', quantity: 2, unit_price: 50 },
    ],
    payment_method: 'upi', rated: false,
  },
  {
    order_id: 10008, order_code: 'GG-2025-00076', student_id: 1001,
    canteen_id: 4, canteen_name: 'Freshateria',
    status: 'picked_up', pickup_slot: '11:00 AM', is_preorder: false,
    total_amount: 175, loyalty_used: 100,
    placed_at: daysAgo(12),
    items: [
      { item_id: 403, name: 'Avocado Toast', quantity: 1, unit_price: 95 },
      { item_id: 414, name: 'Detox Juice', quantity: 1, unit_price: 75 },
    ],
    payment_method: 'upi', rated: true,
  },
];

// ─── MOCK GRIEVANCES ──────────────────────────────────────────────────────────
export const MOCK_GRIEVANCES = [
  {
    grievance_id: 1, ticket_code: 'GRV-0089', order_id: 10003,
    student_id: 1001, canteen_id: 3, canteen_name: 'Mingos',
    issue_type: 'quality_issue', description: 'The pasta was undercooked and had a strange smell.',
    status: 'resolved', vendor_reply: 'We apologize for the inconvenience. We have spoken to our chef. Please accept a complimentary item on your next order.',
    admin_reply: null, created_at: daysAgo(2),
  },
  {
    grievance_id: 2, ticket_code: 'GRV-0091', order_id: 10006,
    student_id: 1001, canteen_id: 2, canteen_name: "Michael's Corner",
    issue_type: 'wrong_item', description: 'I ordered a Chicken Roll but received an Egg Roll.',
    status: 'in_review', vendor_reply: null,
    admin_reply: null, created_at: daysAgo(7),
  },
];

// ─── MOCK REFUNDS ─────────────────────────────────────────────────────────────
export const MOCK_REFUNDS = [
  {
    refund_id: 1, order_id: 10006, student_id: 1001, grievance_id: 2,
    amount: 80, status: 'under_review', reason: 'Wrong item delivered',
    requested_at: daysAgo(7), processed_at: null,
  },
];

// ─── MOCK NOTIFICATIONS ───────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  { notification_id: 1, type: 'order_ready', message: '🔔 Your order GG-2025-00139 is ready for pickup at Michael\'s Corner!', is_read: false, created_at: new Date(now - 5 * 60000).toISOString() },
  { notification_id: 2, type: 'order_accepted', message: '🍳 Your order GG-2025-00139 has been accepted by Michael\'s Corner.', is_read: false, created_at: new Date(now - 12 * 60000).toISOString() },
  { notification_id: 3, type: 'grievance_update', message: '📋 Your grievance GRV-0089 has been resolved by Mingos.', is_read: true, created_at: daysAgo(2) },
  { notification_id: 4, type: 'loyalty_earned', message: '🪙 You earned 22 GourmetCoins from your last order!', is_read: true, created_at: daysAgo(2) },
  { notification_id: 5, type: 'order_placed', message: '✅ Order GG-2025-00128 confirmed at Mingos. Pickup at 1:00 PM.', is_read: true, created_at: daysAgo(2) },
];

// ─── MOCK REVIEWS ────────────────────────────────────────────────────────────
export const MOCK_REVIEWS = [
  { review_id: 1, order_id: 10003, student_id: 1001, canteen_id: 3, rating: 5, comment: 'Great food, loved the Brownie Sundae! Will definitely order again.', created_at: daysAgo(2), student_name: 'Aarav S.' },
  { review_id: 2, order_id: 10004, student_id: 1001, canteen_id: 4, rating: 5, comment: 'Acai Bowl was absolutely amazing, super fresh ingredients!', created_at: daysAgo(3), student_name: 'Aarav S.' },
  { review_id: 3, order_id: 10005, student_id: 1001, canteen_id: 1, rating: 4, comment: 'Classic Christ Bakery breakfast, always reliable.', created_at: daysAgo(5), student_name: 'Aarav S.' },
  { review_id: 4, order_id: 10006, student_id: 1001, canteen_id: 2, rating: 3, comment: 'Got the wrong order but the brownie was good.', created_at: daysAgo(7), student_name: 'Aarav S.' },
];

// ─── VENDOR QUEUE ORDERS ─────────────────────────────────────────────────────
export const VENDOR_QUEUE_ORDERS = {
  1: [
    { order_id: 20001, order_code: 'GG-2025-00145', student_name: 'Priya K.', items: [{ name: 'Masala Dosa', qty: 1 }, { name: 'Coffee', qty: 1 }], pickup_slot: '9:30 AM', total: 70, status: 'accepted', placed_at: new Date(now - 8 * 60000).toISOString() },
    { order_id: 20002, order_code: 'GG-2025-00146', student_name: 'Rohan M.', items: [{ name: 'Idly (2 pcs)', qty: 2 }, { name: 'Tea', qty: 1 }], pickup_slot: '9:45 AM', total: 70, status: 'placed', placed_at: new Date(now - 3 * 60000).toISOString() },
    { order_id: 20003, order_code: 'GG-2025-00147', student_name: 'Sneha R.', items: [{ name: 'Croissant', qty: 1 }, { name: 'Cold Coffee', qty: 1 }], pickup_slot: '10:00 AM', total: 105, status: 'placed', placed_at: new Date(now - 1 * 60000).toISOString() },
  ],
  2: [
    { order_id: 20004, order_code: 'GG-2025-00148', student_name: 'Karthik P.', items: [{ name: 'Chicken Burger', qty: 1 }, { name: 'Cold Coffee', qty: 1 }], pickup_slot: '11:15 AM', total: 155, status: 'preparing', placed_at: new Date(now - 15 * 60000).toISOString() },
    { order_id: 20005, order_code: 'GG-2025-00149', student_name: 'Aarav S.', items: [{ name: 'Chicken Burger', qty: 1 }, { name: 'Cold Coffee', qty: 1 }], pickup_slot: '11:30 AM', total: 155, status: 'accepted', placed_at: new Date(now - 10 * 60000).toISOString() },
    { order_id: 20006, order_code: 'GG-2025-00150', student_name: 'Divya L.', items: [{ name: 'Paneer Roll', qty: 2 }], pickup_slot: '11:45 AM', total: 140, status: 'placed', placed_at: new Date(now - 2 * 60000).toISOString() },
  ],
  3: [
    { order_id: 20007, order_code: 'GG-2025-00151', student_name: 'Arun V.', items: [{ name: 'Pasta (Arrabbiata)', qty: 1 }, { name: 'Iced Tea', qty: 1 }], pickup_slot: '1:00 PM', total: 140, status: 'preparing', placed_at: new Date(now - 20 * 60000).toISOString() },
  ],
  4: [],
};

// ─── MOCK ANALYTICS DATA ─────────────────────────────────────────────────────
export const generateRevenueData = (days = 7) => {
  const data = [];
  const base = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < days; i++) {
    data.push({
      day: base[i % 7],
      revenue: Math.floor(2000 + Math.random() * 3000),
      orders: Math.floor(20 + Math.random() * 40),
    });
  }
  return data;
};

export const HEATMAP_DATA = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 14 }, (_, h) => {
    const hour = h + 7;
    const isPeak = (day < 5 && (hour === 8 || hour === 9 || hour === 12 || hour === 13)) || hour === 15;
    return {
      day, hour,
      value: isPeak ? Math.floor(10 + Math.random() * 15) : Math.floor(1 + Math.random() * 8),
    };
  })
);

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 7}:00`);

// ─── TIME SLOTS ───────────────────────────────────────────────────────────────
export const generateTimeSlots = (canteen_id = 1) => {
  const slots = [];
  const startHour = canteen_id === 1 ? 8 : canteen_id === 3 ? 9 : 8;
  const endHour = 19;
  const seedOrders = [2, 5, 12, 16, 8, 3, 11, 7, 4, 9, 14, 6, 3, 2, 5, 8, 10, 13, 7, 4, 3, 2];
  let slotIndex = 0;
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += 15) {
      const orderCount = seedOrders[slotIndex % seedOrders.length];
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const displayTime = h > 12 ? `${h - 12}:${m.toString().padStart(2, '0')} PM` : h === 12 ? `12:${m.toString().padStart(2, '0')} PM` : `${h}:${m.toString().padStart(2, '0')} AM`;
      slots.push({ time: timeStr, display: displayTime, order_count: orderCount });
      slotIndex++;
    }
  }
  const minCount = Math.min(...slots.map(s => s.order_count));
  return slots.map(s => ({ ...s, recommended: s.order_count === minCount && minCount < 5 }));
};

// ─── DEMAND FORECAST ─────────────────────────────────────────────────────────
export const DEMAND_FORECAST = {
  1: [
    { day: 'Monday', forecast: 'High', peak: '8–9 AM', expected_orders: 42 },
    { day: 'Tuesday', forecast: 'Moderate', peak: '9–10 AM', expected_orders: 28 },
    { day: 'Wednesday', forecast: 'High', peak: '8–9 AM', expected_orders: 38 },
    { day: 'Thursday', forecast: 'Moderate', peak: '9–10 AM', expected_orders: 25 },
    { day: 'Friday', forecast: 'Very High', peak: '8–9 AM', expected_orders: 55 },
    { day: 'Saturday', forecast: 'Low', peak: '10–11 AM', expected_orders: 15 },
    { day: 'Sunday', forecast: 'Low', peak: '11 AM–12 PM', expected_orders: 12 },
  ],
  2: [
    { day: 'Monday', forecast: 'Moderate', peak: '11 AM–12 PM', expected_orders: 30 },
    { day: 'Tuesday', forecast: 'High', peak: '12–1 PM', expected_orders: 40 },
    { day: 'Wednesday', forecast: 'High', peak: '12–1 PM', expected_orders: 38 },
    { day: 'Thursday', forecast: 'Moderate', peak: '11 AM–12 PM', expected_orders: 28 },
    { day: 'Friday', forecast: 'Very High', peak: '12–1 PM', expected_orders: 52 },
    { day: 'Saturday', forecast: 'Low', peak: '1–2 PM', expected_orders: 18 },
    { day: 'Sunday', forecast: 'Low', peak: '12–1 PM', expected_orders: 14 },
  ],
  3: [
    { day: 'Monday', forecast: 'High', peak: '1–2 PM', expected_orders: 36 },
    { day: 'Tuesday', forecast: 'Very High', peak: '1–2 PM', expected_orders: 48 },
    { day: 'Wednesday', forecast: 'High', peak: '12–1 PM', expected_orders: 40 },
    { day: 'Thursday', forecast: 'High', peak: '1–2 PM', expected_orders: 38 },
    { day: 'Friday', forecast: 'Very High', peak: '1–2 PM', expected_orders: 58 },
    { day: 'Saturday', forecast: 'Moderate', peak: '2–3 PM', expected_orders: 24 },
    { day: 'Sunday', forecast: 'Moderate', peak: '1–2 PM', expected_orders: 20 },
  ],
  4: [
    { day: 'Monday', forecast: 'Moderate', peak: '12–1 PM', expected_orders: 22 },
    { day: 'Tuesday', forecast: 'Moderate', peak: '12–1 PM', expected_orders: 24 },
    { day: 'Wednesday', forecast: 'High', peak: '11 AM–12 PM', expected_orders: 32 },
    { day: 'Thursday', forecast: 'Moderate', peak: '12–1 PM', expected_orders: 26 },
    { day: 'Friday', forecast: 'High', peak: '12–1 PM', expected_orders: 35 },
    { day: 'Saturday', forecast: 'Low', peak: '11 AM–12 PM', expected_orders: 14 },
    { day: 'Sunday', forecast: 'Low', peak: '11 AM–12 PM', expected_orders: 10 },
  ],
};

// ─── CAPACITY HELPER ─────────────────────────────────────────────────────────
export const getCapacityInfo = (active_orders, max_capacity = 20) => {
  const pct = (active_orders / max_capacity) * 100;
  if (pct <= 40) return { pct, color: 'green', label: 'Low', badge: 'badge-green' };
  if (pct <= 70) return { pct, color: 'yellow', label: 'Moderate', badge: 'badge-yellow' };
  return { pct, color: 'red', label: 'Busy', badge: 'badge-red' };
};

export const formatCurrency = (n) => `₹${Number(n).toFixed(0)}`;
export const formatTime = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
export const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const generateOrderId = () => {
  const year = new Date().getFullYear();
  const num = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
  return `GG-${year}-${num}`;
};
