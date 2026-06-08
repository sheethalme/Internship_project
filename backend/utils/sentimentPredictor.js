const { spawn } = require('child_process');
const path = require('path');

/**
 * Classifies a review comment's sentiment using the fine-tuned DistilBERT model.
 * Spawns ml/predict_sentiment.py and reads its JSON output. Degrades gracefully
 * to a neutral result if the model is missing or Python errors, so review
 * submission is never blocked.
 *
 * @param {string} text - The review comment.
 * @returns {Promise<{label: 'positive'|'neutral'|'negative', score: number}>}
 */
const predictSentiment = (text) => {
  return new Promise((resolve) => {
    if (!text || !text.trim()) return resolve({ label: 'neutral', score: 0 });

    const scriptPath = path.join(__dirname, '../ml/predict_sentiment.py');
    const py = spawn('python3', [scriptPath]);

    let output = '';
    let errorOutput = '';

    py.stdin.write(text);
    py.stdin.end();

    py.stdout.on('data', (d) => { output += d.toString(); });
    py.stderr.on('data', (d) => { errorOutput += d.toString(); });

    py.on('error', (err) => {
      console.error('Sentiment predictor spawn error:', err.message);
      resolve({ label: 'neutral', score: 0 });
    });

    py.on('close', (code) => {
      if (code !== 0) {
        console.error(`Sentiment predictor exited ${code}:`, errorOutput);
        return resolve({ label: 'neutral', score: 0 });
      }
      try {
        const result = JSON.parse(output);
        resolve({ label: result.label || 'neutral', score: result.score || 0 });
      } catch (e) {
        console.error('Failed to parse sentiment output:', output, e);
        resolve({ label: 'neutral', score: 0 });
      }
    });
  });
};

module.exports = { predictSentiment };
