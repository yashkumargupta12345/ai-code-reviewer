# 🤖 AI Code Reviewer

> Automatically reviews your GitHub Pull Requests using AI and posts detailed feedback as comments — just like a senior developer!

![Demo](demo.gif)

## 🌐 Live Demo
- **Frontend Dashboard:** https://ai-code-reviewer-ci09mxnmy-yashkumargupta12345s-projects.vercel.app/
- **Backend API:** https://ai-code-reviewer-backend-lrfl.onrender.com

---

## ✨ Features

- 🔍 **Auto Language Detection** — Python, JavaScript, Java, TypeScript
- 🐛 **Bug Detection** — catches common bugs and errors
- 🔐 **Security Analysis** — SQL injection, hardcoded secrets, and more
- 🎯 **Severity Scoring** — 1-10 score + merge recommendation
- 📏 **PR Size Warning** — flags oversized PRs (500+ lines)
- 📊 **Interactive Dashboard** — charts, stats, multi-repo support
- 💾 **Persistent Storage** — PostgreSQL database
- 🚦 **Rate Limiting** — sliding window, 10 req/min per repo
- ⚡ **Async Architecture** — instant webhook response

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| AI/LLM | Groq API + Llama 3.3 70B |
| Backend | Python, FastAPI, BackgroundTasks |
| Database | PostgreSQL, SQLAlchemy |
| Frontend | React.js, Recharts |
| Integration | GitHub Webhooks, REST APIs |
| Security | HMAC SHA-256 |
| Deployment | Render (backend), Vercel (frontend) |

---

## 🏗️ Architecture
```
GitHub PR opened
      ↓
Webhook fires → FastAPI Backend (<100ms response)
      ↓
Background Task starts
      ↓
Fetch PR diff from GitHub API
      ↓
Auto-detect language
      ↓
Groq LLM analyzes code (Llama 3.3 70B)
      ↓
Severity score + merge recommendation generated
      ↓
Comment posted on GitHub PR 🎉
      ↓
Saved to PostgreSQL database
      ↓
Dashboard updates automatically
```

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key — free at console.groq.com
- GitHub Personal Access Token
- PostgreSQL database (free on render.com)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file:
```
GROQ_API_KEY=your_groq_key
GITHUB_TOKEN=your_github_token
WEBHOOK_SECRET=your_secret
DATABASE_URL=your_postgresql_url
```

Run server:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### GitHub Webhook Setup
1. Go to your repo → Settings → Webhooks
2. Add webhook URL:
```
https://your-backend-url/webhook
```
3. Content type: `application/json`
4. Secret: same as `WEBHOOK_SECRET`
5. Events: ✅ Pull requests

---

## 📊 How It Works

1. **Webhook Trigger** — GitHub sends PR data to FastAPI server
2. **Instant Response** — Server returns 200 OK immediately
3. **Background Processing** — Diff fetched, language detected
4. **AI Analysis** — Groq LLM reviews code with structured prompt
5. **Severity Scoring** — 1-10 score + merge recommendation generated
6. **Comment Posted** — Formatted review posted on PR
7. **Database Saved** — Review stored in PostgreSQL
8. **Dashboard Updated** — Charts and stats refresh automatically

---

## 🔒 Security Features

- ✅ HMAC SHA-256 webhook signature verification
- ✅ Environment variables for all secrets
- ✅ Rate limiting — 10 requests/minute per repo
- ✅ No sensitive data in codebase

---

## 🗂️ Project Structure
```
ai-code-reviewer/
│
├── backend/
│   ├── main.py          ← Server + Webhook handler
│   ├── reviewer.py      ← AI Brain (Groq + Llama)
│   ├── database.py      ← PostgreSQL models + queries
│   └── requirements.txt
│
└── frontend/
    └── src/
        └── components/
            ├── Dashboard.js  ← Main dashboard
            └── Charts.js     ← Recharts visualizations
```

---

## 👨‍💻 Author

**Yash Kumar Gupta**
---
