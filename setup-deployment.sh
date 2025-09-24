#!/bin/bash

# Personal Finance Manager - Deployment Setup Script
# This script prepares your application for deployment

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

# Check if we're in the right directory
check_project_directory() {
    if [ ! -f "package.json" ]; then
        error "package.json not found. Please run this script from your project root directory."
    fi
    
    if [ ! -f "deploy.sh" ]; then
        error "deploy.sh not found. Please ensure all deployment files are present."
    fi
    
    log "Project directory validated"
}

# Build the application locally first
build_application() {
    log "Building application locally..."
    
    # Install dependencies
    if command -v npm &> /dev/null; then
        npm install
        npm run build
    else
        error "npm not found. Please install Node.js and npm first."
    fi
    
    # Verify build
    if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
        error "Build failed or dist directory is empty"
    fi
    
    log "Local build completed successfully"
}

# Prepare files for deployment
prepare_deployment() {
    log "Preparing files for deployment..."
    
    # Create deployment package
    DEPLOY_DIR="deploy-package"
    rm -rf $DEPLOY_DIR
    mkdir -p $DEPLOY_DIR
    
    # Copy necessary files
    cp package.json $DEPLOY_DIR/
    cp -r dist $DEPLOY_DIR/
    cp -r src $DEPLOY_DIR/
    cp *.md $DEPLOY_DIR/ 2>/dev/null || true
    cp *.json $DEPLOY_DIR/ 2>/dev/null || true
    cp *.js $DEPLOY_DIR/ 2>/dev/null || true
    
    # Copy deployment scripts
    cp deploy.sh $DEPLOY_DIR/
    cp update.sh $DEPLOY_DIR/
    
    log "Deployment package created in $DEPLOY_DIR/"
}

# Show deployment instructions
show_instructions() {
    echo
    echo "=================================="
    echo "Deployment Instructions"
    echo "=================================="
    echo
    echo "Your application is ready for deployment!"
    echo
    echo "Option 1 - Deploy from current directory:"
    echo "  sudo ./deploy.sh"
    echo
    echo "Option 2 - Copy to server and deploy:"
    echo "  1. Copy the 'deploy-package' folder to your server"
    echo "  2. On the server, run: sudo ./deploy.sh"
    echo
    echo "Option 3 - Manual file preparation:"
    echo "  1. Copy all files to /tmp/app-source/ on your server"
    echo "  2. Run: sudo ./deploy.sh"
    echo
    echo "The deployment script will:"
    echo "  - Install Node.js, Nginx, and dependencies"
    echo "  - Build and deploy your application"
    echo "  - Configure SSL (optional)"
    echo "  - Set up firewall rules"
    echo "  - Create update scripts"
    echo
    echo "After deployment, your app will be available at:"
    echo "  http://your-server-ip"
    echo "  https://your-domain.com (if SSL configured)"
    echo
}

# Main function
main() {
    log "Starting deployment preparation..."
    
    check_project_directory
    build_application
    prepare_deployment
    show_instructions
    
    log "Deployment preparation completed!"
}

# Run main function
main "$@"