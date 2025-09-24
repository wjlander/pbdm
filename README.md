# Personal Finance Manager

A comprehensive personal budgeting and debt management application designed for individuals and couples to track income, manage expenses, and achieve financial goals.

## Features

### 📊 Dashboard & Analytics
- Real-time financial health score
- Monthly cash flow analysis
- Emergency fund progress tracking
- Spending breakdown by category
- Quick action buttons for common tasks

### 💰 Income Management
- Biweekly pay schedule tracking
- Tax rate calculations
- Annual income projections
- Pay date calendar with 26 pay periods

### 📋 Expense Tracking
- **Fixed Monthly**: Rent, insurance, subscriptions
- **Variable Monthly**: Utilities, groceries
- **Discretionary**: Entertainment, dining out
- **28-Day Cycle**: Bills that don't align with monthly cycles

### 💳 Debt Management
- Multiple debt tracking
- Payoff strategy comparison (Snowball vs Avalanche)
- Interest rate optimization
- Payment scheduling
- Payoff timeline projections

### 📅 Pay & Bill Calendar
- Visual cash flow planning
- Bill due date tracking
- Reserve amount calculations
- 28-day cycle impact analysis
- Money management tips

### 🎯 Smart Features
- **Onboarding Wizard**: Guided setup for new users
- **Mobile-First Design**: Responsive interface for all devices
- **Quick Actions**: Floating action buttons for rapid data entry
- **Local Storage**: Data persistence without external dependencies
- **Loading States**: Smooth user experience with visual feedback

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Hooks + Local Storage
- **Deployment**: Static files (can be hosted anywhere)

## Installation & Deployment

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd personal-finance-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Deployment (Ubuntu/Debian)

The application includes automated deployment scripts for Ubuntu/Debian servers:

#### Initial Deployment

```bash
# Copy your built application to the server
scp -r dist/* user@your-server:/tmp/app-source/

# Run the deployment script
sudo bash deploy.sh
```

The deployment script will:
- Install Node.js, Nginx, and PM2
- Configure Nginx with security headers and gzip compression
- Set up SSL with Let's Encrypt (optional)
- Configure firewall rules
- Create systemd services
- Set up log rotation

#### Updates

```bash
# Copy updated files to server
scp -r dist/* user@your-server:/tmp/app-source/

# Run the update script
sudo /usr/local/bin/update-personal-finance-manager
```

The update script will:
- Create automatic backups
- Deploy new version
- Verify deployment
- Provide rollback option if needed

#### Rollback

```bash
# Rollback to previous version
sudo /usr/local/bin/update-personal-finance-manager --rollback
```

## Usage Guide

### First Time Setup

1. **Welcome Screen**: Introduction to features
2. **Income Setup**: Enter biweekly salary and tax rate
3. **Emergency Fund**: Set your target emergency fund
4. **Primary Goal**: Choose your main financial objective
5. **Completion**: Start using the application

### Daily Usage

1. **Dashboard**: Monitor your financial health score and key metrics
2. **Quick Actions**: Use floating buttons to quickly add expenses
3. **Pay Calendar**: Plan your cash flow around pay dates
4. **Expense Tracking**: Categorize and track all spending
5. **Debt Management**: Monitor payoff progress and strategies

### Mobile Experience

- **Bottom Navigation**: Easy thumb-friendly navigation
- **Swipe Gestures**: Natural mobile interactions
- **Quick Actions**: Floating action buttons for rapid data entry
- **Responsive Design**: Optimized for all screen sizes

## Key Improvements Implemented

### High Priority
1. **Onboarding Experience**: Guided setup wizard for new users
2. **Mobile Optimization**: Bottom navigation and responsive design
3. **Data Persistence**: Local storage for offline functionality
4. **Quick Actions**: Floating buttons for rapid data entry
5. **Loading States**: Visual feedback during operations

### Medium Priority
6. **Interactive Dashboard**: Quick emergency fund updates
7. **Visual Feedback**: Progress indicators and success states
8. **Deployment Automation**: Complete server setup scripts

### Technical Enhancements
- **Performance**: Optimized loading and smooth transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Security**: Content Security Policy and security headers
- **Monitoring**: Comprehensive logging and error handling

## File Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard with metrics
│   ├── IncomeTracker.tsx       # Biweekly income management
│   ├── ExpenseManager.tsx      # Expense categorization
│   ├── DebtManager.tsx         # Debt tracking and payoff
│   ├── BudgetAnalysis.tsx      # Financial analysis
│   ├── PayBillCalendar.tsx     # Cash flow calendar
│   ├── OnboardingWizard.tsx    # First-time setup
│   ├── MobileNavigation.tsx    # Mobile bottom nav
│   ├── QuickActions.tsx        # Floating action buttons
│   └── LoadingSpinner.tsx      # Loading states
├── hooks/
│   └── useLocalStorage.ts      # Local storage hook
├── App.tsx                     # Main application
└── main.tsx                    # Application entry point
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the deployment logs

---

**Personal Finance Manager** - Take control of your financial future with intelligent budgeting and debt management.