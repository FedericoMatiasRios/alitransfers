# Backend Recommendation

For your current project (static informative website + chatbot only), **FastAPI** is the most practical choice:

- Lighter and faster to ship than Django for a single REST endpoint.
- Easy CORS support for your existing static frontend.
- Great async performance for AI API proxy calls.

Django is excellent when you need admin, ORM-heavy data models, and larger app structure. You can migrate later if needed.

## 1) Create virtual environment and install dependencies

From this `backend` folder:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Configure environment variables

Copy `.env.example` to `.env` and set your key:

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set `GEMINI_API_KEY`.

## 3) Run API

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

- `GET http://127.0.0.1:8000/api/health`

Chat endpoint:

- `POST http://127.0.0.1:8000/api/chat`
- JSON body:

```json
{
  "message": "Hi, what airport transfer services do you offer?"
}
```

## 4) Frontend usage example

Use this from your site JavaScript:

```js
async function askChatbot(message) {
  const response = await fetch("http://127.0.0.1:8000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Chat API error");
  }

  const data = await response.json();
  return data.reply;
}
```

## Production notes

- Keep Gemini API key only in backend env vars.
- Update `CORS_ORIGINS` in `.env` to your final domains.
- Place this API behind HTTPS in production (Render, Railway, Fly.io, Azure, etc.).

## Deployment

### Option 1: Render (Recommended for simplicity)

1. Push this `backend` folder to GitHub.
2. Go to [render.com](https://render.com) and sign up.
3. Click **New** → **Web Service** → Connect your GitHub repo.
4. Choose this repository.
5. Fill in:
   - **Name**: `alitransfers-api`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `GEMINI_API_KEY`: your key
   - `CORS_ORIGINS`: (auto-filled in render.yaml)
7. Click **Deploy**. Your API will be live at `https://alitransfers-api.onrender.com`.

**Note**: Free tier on Render will spin down after 15 minutes of inactivity.

### Option 2: Railway

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) and sign up.
3. Click **Create Project** → **Deploy from GitHub repo**.
4. Select your repo and root directory (the `backend` folder).
5. Railway will auto-detect Python and use `railway.json` config.
6. Add variables in the Railway dashboard:
   - `GEMINI_API_KEY`
   - `CORS_ORIGINS`
7. Click **Deploy**. Your API will be at a Railway-assigned URL.

### Option 3: Fly.io

1. Install `flyctl` CLI.
2. Run `fly launch` in the `backend` folder.
3. Set up secrets:
   ```bash
   fly secrets set GEMINI_API_KEY=your_key
   fly secrets set CORS_ORIGINS=https://www.alitransfers.com,https://alitransfers.com
   ```
4. Deploy:
   ```bash
   fly deploy
   ```

## After deployment

Once your API is live (e.g., at `https://alitransfers-api.onrender.com`), update the `BACKEND_URL` in `assets/js/chatbot.js`:

```javascript
const BACKEND_URL = 'https://alitransfers-api.onrender.com'; // Update this
```

Then push the updated frontend to your GitHub Pages or hosting.

Your chat widget will now connect to the live API and users can chat with your Gemini-powered assistant!
