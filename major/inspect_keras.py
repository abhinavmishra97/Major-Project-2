import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
from tensorflow.keras.models import load_model, Model

path = r"C:\Users\Abhinav Mishra\OneDrive\Desktop\AI cybersecurity tool\cnn_lstm_hybrid_model\cnn_lstm_hybrid_model\best_model.h5"
try:
    model = load_model(path, compile=False)
    print("MODEL INPUTS:")
    for inp in model.inputs:
        print(inp)
except Exception as e:
    print("FAILED TO LOAD MODEL", e)
