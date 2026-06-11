import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import json
import os

# Set seed for reproducibility
np.random.seed(42)

def generate_synthetic_data(n_samples=2000):
    data = []
    for _ in range(n_samples):
        # Features
        item_id = np.random.randint(1, 50)
        quantity = np.random.randint(1, 10)
        queue_length = np.random.randint(0, 20)
        hour = np.random.randint(8, 20)
        is_peak_hour = 1 if (12 <= hour <= 14) or (17 <= hour <= 19) else 0
        chef_availability = np.random.randint(1, 6)
        food_complexity = np.random.randint(1, 6)
        # Simulate expert baseline: prep_time_mins (menu static value)
        base_time = 4
        prep_time_mins = max(3, base_time + (food_complexity * 2) + np.random.normal(0, 1))

        # Total observed prep time = baseline + dynamic adjustments
        # adjustments: quantity, queue_length, chef availability, peak hour, noise
        prep_time = (prep_time_mins + 
                     (quantity * 1.2) + 
                     (queue_length * 0.8) - 
                     (chef_availability * 1.1) + 
                     (is_peak_hour * 5) + 
                     np.random.normal(0, 2))

        prep_time = max(prep_time_mins, prep_time)

        data.append({
            'item_id': item_id,
            'quantity': quantity,
            'queue_length': queue_length,
            'is_peak_hour': is_peak_hour,
            'chef_availability': chef_availability,
            'food_complexity': food_complexity,
            'prep_time_mins': prep_time_mins,
            'prep_time': prep_time
        })
    
    return pd.DataFrame(data)

def train_model():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    
    X = df.drop('prep_time', axis=1)
    y = df['prep_time']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost model...")
    model = xgb.XGBRegressor(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        objective='reg:squarederror'
    )
    
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    print(f"Model trained. Mean Absolute Error: {mae:.2f} minutes")
    
    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'prep_time_model.json')
    model.save_model(model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
