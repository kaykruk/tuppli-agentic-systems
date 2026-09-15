#!/bin/bash
set -euo pipefail

DOMAIN="n8n.tuppli.com"
EMAIL="admin@tuppli.com" # Change if needed

echo "--- Installing Nginx and Certbot ---"
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

echo "--- Configuring Nginx ---"
cat > /etc/nginx/sites-available/n8n <<EOF
server {
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }

    listen 80;
}
EOF

ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

echo "--- Requesting SSL Certificate ---"
# Use --non-interactive and --agree-tos for automation
certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive --redirect

echo "--- SSL Setup Complete ---"
