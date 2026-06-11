const { spawn } = require('child_process');
const path = require('path');

/**
 * Predicts food preparation time using the XGBoost model.
 * @param {Object} factors - { item_id, quantity, queue_length, is_peak_hour, chef_availability, food_complexity, prep_time_mins }
 * @returns {Promise<number>} - Estimated preparation time in minutes.
 */
const predictPrepTime = (factors) => {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, '../ml/predict_prep_time.py');
    const pythonBin = process.env.PYTHON_BIN || 'python3';
    const pythonProcess = spawn(pythonBin, [scriptPath]);

    let output = '';
    let errorOutput = '';
    let settled = false;
    const finish = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    // If the interpreter can't be spawned (e.g. not installed / wrong name),
    // a fatal 'error' event is emitted. Without this handler it becomes an
    // unhandled error that crashes the whole server. Fall back to the default.
    pythonProcess.on('error', (err) => {
      console.error('ML Predictor spawn failed:', err.message);
      finish(15);
    });

    // Writing to stdin of a failed spawn can emit EPIPE; swallow it.
    pythonProcess.stdin.on('error', () => {});
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
        return finish(15); // Fallback to default 15 mins
      }

      try {
        const result = JSON.parse(output);
        if (result.error) {
          console.warn('ML Prediction Result Error:', result.error);
          return finish(15); // Fallback
        }
        finish(Math.round(result.average_prep_time));
      } catch (e) {
        console.error('Failed to parse ML output:', output, e);
        finish(15); // Fallback
      }
    });
  });
};

module.exports = { predictPrepTime };
