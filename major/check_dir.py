import os

base_path = r"C:\Users\Abhinav Mishra\OneDrive\Desktop\AI cybersecurity tool\models"
print("Base path exists:", os.path.exists(base_path))
if os.path.exists(base_path):
    print("Contents:", os.listdir(base_path))

base_path2 = r"C:\Users\Abhinav Mishra\OneDrive\Desktop\AI cybersecurity tool\cnn_lstm_hybrid_model"
print("Base path2 exists:", os.path.exists(base_path2))
if os.path.exists(base_path2):
    print("Contents2:", os.listdir(base_path2))
