FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for TensorFlow and PostgreSQL client
RUN apt-get update && apt-get install -y \
    libgomp1 gcc g++ libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose FastAPI port
EXPOSE 9000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000"]
