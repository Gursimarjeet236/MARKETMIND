# MarketMind

MarketMind is a financial analytics platform combining market dashboards, news sentiment, ML-powered stock forecasts, and an AI assistant into a unified user experience.

## What it includes

- **Market dashboard** with stock and sentiment summaries
- **News search** with provider fallback for Alpha Vantage, NewsAPI, and DuckDuckGo
- **Next-day stock prediction** using TensorFlow models
- **AI conversation assistant** powered by LangGraph and FastAPI
- **User auth support** with JWT-based sign-in and Google login flows
- **Responsive UI** built with React, Vite, and Tailwind CSS

## Tech stack

- Frontend: React, Vite, Tailwind CSS
- Backend API: Python FastAPI, Uvicorn
- Optional backend service: Node.js, Express, Mongoose, MongoDB
- ML: TensorFlow, yfinance, scikit-learn, fastdtw, vmdpy
- Auth: JWT, bcrypt, Google OAuth helper

## Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- PostgreSQL or SQLite for the FastAPI backend
- MongoDB if you use the optional Node/Express service

### Install dependencies

```bash
npm install
```

Create a Python virtual environment and install backend requirements:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r backend_fastapi/requirements.txt
```

### Environment variables

Create a `.env` file in the project root with values such as:

```env
DATABASE_URL=postgres://user:pass@localhost:5432/marketmind
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://localhost:27017/marketmind
VITE_API_URL=
```

If you use a different Python virtual environment name or path, update the `backend` script in `package.json` or launch FastAPI directly.

### Run locally

```bash
npm run dev
```

This starts:
- frontend on `http://localhost:8080`
- FastAPI backend on `http://localhost:9000`

If needed, start the FastAPI backend directly from `backend_fastapi`:

```bash
cd backend_fastapi
python -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload
```

### Optional Node backend

The `server/` directory contains an Express/MongoDB service for auth, stock, and news routes. Start it manually if you use those APIs:

```bash
node server/index.js
```

## Useful scripts

- `npm run dev` — start frontend and FastAPI backend together
- `npm run build` — build the React app for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint for code checks

## Project structure

- `src/` — React application code
- `backend_fastapi/` — Python FastAPI backend, ML utilities, and AI agent
- `server/` — Node/Express auth and API service
- `public/` — static frontend assets
- `Dockerfile.frontend`, `docker-compose.yml`, `k8s/` — optional deployment tooling

## Notes

- News search falls back automatically between providers when results are missing.
- Stock prediction endpoints are cached for better performance.
- The AI assistant is streamed from FastAPI for responsive chat experiences.

---

Built to provide fast market intelligence, predictions, news, and AI guidance in one app.
