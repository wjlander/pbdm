import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, PieChart, Calculator, Target, Calendar, Menu, X, Car, Heart, Camera, Bell, User, CheckCircle } from 'lucide-react';
import SupabaseLoginForm from './components/SupabaseLoginForm';
import SupabaseUserProfile from './components/SupabaseUserProfile';
import IncomeTracker from './components/IncomeTracker';
import ExpenseManager from './components/ExpenseManager';
import DebtManager from './components/DebtManager';
import BudgetAnalysis from './components/BudgetAnalysis';
import Dashboard from './components/Dashboard';
import PayBillCalendar from './components/PayBillCalendar';
import VehicleManager from './components/VehicleManager';
import SavingsGoals from './components/SavingsGoals';
import CouplesDashboard from './components/CouplesDashboard';
import NotificationCenter from './components/NotificationCenter';
import BillTracker from './components/BillTracker';
import ReceiptScanner from './components/ReceiptScanner';
import OnboardingWizard from './components/OnboardingWizard';
import MobileNavigation from './components/MobileNavigation';
import QuickActions from './components/QuickActions';
import LoadingSpinner from './components/LoadingSpinner';
import CloudBackup from './components/CloudBackup';
import SecurityAudit from './components/SecurityAudit';
import DatabaseStatus from './components/DatabaseStatus';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { useSupabaseBudgetData } from './hooks/useSupabaseBudgetData';

function App() {
  const { user, loading: authLoading, signOut, updateProfile } = useSupabaseAuth();
  const { budgetData, setBudgetData, loading: dataLoading, error: dataError } = useSupabaseBudgetData(user);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  
  // Check if user needs onboarding (no budget data yet)
  const needsOnboarding = user && budgetData && !dataLoading && (
    !budgetData.income?.biweeklyNet || 
    budgetData.income.biweeklyNet === 0 ||
    !budgetData.emergencyFund?.target || 
    budgetData.emergencyFund.target === 0
  );
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleDataUpdate = (newData: any) => {
    setIsLoading(true);
    setTimeout(() => {
      setBudgetData(newData);
      setIsLoading(false);
    }, 300); // Simulate processing time
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleProfileUpdate = (updates: any) => {
    try {
      updateProfile(updates);
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Show loading spinner while checking authentication or loading data
  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text={authLoading ? "Checking authentication..." : "Loading your financial data..."} />
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <SupabaseLoginForm />;
  }
  
  // Show error if data loading failed
  if (dataError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4">
              <X className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Database Error</h2>
            <p className="text-slate-600 mb-4">{dataError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showOnboarding || needsOnboarding) {
    return (
      <OnboardingWizard
        budgetData={budgetData}
        setBudgetData={handleDataUpdate}
        onComplete={completeOnboarding}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Updating your financial data..." />
      </div>
    );
  }

  // Create currentUser object for compatibility with existing components
  const currentUser = user ? {
    id: user.id,
    username: user.email?.split('@')[0] || 'user',
    displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
    role: 'primary' as const
  } : null;
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: PieChart },
    { id: 'couples', name: 'Couples', icon: Heart },
    { id: 'calendar', name: 'Pay Calendar', icon: Calendar },
    { id: 'income', name: 'Income', icon: DollarSign },
    { id: 'expenses', name: 'Expenses', icon: TrendingUp },
    { id: 'vehicles', name: 'Vehicles', icon: Car },
    { id: 'debts', name: 'Debts', icon: CreditCard },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'bills', name: 'Bill Tracker', icon: CheckCircle },
    { id: 'analysis', name: 'Analysis', icon: Calculator },
    { id: 'backup', name: 'Backup', icon: Bell },
    { id: 'security', name: 'Security', icon: Bell },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'couples':
        return <CouplesDashboard budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'calendar':
        return <PayBillCalendar budgetData={budgetData} />;
      case 'income':
        return <IncomeTracker budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'expenses':
        return <ExpenseManager budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'vehicles':
        return <VehicleManager budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'debts':
        return <DebtManager budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'goals':
        return <SavingsGoals budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'bills':
        return <BillTracker budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'analysis':
        return <BudgetAnalysis budgetData={budgetData} />;
      case 'backup':
        return <CloudBackup currentUser={currentUser} />;
      case 'security':
        return <SecurityAudit currentUser={currentUser} />;
      case 'profile':
        return (
          <div className="space-y-6">
            <DatabaseStatus user={user} />
            <SupabaseUserProfile />
          </div>
        );
      default:
        return <Dashboard budgetData={budgetData} setBudgetData={handleDataUpdate} />;
    }
  };

  const handleReceiptExpense = (expense: any) => {
    const newExpense = {
      id: Date.now().toString(),
      name: expense.name,
      amount: expense.amount,
      category: expense.category
    };

    setBudgetData({
      ...budgetData,
      expenses: {
        ...budgetData.expenses,
        [expense.category]: [...budgetData.expenses[expense.category], newExpense]
      }
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-16 md:pb-0">
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">Personal Finance Manager</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Welcome, {currentUser?.displayName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter budgetData={budgetData} setBudgetData={handleDataUpdate} />
              
              <button
                onClick={() => setShowReceiptScanner(true)}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
                title="Scan Receipt"
              >
                <Camera className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`p-2 rounded-lg transition-colors hidden md:block ${
                  activeTab === 'profile' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="User Profile"
              >
                <User className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium hidden md:block"
              >
                Setup Wizard
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Navigation */}
        <nav className="mb-8 hidden md:block">
          <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 md:hidden">
            <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-semibold text-slate-800">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowOnboarding(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                  >
                    Setup Wizard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="space-y-6">
          {renderTabContent()}
        </main>
        
        <QuickActions budgetData={budgetData} setBudgetData={handleDataUpdate} />
      </div>
      
      {showReceiptScanner && (
        <ReceiptScanner
          onExpenseExtracted={handleReceiptExpense}
          onClose={() => setShowReceiptScanner(false)}
        />
      )}
      
      <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;