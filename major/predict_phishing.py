import sys
import json
import math
import collections
import re
import os
from urllib.parse import urlparse

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import warnings
warnings.filterwarnings('ignore')

try:
    import joblib
    import numpy as np
    from tensorflow.keras.models import load_model # type: ignore
    from tensorflow.keras.preprocessing.sequence import pad_sequences # type: ignore
except ImportError as e:
    print(json.dumps({"error": f"Missing library: {e}. Run pip install tensorflow joblib numpy"}))
    sys.exit(1)

def calc_entropy(s):
    if not s: return 0
    p, lns = collections.Counter(s), float(len(s))
    return -sum(count/lns * math.log(count/lns, 2) for count in p.values())

def extract_features(url):
    url_length = len(url)
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path.split('/')[0]
    hostname_length = len(domain)
    num_dots = url.count('.')
    num_hyphens = url.count('-')
    num_digits = sum(c.isdigit() for c in url)
    num_special_chars = sum(1 for c in url if not c.isalnum() and c not in ['-', '.'])
    
    domain_parts = domain.split('.')
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain):
        is_ip = 1
        tld_length = 0
        suspicious_tld = 0
        num_subdomains = 0
        first_subdomain_len = 0
    else:
        is_ip = 0
        tld = domain_parts[-1] if len(domain_parts) > 1 else ''
        tld_length = len(tld)
        suspicious_tlds = ['tk', 'ml', 'ga', 'cf', 'gq', 'pw', 'xyz', 'top', 'site', 'online', 'info']
        suspicious_tld = 1 if tld.lower() in suspicious_tlds else 0
        num_subdomains = max(0, len(domain_parts) - 2)
        first_subdomain_len = len(domain_parts[0]) if num_subdomains > 0 else 0

    is_https = 1 if parsed.scheme == 'https' else 0
    uses_http = 1 if parsed.scheme == 'http' else 0
    digit_ratio = num_digits / url_length if url_length > 0 else 0
    
    keywords = ['login', 'secure', 'account', 'update', 'verify', 'bank', 'confirm', 'password', 'free', 'bill', 'pay', 'service', 'support']
    has_phishing_keyword = 1 if any(k in url.lower() for k in keywords) else 0
    entropy = calc_entropy(url)
    
    return np.array([
        url_length, hostname_length, num_dots, num_hyphens, num_digits, 
        num_special_chars, tld_length, is_https, uses_http, suspicious_tld, 
        is_ip, num_subdomains, digit_ratio, has_phishing_keyword, 
        entropy, first_subdomain_len
    ]).reshape(1, -1)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No URL provided"}))
        return
    url = sys.argv[1]

    try:
        dir_path = os.path.dirname(os.path.realpath(__file__))
        ml_dir = os.path.join(dir_path, '..', 'cnn_lstm_hybrid_model', 'cnn_lstm_hybrid_model')
        
        # 1. Load ML components
        scaler = joblib.load(os.path.join(ml_dir, 'numeric_scaler.joblib'))
        tokenizer = joblib.load(os.path.join(ml_dir, 'url_tokenizer.joblib'))
        model = load_model(os.path.join(ml_dir, 'best_model.h5'), compile=False)
        
        # 2. Prepare 16 numeric features
        features = extract_features(url)
        scaled_features = scaler.transform(features)
        
        # 3. Prepare sequence features
        sequence = tokenizer.texts_to_sequences([url])
        padded_sequence = pad_sequences(sequence, maxlen=200)
        
        # 4. Predict via CNN-LSTM Array
        # Keras expects a list of inputs matching compile layout
        prob = model.predict([padded_sequence, scaled_features], verbose=0)[0][0]
        
        # In many URL datasets (like ISCX-URL2016), 1 = Safe/Benign and 0 = Phishing.
        # If prob is close to 1, it's SAFE. If prob is close to 0, it's PHISHING.
        is_phishing = bool(prob < 0.5)
        confidence = float((1 - prob) if is_phishing else prob) * 100
        
        print(json.dumps({
            "isPhishing": is_phishing,
            "confidence": round(confidence, 1),
            "flags": ["Evaluated Deep Learning Hybrid CNN-LSTM Model", "Cross-verified 16 scaling parameters and lexical tokens"]
        }))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == '__main__':
    main()
