const { spawn } = require('child_process');
const path = require('path');

/**
 * Predicts food preparation time using the XGBoost model.
 * @param {Object} factors - { item_id, quantity, queue_length, is_peak_hour, chef_availability, food_complexity, prep_time_mins }
 * @returns {Promise<number>} - Estimated preparation time in minutes.
 */
const predictPrepTime = (factors) => {
  return new Promise((resolve, reject) => {
    console.log('ML Predictor - input factors:', JSON.stringify(factors));
    const scriptPath = path.join(__dirname, '../ml/predict_prep_time.py');
    const pythonProcess = spawn('python', [scriptPath]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdin.write(JSON.stringify(factors));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`ML Predictor Error (Code ${code}):`, errorOutput);
        return resolve(15); // Fallback to default 15 mins
      }

      try {
        const result = JSON.parse(output);
        console.log('ML Predictor - raw result:', result);
        if (result.error) {
          console.warn('ML Prediction Result Error:', result.error);
          return resolve(15); // Fallback
        }
        resolve(Math.round(result.average_prep_time));
      } catch (e) {
        console.error('Failed to parse ML output:', output, e);
        resolve(15); // Fallback
      }
    });
  });
};

module.exports = { predictPrepTime };
