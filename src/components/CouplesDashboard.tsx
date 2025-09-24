import React, { useState } from 'react';
import { Users, Heart, Target, DollarSign, TrendingUp, Settings, Eye, EyeOff } from 'lucide-react';

interface CouplesDashboardProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
}

interface PartnerData {
  id: string;
  name: string;
  income: {
    biweeklyGross: number;
    taxRate: number;
    nextPayDate: string;
  };
  individualExpenses: {
    discretionary: any[];
    personal: any[];
  };
  privacySettings: {
    showIncome: boolean;
    showPersonalExpenses: boolean;
    showDebtDetails: boolean;
  };
}

const CouplesDashboard: React.FC<CouplesDashboardProps> = ({ budgetData, setBudgetData }) => {
  const [activePartner, setActivePartner] = useState<'self' | 'partner'>('self');
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [partnerData, setPartnerData] = useState<Partial<PartnerData>>({
    name: '',
    income: {
      biweeklyGross: 0,
      taxRate: 0.25,
      nextPayDate: new Date().toISOString().split('T')[0]
    },
    privacySettings: {
      showIncome: true,
      showPersonalExpenses: false,
      showDebtDetails: false
    }
  });

  const partner = budgetData.partner;
  const hasPartner = !!partner;

  const addPartner = () => {
    if (!partnerData.name) return;

    setBudgetData({
      ...budgetData,
      partner: {
        id: Date.now().toString(),
        name: partnerData.name,
        income: partnerData.income,
        individualExpenses: {
          discretionary: [],
          personal: []
        },
        privacySettings: partnerData.privacySettings
      }
    });

    setShowAddPartner(false);
    setPartnerData({
      name: '',
      income: {
        biweeklyGross: 0,
        taxRate: 0.25,
        nextPayDate: new Date().toISOString().split('T')[0]
      },
      privacySettings: {
        showIncome: true,
        showPersonalExpenses: false,
        showDebtDetails: false
      }
    });
  };

  const calculateCombinedIncome = () => {
    const selfMonthlyIncome = (budgetData.income.biweeklyGross * (1 - budgetData.income.taxRate) * 26) / 12;
    const partnerMonthlyIncome = partner 
      ? (partner.income.biweeklyGross * (1 - partner.income.taxRate) * 26) / 12 
      : 0;
    
    return {
      self: selfMonthlyIncome,
      partner: partnerMonthlyIncome,
      combined: selfMonthlyIncome + partnerMonthlyIncome
    };
  };

  const calculateSharedGoalsProgress = () => {
    const sharedGoals = budgetData.savingsGoals?.filter((goal: any) => goal.isShared) || [];
    const totalTarget = sharedGoals.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0);
    const totalCurrent = sharedGoals.reduce((sum: number, goal: any) => sum + goal.currentAmount, 0);
    
    return {
      goals: sharedGoals,
      totalTarget,
      totalCurrent,
      progress: totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const incomeData = calculateCombinedIncome();
  const sharedGoalsData = calculateSharedGoalsProgress();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-pink-600" />
            <h2 className="text-xl font-semibold text-slate-800">Couple's Financial Dashboard</h2>
          </div>
          
          {!hasPartner && (
            <button
              onClick={() => setShowAddPartner(true)}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Add Partner</span>
            </button>
          )}
        </div>

        {!hasPartner ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-pink-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Better Together</h3>
            <p className="text-slate-600 mb-6">
              Add your partner to track shared goals, manage joint expenses, and plan your financial future together.
            </p>
            <button
              onClick={() => setShowAddPartner(true)}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            {/* Combined Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Combined Income</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(incomeData.combined)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Shared Goals</p>
                    <p className="text-2xl font-bold text-blue-700">{sharedGoalsData.goals.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Goals Progress</p>
                    <p className="text-2xl font-bold text-purple-700">{sharedGoalsData.progress.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-600">Emergency Fund</p>
                    <p className="text-2xl font-bold text-pink-700">{formatCurrency(budgetData.emergencyFund.current)}</p>
                  </div>
                  <span className="h-8 w-8 text-pink-600 font-bold text-xl flex items-center justify-center">£</span>
                </div>
              </div>
            </div>

            {/* Partner Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">You</h3>
                  <button className="text-slate-600 hover:text-slate-800">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Income</span>
                    <span className="font-semibold">{formatCurrency(incomeData.self)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Contribution %</span>
                    <span className="font-semibold">
                      {((incomeData.self / incomeData.combined) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Personal Expenses</span>
                    <span className="font-semibold">
                      {formatCurrency(budgetData.expenses.discretionary.reduce((sum: number, exp: any) => sum + exp.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">{partner.name}</h3>
                  <div className="flex items-center space-x-2">
                    {partner.privacySettings.showIncome ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    )}
                    <button className="text-slate-600 hover:text-slate-800">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monthly Income</span>
                    <span className="font-semibold">
                      {partner.privacySettings.showIncome 
                        ? formatCurrency(incomeData.partner)
                        : '••••••'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Contribution %</span>
                    <span className="font-semibold">
                      {partner.privacySettings.showIncome 
                        ? `${((incomeData.partner / incomeData.combined) * 100).toFixed(1)}%`
                        : '••••'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Personal Expenses</span>
                    <span className="font-semibold">
                      {partner.privacySettings.showPersonalExpenses 
                        ? formatCurrency(partner.individualExpenses.discretionary.reduce((sum: number, exp: any) => sum + exp.amount, 0))
                        : '••••••'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shared Goals */}
            {sharedGoalsData.goals.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-6">Shared Goals</h3>
                
                <div className="space-y-4">
                  {sharedGoalsData.goals.map((goal: any) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    
                    return (
                      <div key={goal.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-slate-800">{goal.name}</h4>
                          <span className="text-sm text-slate-600">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                        
                        <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                          <div
                            className="bg-pink-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>{progress.toFixed(1)}% complete</span>
                          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Partner Modal */}
      {showAddPartner && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Add Your Partner</h3>
              <button
                onClick={() => setShowAddPartner(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Partner's Name
                </label>
                <input
                  type="text"
                  value={partnerData.name || ''}
                  onChange={(e) => setPartnerData({ ...partnerData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter partner's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Biweekly Gross Income
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
                  <input
                    type="number"
                    value={partnerData.income?.biweeklyGross || ''}
                    onChange={(e) => setPartnerData({
                      ...partnerData,
                      income: { ...partnerData.income!, biweeklyGross: Number(e.target.value) }
                    })}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="2500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Privacy Settings
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={partnerData.privacySettings?.showIncome || false}
                      onChange={(e) => setPartnerData({
                        ...partnerData,
                        privacySettings: {
                          ...partnerData.privacySettings!,
                          showIncome: e.target.checked
                        }
                      })}
                      className="rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">Share income details</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddPartner(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPartner}
                disabled={!partnerData.name}
                className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouplesDashboard;