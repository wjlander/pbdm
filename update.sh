#!/bin/bash

# Personal Finance Manager Update Script
# For Ubuntu/Debian servers
sudo mkdir -p /tmp/app-source
sudo cp -r * /tmp/app-source/
sudo rm -f /tmp/app-source/deploy.sh /tmp/app-source/update.sh
set -e

# Configuration
APP_NAME="personal-finance-manager"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
USER="www-data"
GROUP="www-data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

# Function to create backup
create_backup() {
    log "Creating backup of current application..."
    
    # Create backup directory if it doesn't exist
    mkdir -p $BACKUP_DIR
    
    # Create timestamped backup
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    if [ -d "$APP_DIR" ]; then
        tar -czf $BACKUP_FILE -C $APP_DIR . 2>/dev/null || warn "Some files could not be backed up"
        log "Backup created: $BACKUP_FILE"
        
        # Keep only last 10 backups
        cd $BACKUP_DIR
        ls -t backup-*.tar.gz | tail -n +11 | xargs -r rm
        log "Old backups cleaned up (keeping last 10)"
    else
        warn "Application directory not found, skipping backup"
    fi
}

# Function to check for source files
check_source_files() {
    if [ ! -d "/tmp/app-source" ]; then
        error "Source files not found in /tmp/app-source. Please copy your updated application files there first."
    fi
    
    if [ ! -f "/tmp/app-source/package.json" ]; then
        error "package.json not found in source files"
    fi
    
    log "Source files validated"
}

# Function to stop services
stop_services() {
    log "Stopping services..."
    
    # Stop application service if it exists
    if systemctl is-active --quiet $APP_NAME 2>/dev/null; then
        systemctl stop $APP_NAME
        log "Stopped $APP_NAME service"
    fi
}

# Function to start services
start_services() {
    log "Starting services..."
    
    # Start application service if it exists
    if systemctl is-enabled --quiet $APP_NAME 2>/dev/null; then
        systemctl start $APP_NAME
        log "Started $APP_NAME service"
    fi
    
    # Reload nginx
    systemctl reload nginx
    log "Reloaded Nginx"
}

# Function to update application
update_application() {
    log "Updating application files..."
    
    # Navigate to app directory
    cd $APP_DIR
    
    # Copy new files
    cp -r /tmp/app-source/* .
    log "Application files updated"
    
    # Install/update dependencies
    log "Installing dependencies..."
    npm ci --silent
    
    # Build application
    log "Building application..."
    npm run build --silent
    
    # Clean up dev dependencies after build
    log "Cleaning up development dependencies..."
    npm prune --production --silent
    
    # Set proper ownership and permissions
    chown -R $USER:$GROUP $APP_DIR
    chmod -R 755 $APP_DIR
    
    log "Application build completed"
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if dist directory exists and has files
    if [ ! -d "$APP_DIR/dist" ] || [ -z "$(ls -A $APP_DIR/dist)" ]; then
        error "Build directory is missing or empty"
    fi
    
    # Check if index.html exists
    if [ ! -f "$APP_DIR/dist/index.html" ]; then
        error "index.html not found in build directory"
    fi
    
    # Test Nginx configuration
    nginx -t || error "Nginx configuration test failed"
    
    # Check if Nginx is running
    if ! systemctl is-active --quiet nginx; then
        error "Nginx is not running"
    fi
    
    log "Deployment verification passed"
}

# Function to rollback if needed
rollback() {
    warn "Rolling back to previous version..."
    
    # Find the most recent backup
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/backup-*.tar.gz 2>/dev/null | head -n 1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    # Stop services
    stop_services
    
    # Remove current files
    rm -rf $APP_DIR/*
    
    # Restore from backup
    tar -xzf $LATEST_BACKUP -C $APP_DIR
    
    # Set permissions
    chown -R $USER:$GROUP $APP_DIR
    
    # Start services
    start_services
    
    log "Rollback completed using backup: $LATEST_BACKUP"
}

# Function to cleanup
cleanup() {
    log "Cleaning up temporary files..."
    
    # Remove source files
    rm -rf /tmp/app-source
    
    # Clean npm cache
    npm cache clean --force --silent 2>/dev/null || true
    
    log "Cleanup completed"
}

# Function to show update summary
show_summary() {
    log "Update completed successfully!"
    echo
    echo "=================================="
    echo "Update Summary"
    echo "=================================="
    echo
    echo "Application: Personal Finance Manager"
    echo "Updated: $(date)"
    echo "Location: $APP_DIR"
    echo
    echo "Services Status:"
    echo "- Nginx: $(systemctl is-active nginx)"
    if systemctl is-enabled --quiet $APP_NAME 2>/dev/null; then
        echo "- $APP_NAME: $(systemctl is-active $APP_NAME)"
    fi
    echo
    echo "Recent backups:"
    ls -la $BACKUP_DIR/backup-*.tar.gz 2>/dev/null | tail -n 3 || echo "No backups found"
    echo
    echo "To rollback if needed:"
    echo "sudo /usr/local/bin/update-$APP_NAME --rollback"
    echo
}

# Function to handle rollback option
handle_rollback() {
    echo "Available backups:"
    ls -la $BACKUP_DIR/backup-*.tar.gz 2>/dev/null || error "No backups found"
    echo
    read -p "Do you want to rollback to the most recent backup? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rollback
    else
        log "Rollback cancelled"
    fi
}

# Main update function
main() {
    log "Starting Personal Finance Manager update..."
    
    # Handle command line arguments
    if [ "$1" = "--rollback" ]; then
        handle_rollback
        exit 0
    fi
    
    # Trap errors and attempt rollback
    trap 'error "Update failed! Run with --rollback to restore previous version."' ERR
    
    create_backup
    check_source_files
    stop_services
    update_application
    start_services
    verify_deployment
    cleanup
    show_summary
}

# Show usage if help requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Personal Finance Manager Update Script"
    echo
    echo "Usage:"
    echo "  $0                 Update the application"
    echo "  $0 --rollback      Rollback to previous version"
    echo "  $0 --help          Show this help message"
    echo
    echo "Before running update:"
    echo "1. Copy your updated application files to /tmp/app-source/"
    echo "2. Ensure the files include package.json and all source code"
    echo "3. Run this script as root (with sudo)"
    echo
    exit 0
fi

# Run main function
main "$@"
