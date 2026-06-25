import os
import warnings
warnings.filterwarnings("ignore")
import logging
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
        "You are Edith, the professional AI financial assistant for MarketMind.\n"
        "Your goal is to provide accurate stock prices, market predictions, and financial explanations.\n\n"
        "GUIDELINES:\n"
        "1. For questions about stock prices or predictions, use the appropriate tool (get_stock_price or predict_stock_price) immediately. Do not make multiple redundant tool calls.\n"
        "2. Present tool outputs in a clean, human-friendly, and professional format. Do not just print raw numbers; explain what they represent (e.g., 'The predicted next-day price for Microsoft (MSFT) is $392.82...').\n"
        "3. Only use the 'predict_stock_price' tool for stocks in the supported list: AAPL, AMGN, BA, CAT, CRM, CSCO, CVX, DIS, GS, HD, HON, IBM, INTC, JNJ, JPM, KO, MCD, MMM, MRK, MSFT, NKE, PG, TRV, UNH, V, VZ, WBA, WMT. If a prediction is requested for any other stock, say: 'Prediction cannot be done for this company at the moment. It will be taken care of in the future.'\n"
        "4. If a user asks for predictions spanning multiple days or different time horizons, respond: 'I can only provide next-day predictions at the moment. I will support different time horizons in the future.'\n"
        "5. For general financial education and technical indicators (like RSI, Bollinger Bands, etc.), explain them clearly using your own pre-trained knowledge. Do not call any tools.\n"
        "6. Maintain conversational context. If the user asks follow-up questions like 'what is this?', refer back to the previous messages in the conversation to explain the context of the numbers or concepts discussed."
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