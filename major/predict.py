import sys
import json
import warnings
import numpy as np
import joblib
import os

warnings.filterwarnings('ignore')

def make_prediction():
    try:
        # Load arguments passed from Node.js
        # The 11 features matching train_final.csv exactly
        args = sys.argv[1:]
        if len(args) != 11:
            print(json.dumps({"error": f"Expected 11 arguments, got {len(args)}"}))
            return

        features = np.array([float(x) for x in args]).reshape(1, -1)

        # Ensure correct path
        dir_path = os.path.dirname(os.path.realpath(__file__))

        # Load scaler and model using joblib (fixes STACK_GLOBAL error)
        scaler = joblib.load(os.path.join(dir_path, 'scaler.pkl'))
        model = joblib.load(os.path.join(dir_path, 'random_forest.pkl'))

        # Scale features and Predict
        scaled_features = scaler.transform(features)
        prediction = model.predict(scaled_features)[0]
        probability = model.predict_proba(scaled_features)[0]

        # Return JSON to Node.js
        result = {
            "isFake": bool(prediction == 1),
            "confidence": round(float(probability[1] if prediction == 1 else probability[0]) * 100, 1)
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    make_prediction()
