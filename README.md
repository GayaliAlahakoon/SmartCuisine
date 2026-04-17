# 🍽️ SmartCuisine

SmartCuisine is an AI-powered recipe generation system that creates recipes from user-provided ingredients while ensuring food safety through real-time allergen detection and intelligent substitution suggestions. The system integrates machine learning models, cuisine classification, and large language models (LLMs) to provide safe, personalized, and context-aware cooking recommendations.

---

## 🚀 Features

* 🧠 AI-powered recipe generation using LLMs
* ⚠️ Real-time allergen detection (multi-label classification)
* 🔄 Safe ingredient substitution suggestions
* 🌍 Cuisine classification (e.g., Indian, Chinese, Korean)
* 🧩 Hybrid model (ML + rule-based safety validation)
* 💻 Modern and responsive web interface

---

## 🏗️ System Architecture

* **Frontend:** Next.js (React + TypeScript)
* **Backend:** FastAPI (Python)
* **Machine Learning:**

  * TF-IDF + FastText embeddings
  * Logistic Regression (One-vs-Rest)
* **Cuisine Classification:** XGBoost
* **LLM Integration:** Gemini API

---

## 📂 Project Structure

```
SmartCuisine/
│
├── Backend/                # FastAPI backend
│   ├── app/
│   │   ├── models/         # (Ignored) ML models
│   │   ├── main.py
│   │   ├── utils.py
│   │   └── ...
│   │
│   ├── test_results/       # API & LLM test outputs
│   └── ...
│
├── frontend/               # Next.js frontend
│
├── Models/                 # Training notebooks & datasets
│
├── requirements.txt
└── README.md
```

---

## 📥 Download Models

⚠️ Model files are not included in this repository due to size limitations.

👉 Download from here:
**https://drive.google.com/file/d/138s3FdzHDQwhZASg469laK4NBpAuYY8t/view?usp=sharing**

After downloading, place them in:

```
Backend/app/models/
```

---

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend server:

```bash
uvicorn Backend.app.main:app --reload
```

---

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `Backend` folder:

```
GEMINI_API_KEY=your_api_key_here
```

⚠️ Do not upload this file to GitHub.

---

## 📊 Model Overview

### 🔍 Allergen Detection

* Multi-label classification model
* TF-IDF + FastText embeddings
* Logistic Regression (One-vs-Rest)
* Rule-based keyword safety validation

### 🌍 Cuisine Classification

* XGBoost model
* Predicts cuisine type to guide recipe generation

### 🤖 Recipe Generation

* Powered by Gemini API (LLM)
* Generates recipes and substitution suggestions

---

## 🧪 Testing

* API test results available in `Backend/test_results/`
* Includes:

  * Cuisine prediction
  * Recipe generation
  * Substitution suggestions

---

## ⚠️ Important Notes

* 🚫 `.env`, model files, and cache files are excluded for security and size reasons
* ⚠️ Ensure models are placed correctly before running the system
* 💡 This project is developed for academic and research purposes

---

## 📌 Future Improvements

* 📱 Mobile application support
* 🌐 Offline functionality
* 🔍 Enhanced ingredient validation
* 🧠 Improved substitution intelligence
* 📊 Advanced model evaluation and optimization

---

## 👨‍🎓 Author

Final Year Software Engineering Project
University of Westminster

---

## 📄 License

This project is intended for academic and research use only.
