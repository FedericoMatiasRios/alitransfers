# AliTransfers Chatbot—Complete Setup Guide

## What you now have

**Frontend** (in your static site):
- Chat widget UI (`assets/css/chatbot.css`, `assets/js/chatbot.js`)
- Integrated into `index.html`
- Gold-themed, matches your design
- Floats in bottom-right corner

**Backend** (in `/backend` folder):
- FastAPI server with Gemini proxy endpoint
- Secure (API key stays server-side)
- CORS ready for your domain

## Local Testing (5 min setup)

### 1. Backend setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Environment config

```powershell
Copy-Item .env.example .env
```

Edit `.env` and add your **Gemini API key**:
- Get it from [Google AI Studio](https://aistudio.google.com/apikey)

### 3. Start backend

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 4. Test the API

**Health check** (browser):
```
http://127.0.0.1:8000/api/health
```

**Chat** (PowerShell):
```powershell
$body = @{message="What services do you offer?"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/chat" `
  -Method Post -Headers @{"Content-Type"="application/json"} `
  -Body $body | Select-Object -ExpandProperty Content
```

### 5. Test frontend widget

Open your site locally (e.g., `http://127.0.0.1:5500/index.html`) and:
- Click the gold chat button (bottom-right)
- Type a message
- See Gemini's reply

## Production Deployment

### Quick Deploy to Render (No credit card—free tier works)

1. Push your repo to GitHub (if not already done).

2. Go to [render.com](https://render.com) and **sign up** (free tier available).

3. Click **New** → **Web Service** → Connect GitHub → Select your repo.

4. Fill form:
   - **Service Name**: `alitransfers-api`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Build Command**: `pip install -r requirements.txt` (auto-detected)

5. Add environment variables:
   - **GEMINI_API_KEY**: (paste your key)
   - **CORS_ORIGINS**: (keep defaults in render.yaml)

6. Click **Create Web Service** → Wait ~2 min.

7. Render assigns you a URL like: `https://alitransfers-api-xxxx.onrender.com`

8. Update your frontend—edit `assets/js/chatbot.js`:

```javascript
const BACKEND_URL = 'https://alitransfers-api-xxxx.onrender.com'; // Change this line
```

9. Commit and push. Chat widget now uses the live API!

---

## FAQ

**Q: How do I get a Gemini API key?**
A: Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey), sign in, and click "Create API key". Free tier includes 60 requests/min.

**Q: Will this cost money?**
A: 
- Gemini API: ~$0.075 per 1M input tokens, free tier included.
- Render free tier: Yes, but will sleep after 15 min inactivity (users wake it with first message).
- Railway: Yes, free tier available.

**Q: How do I update the chat widget style?**
A: Edit `assets/css/chatbot.css`. Colors are:
- Gold accent: `#bc8937`, `#d6ad50`, `#f1db7e`
- Change gradient colors in `.chatbot-toggle-btn`, `.chatbot-send-btn`, etc.

**Q: The widget isn't showing?**
A: Check:
1. Both `chatbot.css` and `chatbot.js` are linked in `index.html`
2. Bootstrap Icons are loaded (uses `bi-chat-dots`, `bi-send-fill`)
3. No console errors (F12 → Console tab)

**Q: Can I customize the greeting message?**
A: Edit `addGreetingMessage()` in `assets/js/chatbot.js`:
```javascript
addMessage('Your custom greeting here! 👋', 'bot');
```

**Q: How do I add more AI features?**
A: The backend is ready for expansion:
- Add more endpoints in `app/main.py`
- Keep CORS and auth patterns
- Extend for booking, pricing queries, etc.

---

## Files Reference

```
Instant/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py          ← FastAPI server
│   ├── .env                 ← Your Gemini key (don't commit)
│   ├── .env.example         ← Template
│   ├── requirements.txt
│   ├── render.yaml          ← Render config
│   ├── railway.json         ← Railway config
│   └── README.md
├── assets/
│   ├── css/
│   │   ├── chatbot.css      ← Widget styles
│   │   └── main.css
│   └── js/
│       ├── chatbot.js       ← Widget logic + Gemini integration
│       └── main.js
└── index.html               ← Updated with widget links
```

---

## Support

**Backend issues?** Check `backend/README.md`

**Widget not connecting?** 
- Ensure backend is running at the URL in `chatbot.js`
- Check CORS_ORIGINS includes your domain
- Browser console (F12) for errors

**Deployment stuck?**
- Render: Check "Logs" tab in dashboard
- Railway: Check deployment logs
- Both allow rebuilds—no extra cost

---

Happy chatting! 🚖✨
