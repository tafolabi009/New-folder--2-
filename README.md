# Internet Results Server (Express + PostgreSQL)

Production-ready Express server that accepts JSON via POST and stores results in PostgreSQL (with a safe file fallback for local/offline use). Deployable to Render or Heroku.

## Features
- POST JSON to `/api/results`, retrieve via `GET /api/results`
- PostgreSQL first; file-based store fallback (`data/results.json`) if no DB
- Security middleware: Helmet, CORS, compression, rate limiting, logging
- One-click friendly deploy configs: `render.yaml`, `Procfile`
- Static test UI at `/`

## Local Development
1. Install Node 18+
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy env template and configure if desired:
   ```bash
   copy .env.example .env   # Windows
   # cp .env.example .env   # macOS/Linux
   ```
   - If you have a Postgres URL, set `DATABASE_URL`.
4. Start the server:
   ```bash
   npm run dev
   # or: npm start
   ```
5. Open `http://localhost:3000` to use the test page.

## API
- POST `/api/results`
  - Body: JSON object
  - Response: `{ id, created_at, payload }`
- GET `/api/results?limit=50&offset=0`
  - Response: `{ results: [ ... ] }`
- Health: GET `/health`
 - API Docs: `/docs` (Swagger UI), `/openapi.json`

## Deploy to Render
1. Push this repo to GitHub/GitLab.
2. Create a new Web Service on Render, pick your repo.
3. Render will read `render.yaml` or use:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` (from Render PostgreSQL or any managed Postgres)
   - If needed, set `PGSSLMODE=require`.
5. Deploy. Your app will be available at the Render-provided URL.

## Deploy to Heroku
1. Install Heroku CLI and login.
2. Create app and add Postgres (optional):
   ```bash
   heroku create your-app-name
   # Optional: heroku addons:create heroku-postgresql:mini
   ```
3. Push code:
   ```bash
   git push heroku main
   # or: git push heroku HEAD:main
   ```
4. Set env vars (if not using the add-on):
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB
   heroku config:set PGSSLMODE=require
   ```
5. Open the app:
   ```bash
   heroku open
   ```

## Notes
- Without `DATABASE_URL`, the app persists to `data/results.json` inside the dyno/container (ephemeral on cloud). Use a real DB for production persistence.
- Rate limiting is basic; tune for your traffic profile.

## License
MIT


