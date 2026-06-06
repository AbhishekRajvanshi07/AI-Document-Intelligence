# AI Document Intelligence Platform
## Cloud Stack: Neon · Upstash · Cloudflare R2 · Render · Vercel

---

## Cloud Architecture

```
Browser → Vercel (React + Vite)
               ↓ /api/v1/*
          Render (FastAPI + Tesseract + OpenCV + spaCy)
           ↙           ↓            ↘
       Neon         Upstash      Cloudflare R2
   (PostgreSQL)    (Redis)      (File Storage)
```

---

## Step 1 — Neon PostgreSQL (FREE)

1. Sign up at https://neon.tech
2. Create project → name it `docintel`
3. Copy the **Connection string** from the dashboard
4. Change prefix: `postgresql://` → `postgresql+asyncpg://`
5. Add `?ssl=require` at the end

```
postgresql+asyncpg://user:pass@ep-xxx.us-east-2.aws.neon.tech/docintel?ssl=require
```

---

## Step 2 — Upstash Redis (FREE)

1. Sign up at https://upstash.com
2. Create Database → Redis → pick region
3. Copy the **Redis URL** (starts with `rediss://`)

---

## Step 3 — Cloudflare R2 (FREE)

1. Sign up at https://cloudflare.com
2. Go to R2 Object Storage → Create bucket: `docintel-uploads`
3. R2 → Manage R2 API Tokens → Create Token (read+write)
4. Note: Account ID, Access Key ID, Secret Access Key

---

## Step 4 — Deploy Backend on Render (FREE)

1. Push this repo to GitHub:
```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/doc-intel.git
git push -u origin main
```

2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Build Command: `./build.sh`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
```
DATABASE_URL   = <paste Neon connection string>
REDIS_URL      = <paste Upstash Redis URL>
R2_ACCOUNT_ID  = <Cloudflare Account ID>
R2_ACCESS_KEY  = <R2 Access Key ID>
R2_SECRET_KEY  = <R2 Secret Access Key>
R2_BUCKET      = docintel-uploads
SECRET_KEY     = <any random 32-char string>
ALLOWED_ORIGINS = ["https://your-app.vercel.app","http://localhost:5173"]
```

6. Deploy → note your URL: `https://doc-intel-api.onrender.com`

---

## Step 5 — Deploy Frontend on Vercel (FREE)

1. Go to https://vercel.com → Add New Project
2. Import your GitHub repo
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
```
VITE_API_URL = https://doc-intel-api.onrender.com
```
5. Deploy → your app is live at `https://doc-intel.vercel.app`

---

## Step 6 — Update CORS

In Render environment variables, update:
```
ALLOWED_ORIGINS = ["https://doc-intel.vercel.app"]
```
Trigger a redeploy.

---

## Local Development

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env   # fill in your cloud credentials
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:5173

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/upload` | Upload PDF/image → R2 → OCR → NLP → Neon |
| GET | `/api/v1/documents` | List all documents from Neon |
| GET | `/api/v1/documents/{id}` | Get document + R2 presigned URL |
| GET | `/api/v1/documents/{id}/export` | Download as JSON |
| DELETE | `/api/v1/documents/{id}` | Delete from Neon + R2 |
| POST | `/api/v1/analyze/ocr` | Run OCR on base64 image |
| POST | `/api/v1/analyze/nlp` | Run NLP on raw text |
| GET | `/api/v1/health` | Health check |

Swagger UI: `https://your-render-url.onrender.com/docs`

---

## Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| Neon | 3 GB storage, 0.5 vCPU |
| Upstash Redis | 10,000 commands/day |
| Cloudflare R2 | 10 GB storage, 1M requests/month |
| Render | 750 hours/month (spins down after 15min idle) |
| Vercel | Unlimited for personal projects |
