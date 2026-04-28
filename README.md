# 🧠 Explainable Opinion Mining and Temporal Analysis of War-related Discussions using NLP

A full-stack AI-powered web application that analyzes public opinion on war-related Reddit discussions using Natural Language Processing and Explainable AI techniques.

---

## 👥 Team Members

| Name | Role |
|------|------|
| Sankari P |   Developer |
| Harsitha Sree K | Developer |
| Vaishnavi | Developer |

---

## 📌 What is this Project?

This project reads Reddit comments about war and geopolitical conflicts and tells you:
- Whether someone **Supports**, **Opposes**, or is **Neutral** about the war
- **Why** they feel that way — Political, Economic, Security, or Emotional reason
- **Which exact words** in the comment drove the AI's decision (Explainable AI)
- **How public opinion changed hour by hour** using a temporal timeline graph

It is called **Explainable** because it does not just give an answer — it shows the full reasoning behind every decision.

---

## 🗂️ Project Structure

```
war-opinion-project-3/
│
├── backend/
│   ├── main.py                  # FastAPI backend server
│   ├── nlp_pipeline.py          # Modules 1–5: NLP preprocessing
│   ├── sentiment_model.py       # Module 6: RoBERTa model
│   ├── lstm_model.py            # LSTM model (alternate)
│   └── data/
│       └── war_comments_10000.csv   # Dataset (10,000 Reddit comments)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx              # Main React app
│       ├── App.css
│       ├── main.jsx
│       ├── index.css
│       └── components/
│           ├── Analyzer.jsx     # Single comment analyzer
│           └── Dashboard.jsx    # Full dashboard with charts
│
└── README.md
```

---

## 🧩 NLP Modules

| Module | What it Does |
|--------|--------------|
| **Module 1** | Text Cleaning — removes links, punctuation, numbers, extra spaces |
| **Module 2** | POS Tagging + Lemmatization — converts words to root form (attacking → attack) |
| **Module 3** | Noun Chunk Extraction + WordNet Reason Mapping — finds Political, Economic, Security, Emotional reasons |
| **Module 4** | Named Entity Recognition (NER) — detects country names, organizations, person names using spaCy |
| **Module 5** | Relevance Detection + Summarization — checks if comment is war-related; summarizes long comments (30+ words) |
| **Module 6** | RoBERTa Transformer — classifies opinion as Support / Oppose / Neutral with confidence score and attention highlights |

---

## 🛠️ Tech Stack

### Backend
- **Python** — core programming language
- **FastAPI** — REST API framework
- **HuggingFace Transformers** — RoBERTa pretrained model
- **NLTK** — tokenization, POS tagging, lemmatization, WordNet
- **spaCy** — Named Entity Recognition
- **Pandas / NumPy** — data handling
- **PyTorch** — deep learning backend for RoBERTa

### Frontend
- **React** — UI framework
- **Vite** — fast build tool
- **Recharts / Plotly** — pie charts, timeline graphs
- **CSS** — styling

---

## ▶️ How to Run the Project

### Step 1 — Clone the Repository
```bash
git clone https://github.com/sankarip0506bai27-sudo/war-opinion-mining.git
cd war-opinion-mining
```

### Step 2 — Setup Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn pandas numpy scikit-learn transformers torch wordcloud matplotlib pillow nltk spacy python-multipart plotly scipy
python -m spacy download en_core_web_sm
```

### Step 3 — Run Backend Server
```bash
uvicorn main:app --reload
```
Backend runs at: `http://localhost:8000`

### Step 4 — Setup Frontend (open a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🧪 Test Cases

### ✅ War-related Comments

**Support:**
```
Ukraine deserves full support from NATO. Russia's invasion is a clear violation of international law and human rights.
```

**Oppose:**
```
The ongoing war has caused immense suffering. We must push for diplomatic negotiations and a ceasefire immediately.
```

**Neutral:**
```
Both sides have valid arguments but the economic consequences of sanctions are affecting innocent civilians everywhere.
```

### ❌ Irrelevant Comments (triggers Irrelevant detection)
```
I just made the best pizza ever with extra cheese and mushrooms today!
```
```
My dog learned two new tricks this week. He can shake hands and roll over.
```

### 📝 Long Comments (triggers Summarizer — over 30 words)
```
The ongoing war in Ukraine has caused immense suffering across the entire region. NATO's decision to provide military weapons and economic sanctions against Russia has only escalated the conflict further. Innocent civilians including women and children are being displaced from their homes every single day.
```

### 🎭 Sarcasm (tests RoBERTa context understanding)
```
Oh brilliant move NATO. Sending more weapons to a warzone is definitely going to bring peace. Absolutely genius strategy.
```

---

## 📊 What We Infer from the Dashboard

- **Pie Chart** — Shows the overall ratio of Support vs Oppose vs Neutral opinions in the dataset
- **Timeline Graph** — Shows how public opinion shifted hour by hour over time
- **Word Cloud** — Shows the most frequently used words in war-related comments
- **Attention Highlights** — Words highlighted in green (support) or red (oppose) show exactly what the AI focused on
- **Confidence Score** — Shows how sure the model is about its prediction (e.g. 92% Oppose)
- **Reason Category** — Shows whether the opinion is driven by Political, Economic, Security or Emotional reasons
- **NER Tags** — Shows detected country names, organizations and person names in the comment

---

## 🔑 Key Technical Terms

| Term | Meaning |
|------|---------|
| **RoBERTa** | Pretrained transformer model trained on social media text — used for opinion classification |
| **Self-Attention** | Assigns importance score to each word — used for explainability highlights |
| **XAI** | Explainable AI — shows WHY the model made its decision, not just WHAT |
| **NER** | Named Entity Recognition — detects countries, organizations and person names |
| **Lemmatization** | Converts words to root form — attacking becomes attack |
| **WordNet** | Dictionary of synonyms used to expand reason keyword categories |
| **Temporal Analysis** | Tracking how opinion changes over time using the created_time column |
| **FastAPI** | Python framework used to build the backend REST API |
| **Vite** | Fast build tool used for the React frontend |
| **Zero-Shot** | Classifying text into categories without any training data needed |

---

## 📄 License

This project was developed as part of an academic NLP mini project.

---

> Made with ❤️ by Sankari P.
