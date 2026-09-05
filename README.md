# CyberShield

**One interface, four different ways the internet lies to you.**

CyberShield is an AI-powered cybersecurity platform that detects fake social media profiles, phishing URLs, AI-generated text, and AI-generated images — combining classical machine learning, deep learning, and transformer-based NLP behind a single, real-time web interface.

Built as a Major Project (B.Tech CSE, JIIT Noida) by Yash Jain, Abhinav Mishra, and Swapnil Pandey, under the guidance of Ms. Sarishty Gupta.

---

## Why this exists

Fake accounts, phishing links, and AI-generated content are getting harder to tell apart from the real thing — and existing tools tend to solve exactly one of these problems, not all of them. CyberShield brings four different detection problems (each with its own kind of model) behind one interface, so a user doesn't need four different tools to check if something online is trustworthy.

## What it does

| Module | What it detects | How |
|---|---|---|
| **Fake Profile Detection** | Fake / bot Instagram profiles | Profile data (followers, following, posts, bio, etc.) is fetched via Apify, engineered into numerical features, and classified using a trained **Random Forest** model. |
| **Phishing URL Detection** | Malicious / phishing links | URLs are parsed for lexical features (length, entropy, special characters, suspicious keywords) and passed through a hybrid **CNN–LSTM** model — CNN layers catch local patterns, LSTM layers catch sequence-level structure. |
| **AI-Generated Text Detection** | Human-written vs. AI-generated text | Text is tokenized and classified using a fine-tuned **transformer-based model**, with threshold logic separating confident vs. uncertain predictions. |
| **AI-Generated Image Detection** | AI-generated / manipulated images | Uploaded images are analyzed via the **Sightengine** API for generative artifacts and inconsistencies. |
| **Password Generator** | — | Generates strong, randomized passwords based on user-selected length and character rules. |

Across the fake-profile, phishing, and text-detection pipelines, model tuning and ensembling improved overall threat-detection accuracy by **35%** over baseline classifiers.

## Tech stack

**Frontend** — React.js (Vite), React Router, Single Page Application architecture

**Backend** — Node.js, Express.js — routes requests, manages file uploads, and invokes the Python ML layer as child processes

**Machine Learning / AI** — Python, Scikit-learn, TensorFlow / Keras, PyTorch, Hugging Face Transformers, XGBoost, NumPy, Pandas

**External APIs** — Apify (Instagram profile data extraction), Sightengine (AI image analysis)

## Architecture

```
React (frontend)
   │  REST API
   ▼
Node.js / Express (backend)
   │
   ├── Python ML engine (child processes)
   │      ├── Random Forest        → fake profile detection
   │      ├── CNN–LSTM             → phishing URL detection
   │      └── Transformer model    → AI-generated text detection
   │
   └── External APIs
          ├── Apify        → Instagram profile data
          └── Sightengine  → AI-generated image detection
```

The system is intentionally modular — frontend, backend, and each ML model are separate, replaceable pieces, so new detection modules (e.g. deepfake video detection) can be added without touching the rest of the system.

## Getting started

> The exact folder layout and environment variables below are best-effort based on the project's architecture — check `frontend/` and `backend/` in this repo and adjust as needed.

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.9+
- API keys for [Apify](https://apify.com) and [Sightengine](https://sightengine.com)

### Setup

```bash
# clone the repo
git clone https://github.com/abhinavmishra97/CyberShield.git
cd CyberShield

# install backend dependencies
cd backend
npm install

# install Python ML dependencies
pip install -r requirements.txt

# install frontend dependencies
cd ../frontend
npm install
```

### Environment variables

Create a `.env` file in the backend directory:

```
APIFY_API_TOKEN=your_apify_token
SIGHTENGINE_API_USER=your_sightengine_user
SIGHTENGINE_API_SECRET=your_sightengine_secret
```

### Running locally

```bash
# from /backend
npm run dev

# from /frontend, in a separate terminal
npm run dev
```

## Testing

The system was validated across requirements, unit, integration, system, performance, load, and security testing — covering the ML engine, API endpoints, and frontend-backend-ML communication end-to-end, with input validation and error handling in place for malformed requests, unsupported file types, and API/network failures.


## License

Academic project — Major Project 2, Jaypee Institute of Information Technology (2025–2026). Add a license here if you intend this repo to be reused publicly.
