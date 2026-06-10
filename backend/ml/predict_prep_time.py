import sys
import json
import os
import xgboost as xgb
import pandas as pd
import numpy as np

def predict():
    try:
        # Load model
        model_path = os.path.join(os.path.dirname(__file__), 'prep_time_model.json')
        if not os.path.exists(model_path):
            print(json.dumps({"error": "Model file not found. Please train the model first."}))
            return

        model = xgb.XGBRegressor()
        model.load_model(model_path)

        # Get input data from stdin
        input_data = json.load(sys.stdin)
        
        # Ensure input is a list of dicts for pandas
        if isinstance(input_data, dict):
            input_data = [input_data]
            
        df = pd.DataFrame(input_data)
        
        # Required columns in order (include prep_time_mins baseline)
        required_cols = ['item_id', 'quantity', 'queue_length', 'is_peak_hour', 'chef_availability', 'food_complexity', 'prep_time_mins']
        df = df[required_cols]

        # Predict
        predictions = model.predict(df)
        
        # Return result as JSON
        result = {
            "predictions": predictions.tolist(),
            "average_prep_time": float(np.mean(predictions))
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()
