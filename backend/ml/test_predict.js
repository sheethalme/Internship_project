const { predictPrepTime } = require('../utils/mlPredictor');

async function run() {
  const inputs = [
    { item_id: 1, quantity: 1, queue_length: 2, is_peak_hour: 0, chef_availability: 3, food_complexity: 1, prep_time_mins: 6 },
    { item_id: 25, quantity: 5, queue_length: 12, is_peak_hour: 1, chef_availability: 1, food_complexity: 5, prep_time_mins: 12 }
  ];

  for (const f of inputs) {
    const res = await predictPrepTime(f);
    console.log('Predicted (rounded) minutes for', f, '->', res);
  }
}

run().catch(e => console.error(e));
