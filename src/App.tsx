import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, PieChart, Calculator, Target, Calendar, Menu, X } from 'lucide-react';
import IncomeTracker from './components/IncomeTracker';
import ExpenseManager from './components/ExpenseManager';
import DebtManager from './components/DebtManager';
import BudgetAnalysis from './components/BudgetAnalysis';
import Dashboard from './components/Dashboard';
import PayBillCalendar from './components/PayBillCalendar';
import OnboardingWizard from './components/OnboardingWizard';
import MobileNavigation from './components/MobileNavigation';
import QuickActions from './components/QuickActions';
import LoadingSpinner from './components/LoadingSpinner';
import useLocalStorage from './hooks/useLocalStorage';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useLocalStorage('showOnboarding', true);
  
  const [budgetData, setBudgetData] = useLocalStorage('budgetData', {
    income: {
      biweeklyGross: 0,
      taxRate: 0.25,
      nextPayDate: new Date().toISOString().split('T')[0]
    },
    expenses: {
      fixed: [],
      variable: [],
      discretionary: [],
      twentyEightDay: []
    },
    debts: [],
    emergencyFund: {
      current: 0,
      target: 0
    },
    savingsGoals: []
  });

  const [savingsGoals, setSavingsGoals] = useLocalStorage('savingsGoals', []);

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

  if (showOnboarding) {
    return (
      <OnboardingWizard
        budgetData={budgetData}
        setBudgetData={setBudgetData}
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

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: PieChart },
    { id: 'calendar', name: 'Pay Calendar', icon: Calendar },
    { id: 'income', name: 'Income', icon: DollarSign },
    { id: 'expenses', name: 'Expenses', icon: TrendingUp },
    { id: 'debts', name: 'Debts', icon: CreditCard },
    { id: 'analysis', name: 'Analysis', icon: Calculator }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'calendar':
        return <PayBillCalendar budgetData={budgetData} />;
      case 'income':
        return <IncomeTracker budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'expenses':
        return <ExpenseManager budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'debts':
        return <DebtManager budgetData={budgetData} setBudgetData={handleDataUpdate} />;
      case 'analysis':
        return <BudgetAnalysis budgetData={budgetData} />;
      default:
        return <Dashboard budgetData={budgetData} setBudgetData={handleDataUpdate} />;
    }
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
                <p className="text-xs text-slate-500 hidden sm:block">Track • Plan • Achieve</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
      
      <MobileNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;