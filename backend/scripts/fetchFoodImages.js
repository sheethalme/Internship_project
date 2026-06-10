// Run: PEXELS_API_KEY=your_key node scripts/fetchFoodImages.js
// Get a free key at: https://www.pexels.com/api/

const fs   = require('fs');
const path = require('path');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

const FOOD_ITEMS = [
  // Canteen 1 — Christ Bakery
  { item_id: 101, query: 'masala dosa south indian' },
  { item_id: 102, query: 'poori puri indian bread plate' },
  { item_id: 103, query: 'idli idly south indian steamed' },
  { item_id: 104, query: 'medu vada crispy south indian' },
  { item_id: 105, query: 'upma south indian semolina breakfast' },
  { item_id: 106, query: 'pongal rice lentil south indian' },
  { item_id: 107, query: 'bread omelette egg toast breakfast' },
  { item_id: 108, query: 'mini idli south indian plate' },
  { item_id: 109, query: 'croissant flaky pastry bakery' },
  { item_id: 110, query: 'banana bread loaf sliced' },
  { item_id: 111, query: 'tea cake slice dessert' },
  { item_id: 112, query: 'protein cookies healthy baked' },
  { item_id: 113, query: 'protein energy bar snack' },
  { item_id: 114, query: 'hot coffee cup espresso' },
  { item_id: 115, query: 'hot tea cup drink' },
  { item_id: 116, query: 'cold coffee iced glass' },
  { item_id: 117, query: 'vanilla milkshake glass' },
  // Canteen 2 — Michael's Corner
  { item_id: 201, query: 'samosa indian fried snack' },
  { item_id: 202, query: 'blueberry muffin bakery' },
  { item_id: 203, query: 'chocolate muffin dark' },
  { item_id: 204, query: 'chocolate brownie fudge' },
  { item_id: 205, query: 'french toast breakfast maple' },
  { item_id: 206, query: 'vegetable sandwich fresh' },
  { item_id: 207, query: 'paneer kathi roll wrap indian' },
  { item_id: 208, query: 'egg roll wrap street food' },
  { item_id: 209, query: 'chicken kathi roll wrap' },
  { item_id: 210, query: 'veggie burger aloo tikki' },
  { item_id: 211, query: 'grilled chicken burger bun' },
  { item_id: 212, query: 'masala chai spiced tea cup' },
  { item_id: 213, query: 'lemon iced tea glass' },
  { item_id: 214, query: 'coffee mug café' },
  { item_id: 215, query: 'iced cold coffee glass straw' },
  // Canteen 3 — Mingos
  { item_id: 301, query: 'french fries crispy golden' },
  { item_id: 302, query: 'garlic bread toasted butter' },
  { item_id: 303, query: 'pasta arrabbiata tomato sauce' },
  { item_id: 304, query: 'mac and cheese creamy' },
  { item_id: 305, query: 'noodles stir fry chopsticks' },
  { item_id: 306, query: 'grilled sandwich toasted panini' },
  { item_id: 307, query: 'vegetable wrap tortilla fresh' },
  { item_id: 308, query: 'chicken wrap grilled tortilla' },
  { item_id: 309, query: 'nachos chips guacamole salsa' },
  { item_id: 310, query: 'boiled eggs halved plate' },
  { item_id: 311, query: 'brownie sundae ice cream dessert' },
  { item_id: 312, query: 'iced tea lemon glass' },
  { item_id: 313, query: 'iced chocolate mocha drink' },
  { item_id: 314, query: 'cold coffee latte iced glass' },
  { item_id: 315, query: 'mango smoothie tropical orange' },
  // Canteen 4 — Freshateria
  { item_id: 401, query: 'egg salad bowl healthy greens' },
  { item_id: 402, query: 'hummus sandwich pita healthy' },
  { item_id: 403, query: 'avocado toast whole grain' },
  { item_id: 404, query: 'peanut butter banana sandwich' },
  { item_id: 405, query: 'oatmeal bowl toppings healthy' },
  { item_id: 406, query: 'acai bowl smoothie bowl toppings' },
  { item_id: 407, query: 'greek yogurt parfait granola berries' },
  { item_id: 408, query: 'quinoa salad bowl colorful' },
  { item_id: 409, query: 'fresh fruit bowl tropical' },
  { item_id: 410, query: 'chia pudding jar healthy' },
  { item_id: 411, query: 'granola bar oat healthy snack' },
  { item_id: 412, query: 'protein shake fitness bottle' },
  { item_id: 413, query: 'green smoothie spinach kale' },
  { item_id: 414, query: 'green detox juice glass' },
  { item_id: 415, query: 'energy balls bites chocolate oat' },
];

async function fetchImage(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (!data.photos?.length) return null;
  // medium is ~350×233 — good size for food cards
  return data.photos[0].src.medium;
}

async function main() {
  if (!PEXELS_API_KEY) {
    console.error('❌  Missing API key.\n   Run: PEXELS_API_KEY=your_key node scripts/fetchFoodImages.js\n   Get a free key at https://www.pexels.com/api/');
    process.exit(1);
  }

  const mockDataPath = path.join(__dirname, '../../frontend/src/data/mockData.js');
  let content = fs.readFileSync(mockDataPath, 'utf8');
  let updated = 0;
  let failed  = 0;

  console.log(`Fetching images for ${FOOD_ITEMS.length} items from Pexels...\n`);

  for (const item of FOOD_ITEMS) {
    try {
      const imageUrl = await fetchImage(item.query);
      if (!imageUrl) {
        console.log(`⚠️   item ${item.item_id}: no results for "${item.query}"`);
        failed++;
        continue;
      }

      // Match the exact item_id line and replace its image_url value
      const regex = new RegExp(
        `(item_id: ${item.item_id},[^\\n]*?image_url: ')[^']+(')`
      );
      if (regex.test(content)) {
        content = content.replace(regex, `$1${imageUrl}$2`);
        console.log(`✅  ${item.item_id} — ${imageUrl}`);
        updated++;
      } else {
        console.log(`⚠️   item ${item.item_id}: not found in mockData.js`);
        failed++;
      }

      // 200ms delay to stay well under Pexels rate limits
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌  item ${item.item_id}: ${err.message}`);
      failed++;
    }
  }

  fs.writeFileSync(mockDataPath, content, 'utf8');
  console.log(`\n✅  Done — ${updated} updated, ${failed} skipped`);
  console.log(`📄  Saved to ${mockDataPath}`);
}

main();
