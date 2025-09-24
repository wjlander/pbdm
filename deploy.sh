#!/bin/bash

# Personal Finance Manager Deployment Script
# For Ubuntu/Debian servers

set -e

# Configuration
APP_NAME="personal-finance-manager"
APP_DIR="/var/www/$APP_NAME"
SERVICE_NAME="$APP_NAME"
NGINX_SITE="$APP_NAME"
USER="www-data"
GROUP="www-data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Function to install dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update package list
    apt update
    
    # Install Node.js 18.x
    if ! command -v node &> /dev/null; then
        log "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    else
        log "Node.js already installed: $(node --version)"
    fi
    
    # Install nginx
    if ! command -v nginx &> /dev/null; then
        log "Installing Nginx..."
        apt install -y nginx
    else
        log "Nginx already installed"
    fi
    
    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2..."
        npm install -g pm2
    else
        log "PM2 already installed"
    fi
    
    # Install other utilities
    apt install -y curl wget unzip git
}

# Function to create application directory
setup_app_directory() {
    log "Setting up application directory..."
    
    # Create app directory
    mkdir -p $APP_DIR
    
    # Set ownership
    chown -R $USER:$GROUP $APP_DIR
    
    # Set permissions
    chmod -R 755 $APP_DIR
}

# Function to build and deploy application
deploy_app() {
    log "Building and deploying application..."
    
    # Navigate to app directory
    cd $APP_DIR
    
    # Check if we're running from the source directory
    if [ -f "../package.json" ]; then
        log "Found source files in parent directory, copying..."
        cp -r ../* . 2>/dev/null || true
        # Remove the deploy script from the app directory to avoid conflicts
        rm -f deploy.sh update.sh 2>/dev/null || true
    elif [ -d "/tmp/app-source" ] && [ "$(ls -A /tmp/app-source 2>/dev/null)" ]; then
        log "Found source files in /tmp/app-source/, copying..."
        cp -r /tmp/app-source/* . 2>/dev/null || true
    else
        # Try to find source files in common locations
        SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        if [ -f "$SCRIPT_DIR/package.json" ]; then
            log "Found source files in script directory, copying..."
            cp -r "$SCRIPT_DIR"/* . 2>/dev/null || true
            # Remove deploy scripts from app directory
            rm -f deploy.sh update.sh 2>/dev/null || true
        else
            error "No source files found. Please ensure your application files are available in one of these locations:
            1. Run deploy.sh from your project directory
            2. Copy files to /tmp/app-source/
            3. Place deploy.sh in your project directory"
        fi
    fi
    
    # Install dependencies
    if [ -f "package.json" ]; then
        log "Installing Node.js dependencies..."
        npm install --production
        
        # Build the application
        log "Building application..."
        npm run build
        
        # Verify build was successful
        if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
            error "Build failed or dist directory is empty"
        fi
        
        log "Build completed successfully"
    else
        error "package.json not found. Please ensure your application files are properly copied."
    fi
    
    # Set proper ownership
    chown -R $USER:$GROUP $APP_DIR
}

# Function to configure Nginx
configure_nginx() {
    log "Configuring Nginx..."
    
    # Create Nginx site configuration
    cat > /etc/nginx/sites-available/$NGINX_SITE << EOF
server {
    listen 80;
    server_name localhost;
    
    root $APP_DIR/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
}
EOF
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/
    
    # Remove default site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t || error "Nginx configuration test failed"
    
    # Reload Nginx
    systemctl reload nginx
}

# Function to setup SSL (optional)
setup_ssl() {
    read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your domain name: " domain_name
        
        if [ -z "$domain_name" ]; then
            warn "No domain provided, skipping SSL setup"
            return
        fi
        
        # Install certbot
        apt install -y certbot python3-certbot-nginx
        
        # Update Nginx config with domain
        sed -i "s/server_name localhost;/server_name $domain_name;/" /etc/nginx/sites-available/$NGINX_SITE
        
        # Reload Nginx
        systemctl reload nginx
        
        # Get SSL certificate
        certbot --nginx -d $domain_name --non-interactive --agree-tos --email admin@$domain_name
        
        log "SSL certificate installed for $domain_name"
    fi
}

# Function to setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    # Install ufw if not present
    apt install -y ufw
    
    # Reset firewall rules
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 'Nginx Full'
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured and enabled"
}

# Function to create systemd service (if needed for API)
create_systemd_service() {
    if [ -f "$APP_DIR/server.js" ] || [ -f "$APP_DIR/app.js" ]; then
        log "Creating systemd service for Node.js backend..."
        
        cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Personal Finance Manager
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
        
        # Reload systemd and start service
        systemctl daemon-reload
        systemctl enable $SERVICE_NAME
        systemctl start $SERVICE_NAME
        
        log "Systemd service created and started"
    fi
}

# Function to setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    cat > /etc/logrotate.d/$APP_NAME << EOF
/var/log/nginx/*$APP_NAME* {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \`cat /var/run/nginx.pid\`
        fi
    endscript
}
EOF
}

# Function to create update script
create_update_script() {
    log "Creating update script..."
    
    cat > /usr/local/bin/update-$APP_NAME << 'EOF'
#!/bin/bash

APP_DIR="/var/www/personal-finance-manager"
BACKUP_DIR="/var/backups/personal-finance-manager"

# Create backup
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d_%H%M%S).tar.gz -C $APP_DIR .

# Update application (assuming source is in /tmp/app-source)
if [ -d "/tmp/app-source" ]; then
    cd $APP_DIR
    cp -r /tmp/app-source/* .
    npm ci --production
    npm run build
    chown -R www-data:www-data $APP_DIR
    systemctl reload nginx
    echo "Application updated successfully"
else
    echo "No source files found in /tmp/app-source"
    exit 1
fi
EOF
    
    chmod +x /usr/local/bin/update-$APP_NAME
    log "Update script created at /usr/local/bin/update-$APP_NAME"
}

# Function to display final information
show_final_info() {
    log "Deployment completed successfully!"
    echo
    echo "==================================="
    echo "Personal Finance Manager Deployed"
    echo "==================================="
    echo
    echo "Application Directory: $APP_DIR"
    echo "Nginx Configuration: /etc/nginx/sites-available/$NGINX_SITE"
    echo "Update Script: /usr/local/bin/update-$APP_NAME"
    echo
    echo "To update the application:"
    echo "1. Copy new files to /tmp/app-source/"
    echo "2. Run: sudo /usr/local/bin/update-$APP_NAME"
    echo
    echo "Useful commands:"
    echo "- Check Nginx status: systemctl status nginx"
    echo "- Check Nginx logs: tail -f /var/log/nginx/error.log"
    echo "- Reload Nginx: systemctl reload nginx"
    echo
    if command -v ufw &> /dev/null; then
        echo "Firewall status:"
        ufw status
    fi
    echo
}

# Main deployment function
main() {
    log "Starting Personal Finance Manager deployment..."
    
    install_dependencies
    setup_app_directory
    deploy_app
    configure_nginx
    setup_ssl
    setup_firewall
    create_systemd_service
    setup_log_rotation
    create_update_script
    show_final_info
}

# Run main function
main "$@"