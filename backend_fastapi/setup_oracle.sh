#!/bin/bash
# =============================================================
# MarketMind Backend — Oracle Cloud VM Setup Script
# Run this once on a fresh Ubuntu 22.04 Oracle VM
# Usage: bash setup_oracle.sh
# =============================================================

set -e  # Exit immediately if a command fails

echo "=================================================="
echo "  MarketMind Backend — Oracle Cloud Setup"
echo "=================================================="

# ── 1. System Update ─────────────────────────────────────────
echo "[1/8] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# ── 2. Install Dependencies ──────────────────────────────────
echo "[2/8] Installing system dependencies..."
sudo apt-get install -y \
    python3 python3-pip python3-venv \
    gcc g++ libpq-dev \
    nginx certbot python3-certbot-nginx \
    git curl ufw

# ── 3. Open Firewall Ports ───────────────────────────────────
echo "[3/8] Configuring UFW firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 8000
sudo ufw --force enable

# ── 4. Create App Directory ──────────────────────────────────
echo "[4/8] Setting up application directory..."
sudo mkdir -p /opt/marketmind
sudo chown ubuntu:ubuntu /opt/marketmind

# ── 5. Python Virtual Environment ───────────────────────────
echo "[5/8] Creating Python virtual environment..."
python3 -m venv /opt/marketmind/venv
source /opt/marketmind/venv/bin/activate

# ── 6. Install Python Packages ───────────────────────────────
echo "[6/8] Installing Python dependencies..."
pip install --upgrade pip
pip install -r /opt/marketmind/backend_fastapi/requirements.txt

# ── 7. Create systemd Service ────────────────────────────────
echo "[7/8] Creating systemd service..."
sudo tee /etc/systemd/system/marketmind.service > /dev/null <<EOF
[Unit]
Description=MarketMind FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/marketmind/backend_fastapi
Environment="PATH=/opt/marketmind/venv/bin"
EnvironmentFile=/opt/marketmind/backend_fastapi/.env
ExecStart=/opt/marketmind/venv/bin/gunicorn main:app \\
    --worker-class uvicorn.workers.UvicornWorker \\
    --workers 2 \\
    --bind 127.0.0.1:8000 \\
    --timeout 120 \\
    --graceful-timeout 30 \\
    --access-logfile /var/log/marketmind/access.log \\
    --error-logfile /var/log/marketmind/error.log
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo mkdir -p /var/log/marketmind
sudo chown ubuntu:ubuntu /var/log/marketmind

sudo systemctl daemon-reload
sudo systemctl enable marketmind
sudo systemctl start marketmind

# ── 8. Configure Nginx ───────────────────────────────────────
echo "[8/8] Configuring Nginx reverse proxy..."
sudo tee /etc/nginx/sites-available/marketmind > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    # Allow large uploads (for future use)
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Important for SSE/streaming responses (Ask Edith)
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/marketmind /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=================================================="
echo "  Setup Complete!"
echo "  Backend is running on http://$(curl -s ifconfig.me)"
echo "=================================================="
