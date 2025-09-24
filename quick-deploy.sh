#!/bin/bash

# Quick Deployment Script for Personal Finance Manager
# This script handles the complete deployment process

set -e

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

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log "Starting Personal Finance Manager deployment..."
log "Script directory: $SCRIPT_DIR"

# Check if we have the necessary files
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
    error "package.json not found in $SCRIPT_DIR. Please run this script from your project directory."
fi

# Create the source directory and copy files
log "Preparing source files..."
mkdir -p /tmp/app-source
cp -r "$SCRIPT_DIR"/* /tmp/app-source/ 2>/dev/null || true

# Remove deployment scripts from source to avoid conflicts
rm -f /tmp/app-source/deploy.sh /tmp/app-source/update.sh /tmp/app-source/quick-deploy.sh 2>/dev/null || true

# Verify files were copied
if [ ! -f "/tmp/app-source/package.json" ]; then
    error "Failed to copy source files to /tmp/app-source/"
fi

log "Source files prepared successfully"

# Run the main deployment script
if [ -f "$SCRIPT_DIR/deploy.sh" ]; then
    log "Running main deployment script..."
    bash "$SCRIPT_DIR/deploy.sh"
else
    error "deploy.sh not found in $SCRIPT_DIR"
fi

log "Deployment completed successfully!"