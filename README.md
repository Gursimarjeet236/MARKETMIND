# MarketMind

MarketMind is a modern financial dashboard and research platform that brings market data, news, ML-driven predictions, and an AI chat assistant into a single experience.

## What it is

MarketMind combines:
- a React + Vite frontend with Tailwind styling,
- a Python FastAPI backend for news, stock prediction, and AI conversational flows,
- a Node.js + Express backend for authentication, stock lookup, and MongoDB persistence.

This project is built for traders and investors who want a dashboard with fast market summaries, AI guidance, and next-day stock forecasts.

## Key Features

- **Dashboard & Market Overview**
- **Company news + sentiment analysis**
- **Next-day stock predictions** using TensorFlow models
- **AI assistant** powered by a LangGraph-based agent
- **User authentication** with email/password and Google sign-in support
- **Responsive UI** with dark/light theme support

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Primary backend: Python, FastAPI, Uvicorn
- Secondary backend: Node.js, Express, Mongoose, MongoDB
- ML / data: TensorFlow, yfinance, Alpha Vantage, NewsAPI, DuckDuckGo
- Auth: JSON Web Tokens, bcrypt

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+ and a virtual environment
- MongoDB (for the Node backend)

### Install dependencies

```bash
npm install
```

Then create and activate a Python virtual environment, and install Python dependencies:

```bash
cd backend_fastapi
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Environment variables

Create a `.env` file in the project root and add values for at least:

```env
MONGODB_URI=mongodb://localhost:27017/marketmind
JWT_SECRET=your_jwt_secret
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key
VITE_API_URL=
```

For the Python backend, optional variables include `DATABASE_URL` / `POSTGRES_URL` if you prefer Postgres over SQLite.

### Run locally

Start the frontend and FastAPI backend together:

```bash
npm run dev
```

This starts:
- frontend on `http://localhost:8080`
- FastAPI backend on `http://localhost:9000`

If you want the Node/Express auth + stock API, start it separately:

```bash
node server/index.js
```

### Verify endpoints

- `GET http://localhost:8080` → frontend app
- `POST http://localhost:5000/api/auth/signin` → auth
- `GET http://localhost:9000/api/news/market` → news endpoint
- `GET http://localhost:9000/api/predict/AAPL` → prediction endpoint

## Architecture Overview

- `src/` contains the React app and UI pages
- `backend_fastapi/` contains the Python API, ML utilities, and AI assistant
- `server/` contains the Node/Express auth & MongoDB service

Frontend API routing is configured in `vite.config.js`:
- `/api/auth` and `/api/stocks` proxy to the Node backend
- `/api/*` proxies to the FastAPI backend

## Notes

- News search uses a provider chain: Alpha Vantage → NewsAPI → DuckDuckGo fallback.
- Prediction endpoints are cached in memory to reduce repeated model loads.
- The AI assistant is streamed via FastAPI and a LangGraph agent.

## Useful scripts

- `npm run dev` — start the frontend and FastAPI backend
- `npm run build` — build the React app for production
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint for code quality

## Project Structure

- `src/` — React app
- `server/` — Node/Express auth, stock, and news API code
- `backend_fastapi/` — Python AI + prediction backend
- `public/` — static app assets
- `package.json` — frontend and root scripts
- `pyproject.toml` — Python project metadata

---

Built for fast market intelligence, predictive insight, and an intelligent assistant experience.