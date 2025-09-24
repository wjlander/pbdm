import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, PieChart, Calculator, Target } from 'lucide-react';
import IncomeTracker from './components/IncomeTracker';
import ExpenseManager from './components/ExpenseManager';
import DebtManager from './components/DebtManager';
import BudgetAnalysis from './components/BudgetAnalysis';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [budgetData, setBudgetData] = useState({
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

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: PieChart },
    { id: 'income', name: 'Income', icon: DollarSign },
    { id: 'expenses', name: 'Expenses', icon: TrendingUp },
    { id: 'debts', name: 'Debts', icon: CreditCard },
    { id: 'analysis', name: 'Analysis', icon: Calculator }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard budgetData={budgetData} />;
      case 'income':
        return <IncomeTracker budgetData={budgetData} setBudgetData={setBudgetData} />;
      case 'expenses':
        return <ExpenseManager budgetData={budgetData} setBudgetData={setBudgetData} />;
      case 'debts':
        return <DebtManager budgetData={budgetData} setBudgetData={setBudgetData} />;
      case 'analysis':
        return <BudgetAnalysis budgetData={budgetData} />;
      default:
        return <Dashboard budgetData={budgetData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Personal Finance Manager</h1>
            </div>
            <div className="text-sm text-slate-600">
              Track • Plan • Achieve
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8">
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

        <main className="space-y-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

export default App;