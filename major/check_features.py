import joblib
import os
import json

path = r"C:\Users\Abhinav Mishra\OneDrive\Desktop\AI cybersecurity tool\cnn_lstm_hybrid_model\cnn_lstm_hybrid_model\numeric_feature_cols.joblib"
try:
    data = joblib.load(path)
    with open('major/features.json', 'w') as f:
        json.dump(data, f)
except Exception as e:
    import traceback
    traceback.print_exc()
