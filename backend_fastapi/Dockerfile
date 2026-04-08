# ---- Builder stage ----
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Install build tools needed for compiling heavy packages (e.g., TensorFlow)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only the requirements file first for layer caching
COPY requirements.txt .

# Upgrade pip and install all Python dependencies into a virtual environment
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt && \
    rm -rf /tmp/pip-*

# ---- Runtime stage (minimal) ----
FROM python:3.11-slim AS runtime

# Set working directory
WORKDIR /app

# Copy the virtual environment from the builder stage (only the needed packages)
COPY --from=builder /opt/venv /opt/venv

# Ensure the venv is used for all subsequent commands
ENV PATH="/opt/venv/bin:$PATH"

# Install runtime system dependencies (only what the app needs at run‑time)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy application source code (excluding the requirements file which is already satisfied)
COPY . .

# Expose the port Cloud Run injects via $PORT (default 8080)
EXPOSE 8080

# Start the app with gunicorn + uvicorn workers
CMD exec gunicorn main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 1 \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --graceful-timeout 30
