import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import warnings
warnings.filterwarnings("ignore")
import logging
logging.getLogger("tensorflow").setLevel(logging.ERROR)
import requests
from dotenv import load_dotenv
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from duckduckgo_search import DDGS
import yfinance as yf

from pydantic import BaseModel, Field

from ml_utils import predict_stock

load_dotenv()

class StockTickerInput(BaseModel):
    query: str = Field(description="The exact stock ticker symbol (e.g., 'AAPL', 'MSFT'). Do not pass full company names or sentences.")

class SearchInput(BaseModel):
    query: str = Field(description="The search query.")

# --------------------------------
# Supported Prediction Tickers
# --------------------------------

SUPPORTED_PREDICTION_TICKERS = [
    "AAPL", "AMGN", "BA", "CAT", "CRM", "CSCO", "CVX", "DIS", "GS", "HD", 
    "HON", "IBM", "INTC", "JNJ", "JPM", "KO", "MCD", "MMM", "MRK", "MSFT", 
    "NKE", "PG", "TRV", "UNH", "V", "VZ", "WBA", "WMT"
]

# --------------------------------
# Tool: Current Stock Price
# --------------------------------

@tool("get_stock_price", args_schema=StockTickerInput)
def get_stock_price(query: str):
    """Get current stock price and daily change."""

    symbol = query.strip().upper()

    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2d") # Faster retrieval

        if hist is None or hist.empty:
            return f"No price data found for {symbol}"

        current_price = float(hist["Close"].dropna().iloc[-1])

        if len(hist) >= 2:
            prev_close = hist["Close"].iloc[-2]
            daily_change = current_price - prev_close
            change_pct = (daily_change / prev_close) * 100
            change_str = f"{daily_change:+.2f} ({change_pct:+.2f}%)"
        else:
            change_str = "N/A"

        return f"""
Ticker: {symbol}
Current Price: ${current_price:.2f}
Daily Change: {change_str}
"""

    except Exception as e:
        return f"Error fetching stock price for {symbol}: {str(e)}"


# --------------------------------
# Tool: Web Search
# --------------------------------

@tool("web_search", args_schema=SearchInput)
def web_search(query: str):
    """Search financial explanations or news."""

    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=5))

        if not results:
            return "No results found."

        formatted = "\n\n".join(
            [f"{r['title']}\n{r['body']}" for r in results]
        )

        return formatted

    except Exception as e:
        return f"Search error: {str(e)}"


# --------------------------------
# Tool: ML Stock Prediction
# --------------------------------

@tool("predict_stock_price", args_schema=StockTickerInput)
def predict_stock_price(query: str):
    """Predict the future price of a stock (e.g., AAPL). Use this for forecast, prediction, or future price questions."""

    try:
        # Normalize symbol
        s = query.strip().upper()
        
        if s not in SUPPORTED_PREDICTION_TICKERS:
            return "Prediction cannot be done for this company at the moment. It will be taken care of in the future."

        data = predict_stock(s, "refined_regcn")

        return f"""
Stock: {s}
Current Price: ${data.get("current_price")}
Predicted Price: ${data.get("predicted_price")}
Direction: {data.get("direction")}
Confidence: {data.get("confidence")}%
"""

    except Exception as e:
        return f"Prediction failed for {query}: {str(e)}"


# --------------------------------
# Register Tools
# --------------------------------

tools = [
    get_stock_price,
    web_search,
    predict_stock_price
]


# --------------------------------
# LLM Model (Groq)
# --------------------------------

chat_model = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    streaming=True
)

# --------------------------------
# Agent Factory
# --------------------------------

def get_agent(checkpointer=None):
    """
    Creates and returns the Edith AI agent.
    """
    
    system_message = (
        "You are Edith, a professional financial assistant for MarketMind. "
        "Your goal is to provide accurate stock prices, market predictions, and financial explanations. "
        "Follow these rules STRICTLY: "
        "1. For any request, call the relevant tool ONCE and once only. "
        "2. After you receive the output from a tool, immediately provide the answer to the user and then STOP. "
        "3. DO NOT call any more tools after you have provided the final answer. "
        "4. Never say 'Let me check again' or 'I will verify' after you already have the data. "
        "5. If a tool returns an error or no data, DO NOT say 'No data found'. Instead, answer the user's question using your own general financial knowledge directly. "
        "6. If a prediction is requested for a stock not in 'AAPL, AMGN, BA, CAT, CRM, CSCO, CVX, DIS, GS, HD, HON, IBM, INTC, JNJ, JPM, KO, MCD, MMM, MRK, MSFT, NKE, PG, TRV, UNH, V, VZ, WBA, WMT', respond: 'Prediction cannot be done for this company at the moment. It will be taken care of in the future.' "
        "7. For general financial education (e.g. 'What is RSI?'), DO NOT call any tool. Rely on your own rich pre-trained knowledge to provide a helpful answer immediately. "
        "8. Remember the prediction tool only gives next-day predictions. "
        "9. If the user asks for prediction for more than one day, respond: 'I can only provide next-day predictions at the moment. I will support different time horizons in the future.'"
    )

    return create_react_agent(
        chat_model,
        tools,
        checkpointer=checkpointer,
        prompt=system_message
    )


# --------------------------------
# Local Test
# --------------------------------

if __name__ == "__main__":

    print("\nStarting Edith AI agent...\n")

    agent = get_agent()

    result = agent.invoke({
        "messages": [("user", "Predict Apple stock tomorrow")]
    })

    print("FINAL RESPONSE:\n")
    print(result["messages"][-1].content)