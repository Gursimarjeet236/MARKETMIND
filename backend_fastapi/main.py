from fastapi import FastAPI, HTTPException, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import uuid
import asyncio
import os
import aiosqlite
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
try:
    from psycopg_pool import AsyncConnectionPool
    from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False
from datetime import datetime
import time
import httpx
import sys

# Import the factory
from agent import get_agent

# ML Prediction imports
from ml_utils import predict_stock, DJIA_STOCKS, VARIANT_FILE_PREFIX

from passlib.context import CryptContext
from duckduckgo_search import DDGS
import yfinance as yf

# Password Hashing Setup
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Load environment variables
load_dotenv()

app = FastAPI(title="Edith AI API")

# Use a router for /api namespace to avoid collisions with frontend routes
router = APIRouter(prefix="/api")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"[Request] {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"[Response] {request.method} {request.url.path} - {response.status_code}")
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application State Setup
@app.on_event("startup")
async def startup_event():
    try:
        # 1. Try Postgres (for Render/Production persistence)
        db_url = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL")
        if POSTGRES_AVAILABLE and db_url:
            print("[Startup] Connecting to Postgres pool...")
            app.state.db_pool = AsyncConnectionPool(
                conninfo=db_url,
                min_size=1,
                max_size=5,
                open=False,
            )
            await app.state.db_pool.open(wait=True, timeout=30)
            print("[Startup] Pool opened.")

            # Initialize Postgres Checkpointer
            memory = AsyncPostgresSaver(app.state.db_pool)
            await memory.setup()
            app.state.agent = get_agent(checkpointer=memory)

            # Initialize Custom Tables using pool connection
            async with app.state.db_pool.connection() as conn:
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        email TEXT UNIQUE,
                        password_hash TEXT,
                        name TEXT,
                        avatar TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS threads (
                        id TEXT PRIMARY KEY,
                        title TEXT,
                        user_id TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            app.state.db_conn = None   # not used in postgres mode
            app.state.db_type = "postgres"
            print("[Startup] Agent initialized with AsyncPostgresSaver")
            return

        # 2. Fallback to SQLite (for local development)
        print("[Startup] Falling back to SQLite...")
        os.makedirs("data", exist_ok=True)
        db_path = "data/memory.sqlite"
        app.state.db_conn = await aiosqlite.connect(db_path)
        app.state.db_pool = None
        memory = AsyncSqliteSaver(app.state.db_conn)
        app.state.agent = get_agent(checkpointer=memory)

        await app.state.db_conn.execute("""
            CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, name TEXT, avatar TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
        """)
        await app.state.db_conn.execute("""
            CREATE TABLE IF NOT EXISTS threads (id TEXT PRIMARY KEY, title TEXT, user_id TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
        """)
        await app.state.db_conn.commit()
        app.state.db_type = "sqlite"
        print("[Startup] Agent initialized with AsyncSqliteSaver")

    except Exception as e:
        print(f"[Startup] ERROR during initialization: {e}")
        import traceback
        traceback.print_exc()
        app.state.agent = get_agent(checkpointer=None)
        app.state.db_type = "none"
        app.state.db_conn = None
        app.state.db_pool = None

@app.on_event("shutdown")
async def shutdown_event():
    if hasattr(app.state, "db_pool") and app.state.db_pool:
        await app.state.db_pool.close()
    if hasattr(app.state, "db_conn") and app.state.db_conn:
        await app.state.db_conn.close()
    print("[Shutdown] DB connections closed")

# ── DB helper: normalizes SQLite (?) vs Postgres (%s) differences ─────────────
def _pg_query(sql: str) -> str:
    """Convert SQLite ? placeholders to Postgres %s placeholders."""
    return sql.replace("?", "%s")

async def db_execute(sql: str, params: tuple = ()):
    """Execute a write query."""
    if app.state.db_type == "postgres":
        async with app.state.db_pool.connection() as conn:
            await conn.execute(_pg_query(sql), params)
    elif app.state.db_conn:
        await app.state.db_conn.execute(sql, params)

async def db_commit():
    """Commit if using SQLite (Postgres pool auto-commits)."""
    if app.state.db_type != "postgres" and app.state.db_conn:
        await app.state.db_conn.commit()

async def db_fetchall(sql: str, params: tuple = ()) -> list:
    """Execute a SELECT and return all rows."""
    if app.state.db_type == "postgres":
        async with app.state.db_pool.connection() as conn:
            cursor = await conn.execute(_pg_query(sql), params)
            return await cursor.fetchall()
    elif app.state.db_conn:
        async with app.state.db_conn.execute(sql, params) as cursor:
            return await cursor.fetchall()
    return []

async def db_fetchone(sql: str, params: tuple = ()):
    """Execute a SELECT and return one row."""
    if app.state.db_type == "postgres":
        async with app.state.db_pool.connection() as conn:
            cursor = await conn.execute(_pg_query(sql), params)
            return await cursor.fetchone()
    elif app.state.db_conn:
        async with app.state.db_conn.execute(sql, params) as cursor:
            return await cursor.fetchone()
    return None

class ChatRequest(BaseModel):
    message: str
    thread_id: Optional[str] = None
    user_id: Optional[str] = None

class ThreadUpdate(BaseModel):
    title: str

@app.get("/")
async def health_check():
    return {"status": "healthy", "database": getattr(app.state, "db_type", "unknown")}



@router.get("/")
async def api_root():
    return {"status": "Edith AI API is running", "version": "2.5"}

@router.get("/history/{thread_id}")
async def get_history(thread_id: str):
    try:
        agent = app.state.agent
        config = {"configurable": {"thread_id": thread_id}}
        state = await agent.aget_state(config)
        messages = state.values.get("messages", [])
        
        formatted = []
        for msg in messages:
            # msg is a BaseMessage
            role = "user" if msg.type == "human" else "assistant"
            if msg.type in ["human", "ai"]:
                 formatted.append({
                    "role": role,
                    "content": msg.content
                })
        return {"messages": formatted}
    except Exception as e:
        print(f"Error fetching history: {e}")
        return {"messages": []}

@router.get("/threads")
async def get_threads(user_id: Optional[str] = None):
    try:
        if not user_id:
            return {"threads": []}
        rows = await db_fetchall(
            "SELECT id, title, created_at FROM threads WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,)
        )
        threads = [{"id": row[0], "title": row[1] or "New Chat", "created_at": row[2]} for row in rows]
        return {"threads": threads}
    except Exception as e:
        print(f"Error fetching threads: {e}")
        return {"threads": []}

@router.delete("/threads/{thread_id}")
async def delete_thread(thread_id: str):
    try:
        await db_execute("DELETE FROM threads WHERE id = ?", (thread_id,))
        await db_commit()
        return {"status": "Thread deleted"}
    except Exception as e:
        print(f"Error deleting thread: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/threads/{thread_id}")
async def update_thread(thread_id: str, update: ThreadUpdate):
    try:
        await db_execute("UPDATE threads SET title = ? WHERE id = ?", (update.title, thread_id))
        await db_commit()
        return {"status": "Thread updated"}
    except Exception as e:
        print(f"Error updating thread: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history")
async def clear_all_history():
    try:
        await db_execute("DELETE FROM checkpoints")
        await db_execute("DELETE FROM threads")
        await db_commit()
        return {"status": "History cleared"}
    except Exception as e:
        print(f"Error clearing history: {e}")
        return {"status": "History cleared (or empty)"}

# --- Auth Endpoints ---

class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleProfile(BaseModel):
    googleId: str
    email: str
    name: str
    avatar: Optional[str] = None

@router.post("/auth/signup")
async def signup(user: UserRegister):
    existing = await db_fetchone("SELECT id FROM users WHERE email = ?", (user.email,))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    hashed_pw = get_password_hash(user.password)
    await db_execute(
        "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
        (user_id, user.email, hashed_pw, user.name)
    )
    await db_commit()
    return {
        "user": {"id": user_id, "email": user.email, "name": user.name},
        "token": "dummy_token_" + user_id
    }

@router.post("/auth/signin")
async def signin(user: UserLogin):
    row = await db_fetchone("SELECT id, name, password_hash FROM users WHERE email = ?", (user.email,))
    if not row:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    user_id, name, pw_hash = row
    if not verify_password(user.password, pw_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {
        "user": {"id": user_id, "email": user.email, "name": name},
        "token": "dummy_token_" + user_id
    }

@router.post("/auth/google")
async def google_auth(profile: GoogleProfile):
    row = await db_fetchone("SELECT id, name FROM users WHERE email = ?", (profile.email,))
    if row:
        user_id, name = row
        return {
            "user": {"id": user_id, "email": profile.email, "name": name, "avatar": profile.avatar},
            "token": "dummy_token_" + user_id
        }
    else:
        user_id = str(uuid.uuid4())
        await db_execute(
            "INSERT INTO users (id, email, password_hash, name, avatar) VALUES (?, ?, ?, ?, ?)",
            (user_id, profile.email, "google_auth", profile.name, profile.avatar)
        )
        await db_commit()
        return {
            "user": {"id": user_id, "email": profile.email, "name": profile.name, "avatar": profile.avatar},
            "token": "dummy_token_" + user_id
        }

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Streaming chat endpoint using LangGraph.
    """
    thread_id = request.thread_id
    is_new_thread = False
    
    if not thread_id:
        # If client says null, we must generate one. However, the client should probably generate one to avoid losing it.
        # But if we generate it here, we must return it? Protocol doesn't easily support returning ID in stream unless we inject it.
        # STRATEGY: Frontend will always generate a UUID for new chats.
        # Fallback if somehow missing:
        thread_id = str(uuid.uuid4())
        is_new_thread = True
    
    # Check if thread exists in our metadata table
    exists = await db_fetchone("SELECT 1 FROM threads WHERE id = ?", (thread_id,))
    if not exists:
        is_new_thread = True

    if is_new_thread:
        title = request.message[:30].strip()
        if len(request.message) > 30:
            title += "..."
        await db_execute(
            "INSERT INTO threads (id, title, user_id) VALUES (?, ?, ?)",
            (thread_id, title, request.user_id)
        )
        await db_commit()
    else:
        await db_execute("UPDATE threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (thread_id,))
        await db_commit()

    async def event_generator():
        try:
            agent = app.state.agent
            config = {"configurable": {"thread_id": thread_id}}
            input_state = {"messages": [("user", request.message)]}

            async for event in agent.astream_events(input_state, config, version="v2"):
                kind = event["event"]
                # For v2, content is in data.chunk.content for stream events
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        yield content
                        await asyncio.sleep(0.04)
        except Exception as e:
            import traceback
            print(f"ERROR in chat_endpoint: {e}")
            traceback.print_exc()
            yield f"Error: {str(e)}"

    return StreamingResponse(event_generator(), media_type="text/plain")

# --- ML Prediction Endpoints ---

@router.get("/predict/{symbol}")
async def predict_single(symbol: str, model: str = "refined_regcn"):
    """
    Run prediction for a single DJIA stock symbol (e.g. AAPL, MSFT).
    Optional query param: ?model=refined_regcn (default) or ?model=gcnattn
    Returns predicted next-day price, direction, and confidence.
    """
    if model not in VARIANT_FILE_PREFIX:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{model}'. Supported: {', '.join(VARIANT_FILE_PREFIX.keys())}"
        )
    try:
        result = await asyncio.get_event_loop().run_in_executor(
            None, predict_stock, symbol.upper(), model
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Prediction error for {symbol} (model={model}): {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/predictions")
async def predict_all(symbols: Optional[str] = None, model: str = "refined_regcn"):
    """
    Run predictions for a comma-separated list of symbols (default: featured stocks).
    E.g. /api/predictions?symbols=AAPL,MSFT&model=gcnattn
    Optional query param: ?model=refined_regcn (default) or ?model=gcnattn
    Returns a list of prediction objects for the frontend.
    """
    if model not in VARIANT_FILE_PREFIX:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{model}'. Supported: {', '.join(VARIANT_FILE_PREFIX.keys())}"
        )
    if symbols:
        symbol_list = [s.strip().upper() for s in symbols.split(",")]
    else:
        symbol_list = DJIA_STOCKS[:10]

    results = []
    errors  = []
    loop = asyncio.get_event_loop()

    for sym in symbol_list:
        try:
            pred = await loop.run_in_executor(None, predict_stock, sym, model)
            
            # Fetch strictly fresh price from yfinance specifically as requested
            try:
                hist = yf.Ticker(sym).history(period="1d")
                if not hist.empty:
                    fresh_price = float(hist['Close'].iloc[-1])
                    # Recalculate based on fresh price
                    price_change = pred["predicted_price"] - fresh_price
                    pred["current_price"] = round(fresh_price, 2)
                    pred["direction"] = "up" if price_change > 0 else "down"
                    pred["pct_change"] = round(price_change / (fresh_price + 1e-8) * 100, 2)
            except Exception as yf_e:
                print(f"Warning: Failed to fetch fresh yfinance price for {sym}: {yf_e}")

            results.append(pred)
        except Exception as e:
            errors.append({"symbol": sym, "error": str(e)})

    return {"predictions": results, "errors": errors}

@router.get("/validate_ticker/{symbol}")
async def validate_ticker(symbol: str):
    """
    Validates if a ticker exists via yfinance.
    """
    try:
        ticker = yf.Ticker(symbol.upper())
        hist = ticker.history(period="1d")
        if not hist.empty:
            return {"valid": True, "symbol": symbol.upper()}
        return {"valid": False, "symbol": symbol.upper()}
    except Exception:
        return {"valid": False, "symbol": symbol.upper()}

@router.get("/news_fallback/{query}")
async def news_fallback(query: str):
    """
    Fallback news search using DuckDuckGo. E.g. query='CRM stock news'
    Returns top 5 articles.
    """
    try:
        results = list(DDGS().text(query + " stock news market", max_results=5))
        formatted_news = []
        for r in results:
            formatted_news.append({
                "title": r.get('title', 'Unknown News'),
                "snippet": r.get('body', ''),
                "url": r.get('href', '#')
            })
        return {"news": formatted_news}
    except Exception as e:
        print(f"DDGS Error: {e}")
        return {"news": []}


# ──────────────────────────────────────────────
# News API — Alpha Vantage + NewsAPI + DDGS
# ──────────────────────────────────────────────

# 60-second in-memory cache: { query: (timestamp, articles) }
_news_cache: dict = {}
_NEWS_CACHE_TTL = 60  # seconds


def _map_av_sentiment(label: str) -> str:
    """Map Alpha Vantage sentiment label → positive / neutral / negative."""
    label_lower = (label or "").lower()
    if "bullish" in label_lower:
        return "positive"
    if "bearish" in label_lower:
        return "negative"
    return "neutral"


async def _fetch_alpha_vantage(query: str) -> list:
    """Primary provider: Alpha Vantage NEWS_SENTIMENT."""
    api_key = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    if not api_key:
        return []

    if query.lower() == "market":
        url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey={api_key}"
    else:
        url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers={query.upper()}&apikey={api_key}"

    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.get(url)
            data = resp.json()

        # Check for rate-limit or error
        if "Information" in data or "Note" in data or "feed" not in data:
            print(f"[AV] quota/error for '{query}': {data.get('Information') or data.get('Note') or 'no feed key'}")
            return []

        articles = []
        for item in data["feed"][:10]:  # AV has no limit param, slice manually
            # Resolve best sentiment: if ticker-specific, use ticker_sentiment; else overall
            sentiment_label = item.get("overall_sentiment_label", "Neutral")
            symbol = query.upper() if query.lower() != "market" else ""

            # If ticker-level sentiment is available, prefer it
            for ts in item.get("ticker_sentiment", []):
                if ts.get("ticker", "").upper() == query.upper():
                    sentiment_label = ts.get("ticker_sentiment_label", sentiment_label)
                    break

            articles.append({
                "title": item.get("title", ""),
                "summary": item.get("summary", ""),
                "url": item.get("url", "#"),
                "source": item.get("source", ""),
                "publishedAt": item.get("time_published", ""),
                "symbol": symbol,
                "sentiment": _map_av_sentiment(sentiment_label),
            })
        return articles
    except Exception as e:
        print(f"[AV] exception for '{query}': {e}")
        return []


async def _fetch_newsapi(query: str) -> list:
    """Secondary provider: NewsAPI.org."""
    api_key = os.getenv("NEWS_API_KEY", "")
    if not api_key:
        return []

    if query.lower() == "market":
        url = f"https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey={api_key}&pageSize=10"
    else:
        url = f"https://newsapi.org/v2/everything?q={query}&sortBy=publishedAt&language=en&apiKey={api_key}&pageSize=10"

    try:
        async with httpx.AsyncClient(timeout=12) as client:
            resp = await client.get(url)
            data = resp.json()

        if data.get("status") != "ok" or not data.get("articles"):
            print(f"[NewsAPI] bad response for '{query}': {data.get('message', '')}")
            return []

        articles = []
        symbol = query.upper() if query.lower() != "market" else ""
        for item in data["articles"][:10]:
            articles.append({
                "title": item.get("title") or "",
                "summary": item.get("description") or "",
                "url": item.get("url", "#"),
                "source": (item.get("source") or {}).get("name", ""),
                "publishedAt": item.get("publishedAt", ""),
                "symbol": symbol,
                "sentiment": "neutral",  # NewsAPI has no sentiment; default neutral
            })
        return articles
    except Exception as e:
        print(f"[NewsAPI] exception for '{query}': {e}")
        return []


async def _fetch_ddgs(query: str) -> list:
    """Tertiary provider: DuckDuckGo full-text search."""
    search_term = "financial market news" if query.lower() == "market" else f"{query} stock news"
    try:
        results = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: list(DDGS().text(search_term, max_results=10))
        )
        symbol = query.upper() if query.lower() != "market" else ""
        articles = []
        for r in results:
            articles.append({
                "title": r.get("title", ""),
                "summary": r.get("body", ""),
                "url": r.get("href", "#"),
                "source": "DuckDuckGo",
                "publishedAt": "",
                "symbol": symbol,
                "sentiment": "neutral",
            })
        return articles
    except Exception as e:
        print(f"[DDGS] exception for '{query}': {e}")
        return []


@router.get("/news/{query}")
async def get_news(query: str):
    """
    Unified news endpoint.
    query='market'  → top global financial news
    query='AAPL'    → company-specific news

    Provider chain: Alpha Vantage → NewsAPI → DuckDuckGo
    60-second per-query cache to honour AV rate limits.
    """
    cache_key = query.lower()
    now = time.time()

    # Return cached result if fresh
    if cache_key in _news_cache:
        ts, cached_articles = _news_cache[cache_key]
        if now - ts < _NEWS_CACHE_TTL:
            print(f"[Cache HIT] '{query}' ({int(now - ts)}s old)")
            return {"articles": cached_articles, "source": "cache"}

    # Provider chain
    try:
        articles = await _fetch_alpha_vantage(query)
        provider = "alpha_vantage"

        if not articles:
            print(f"[AV] no results for '{query}', trying NewsAPI…")
            articles = await _fetch_newsapi(query)
            provider = "newsapi"

        if not articles:
            print(f"[NewsAPI] no results for '{query}', trying DuckDuckGo…")
            articles = await _fetch_ddgs(query)
            provider = "duckduckgo"
    except Exception as e:
        print(f"[News] Unhandled provider exception for '{query}': {e}")
        # If all providers crash midway, graceful fallback so the frontend doesn't 500
        articles = []
        provider = "error_fallback"

    # Cache result even for empty arrays to prevent hammering the APIs with the same broken query
    _news_cache[cache_key] = (now, articles)
    print(f"[News] '{query}' → {len(articles)} articles via {provider}")
    return {"articles": articles, "source": provider}


# Mount router AFTER all routes are defined
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9000)
