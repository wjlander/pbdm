import React from 'react';
import { PieChart, Calendar, DollarSign, TrendingUp, CreditCard, Calculator, Car, Heart, Target, User, Cloud, Shield } from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: PieChart },
    { id: 'couples', name: 'Couples', icon: Heart },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'income', name: 'Income', icon: DollarSign },
    { id: 'expenses', name: 'Expenses', icon: TrendingUp },
    { id: 'vehicles', name: 'Vehicles', icon: Car },
    { id: 'debts', name: 'Debts', icon: CreditCard },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'analysis', name: 'Analysis', icon: Calculator },
    { id: 'backup', name: 'Backup', icon: Cloud },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 md:hidden overflow-x-auto">
      <div className="flex min-w-max h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors min-w-[80px] px-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium whitespace-nowrap">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;