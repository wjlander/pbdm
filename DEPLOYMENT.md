# Deployment Guide

## Quick Start

### Option 1: One-Command Deployment (Recommended)
```bash
# From your project directory
chmod +x setup-deployment.sh
./setup-deployment.sh
sudo ./deploy.sh
```

### Option 2: Manual Preparation
```bash
# Build your application
npm install
npm run build

# Copy files to server deployment location
sudo mkdir -p /tmp/app-source
sudo cp -r * /tmp/app-source/

# Run deployment
sudo ./deploy.sh
```

## Detailed Instructions

### Prerequisites
- Ubuntu/Debian server with sudo access
- Internet connection for package installation

### Step 1: Prepare Your Application
Run the setup script to build and prepare your application:
```bash
chmod +x setup-deployment.sh
./setup-deployment.sh
```

This will:
- Validate your project structure
- Build the application locally
- Create a deployment package
- Show deployment options

### Step 2: Deploy to Server

#### Local Deployment (same machine):
```bash
sudo ./deploy.sh
```

#### Remote Server Deployment:
1. Copy the `deploy-package` folder to your server
2. On the server, navigate to the deploy-package directory
3. Run: `sudo ./deploy.sh`

### Step 3: Access Your Application
After successful deployment:
- HTTP: `http://your-server-ip`
- HTTPS: `https://your-domain.com` (if SSL configured)

## What the Deployment Script Does

1. **System Setup**:
   - Installs Node.js 18.x
   - Installs and configures Nginx
   - Installs PM2 for process management

2. **Application Deployment**:
   - Creates application directory (`/var/www/personal-finance-manager`)
   - Copies and builds your application
   - Sets proper permissions

3. **Web Server Configuration**:
   - Configures Nginx with security headers
   - Sets up gzip compression
   - Configures client-side routing support

4. **Security Setup**:
   - Configures UFW firewall
   - Sets up SSL with Let's Encrypt (optional)
   - Applies security headers

5. **Maintenance Tools**:
   - Creates update script
   - Sets up log rotation
   - Creates backup system

## Updating Your Application

After initial deployment, use the update script:
```bash
# Copy new files to /tmp/app-source/
sudo /usr/local/bin/update-personal-finance-manager

# Or rollback if needed
sudo /usr/local/bin/update-personal-finance-manager --rollback
```

## Troubleshooting

### Common Issues:

1. **"package.json not found"**:
   - Ensure you're running from your project directory
   - Or copy all files to `/tmp/app-source/` first

2. **"Build failed"**:
   - Check Node.js version: `node --version` (should be 18+)
   - Verify dependencies: `npm install`
   - Check build locally: `npm run build`

3. **"Permission denied"**:
   - Run deployment script with sudo: `sudo ./deploy.sh`

4. **"Port already in use"**:
   - Check if Nginx is already running: `sudo systemctl status nginx`
   - Stop conflicting services if needed

### Logs and Monitoring:
- Nginx logs: `/var/log/nginx/`
- Application logs: Check systemctl status if backend service exists
- Deployment logs: Displayed during script execution

## Security Notes

- The application uses HTTPS with Let's Encrypt certificates
- Firewall is configured to allow only necessary ports (22, 80, 443)
- Security headers are applied via Nginx
- Regular backups are created during updates

## File Locations

- Application: `/var/www/personal-finance-manager`
- Nginx config: `/etc/nginx/sites-available/personal-finance-manager`
- Update script: `/usr/local/bin/update-personal-finance-manager`
- Backups: `/var/backups/personal-finance-manager`