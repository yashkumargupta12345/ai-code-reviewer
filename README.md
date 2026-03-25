# 🤖 AI Code Reviewer

> Automatically reviews your GitHub Pull Requests using AI and posts detailed feedback as comments — just like a senior developer!

![Demo](demo.gif)

## 🌐 Live Demo
- **Frontend Dashboard:** https://ai-code-reviewer-ci09mxnmy-yashkumargupta12345s-projects.vercel.app/
- **Backend API:** https://ai-code-reviewer-backend-lrfl.onrender.com

## ✨ Features
- 🔍 **Automatic PR Reviews** — triggers on every Pull Request
- 🐛 **Bug Detection** — catches common bugs and errors
- 🔐 **Security Analysis** — flags SQL injection, hardcoded secrets, etc.
- 💡 **Improvement Suggestions** — clean code recommendations
- 📊 **Dashboard** — track all reviewed PRs in one place
- ⚡ **Async Architecture** — instant webhook response, background processing

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| AI/LLM | Groq API + Llama 3.3 70B |
| Backend | Python, FastAPI, BackgroundTasks |
| Frontend | React, JavaScript |
| Integration | GitHub Webhooks |
| Deployment | Render (backend), Vercel (frontend) |

## 🏗️ Architecture
```
GitHub PR opened
      ↓
Webhook fires → FastAPI Backend
      ↓
Fetch PR diff from GitHub API
      ↓
Groq LLM analyzes code (RAG pipeline)
      ↓
Structured JSON review generated
      ↓
Comment posted on GitHub PR 🎉
```

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key (free at console.groq.com)
- GitHub Personal Access Token

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# .env file banao
echo "GROQ_API_KEY=your_key" > .env
echo "GITHUB_TOKEN=your_token" >> .env
echo "WEBHOOK_SECRET=your_secret" >> .env

uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### GitHub Webhook Setup
1. Go to your repo → Settings → Webhooks
2. Add webhook URL: `https://your-backend-url/webhook`
3. Content type: `application/json`
4. Events: Pull requests

## 📊 How It Works

1. **Webhook Trigger** — GitHub sends PR data to our FastAPI server
2. **Diff Fetching** — Server fetches the code changes via GitHub API
3. **AI Analysis** — Groq LLM analyzes the diff with a structured prompt
4. **Comment Posted** — Formatted review is posted directly on the PR

## 🔒 Security Features
- Webhook signature verification (HMAC SHA-256)
- Environment variables for all secrets
- No sensitive data in codebase

## 👨‍💻 Author
Yash Kumar Gupta — [GitHub](https://github.com/yashkumargupta12345)
