import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, AlertCircle, Target } from 'lucide-react';

interface DashboardProps {
  budgetData: any;
}

const Dashboard: React.FC<DashboardProps> = ({ budgetData }) => {
  const calculateMonthlyIncome = () => {
    const biweeklyNet = budgetData.income.biweeklyGross * (1 - budgetData.income.taxRate);
    return (biweeklyNet * 26) / 12;
  };

  const calculateMonthlyExpenses = () => {
    const fixedTotal = budgetData.expenses.fixed.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const variableTotal = budgetData.expenses.variable.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const discretionaryTotal = budgetData.expenses.discretionary.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const twentyEightDayTotal = budgetData.expenses.twentyEightDay.reduce((sum: number, exp: any) => sum + (exp.amount * 13) / 12, 0);
    
    return fixedTotal + variableTotal + discretionaryTotal + twentyEightDayTotal;
  };

  const calculateTotalDebt = () => {
    return budgetData.debts.reduce((sum: number, debt: any) => sum + debt.balance, 0);
  };

  const monthlyIncome = calculateMonthlyIncome();
  const monthlyExpenses = calculateMonthlyExpenses();
  const totalDebt = calculateTotalDebt();
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  const stats = [
    {
      name: 'Monthly Net Income',
      value: monthlyIncome,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      name: 'Monthly Expenses',
      value: monthlyExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      name: 'Monthly Surplus/Deficit',
      value: monthlySurplus,
      icon: monthlySurplus >= 0 ? TrendingUp : AlertCircle,
      color: monthlySurplus >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: monthlySurplus >= 0 ? 'bg-green-50' : 'bg-red-50',
      borderColor: monthlySurplus >= 0 ? 'border-green-200' : 'border-red-200'
    },
    {
      name: 'Total Debt',
      value: totalDebt,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const emergencyFundProgress = budgetData.emergencyFund.target > 0 
    ? (budgetData.emergencyFund.current / budgetData.emergencyFund.target) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`${stat.bgColor} ${stat.borderColor} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.name}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {formatCurrency(stat.value)}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-800">Emergency Fund Progress</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Current: {formatCurrency(budgetData.emergencyFund.current)}</span>
              <span className="text-slate-600">Target: {formatCurrency(budgetData.emergencyFund.target)}</span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(emergencyFundProgress, 100)}%` }}
              ></div>
            </div>
            
            <div className="text-center">
              <span className="text-lg font-semibold text-blue-600">
                {emergencyFundProgress.toFixed(1)}% Complete
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Quick Insights</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Annual Net Income</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(monthlyIncome * 12)}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Annual Expenses</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(monthlyExpenses * 12)}
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Expense Ratio</span>
              <span className="font-semibold text-slate-800">
                {monthlyIncome > 0 ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1) : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600">Savings Rate</span>
              <span className={`font-semibold ${monthlySurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyIncome > 0 ? ((monthlySurplus / monthlyIncome) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Next Steps & Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlySurplus < 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-800">Budget Deficit</h4>
              </div>
              <p className="text-sm text-red-700">
                You're spending more than you earn. Review expenses and consider increasing income.
              </p>
            </div>
          )}
          
          {budgetData.emergencyFund.current < monthlyExpenses * 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Emergency Fund</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Build your emergency fund to cover 3-6 months of expenses.
              </p>
            </div>
          )}
          
          {totalDebt > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Debt Reduction</h4>
              </div>
              <p className="text-sm text-blue-700">
                Focus on paying down high-interest debt first to save on interest costs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;