import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface BudgetAnalysisProps {
  budgetData: any;
}

const BudgetAnalysis: React.FC<BudgetAnalysisProps> = ({ budgetData }) => {
  const calculateMonthlyIncome = () => {
    const biweeklyNet = budgetData.income.biweeklyNet || 0;
    return (biweeklyNet * 26) / 12;
  };

  const calculateExpensesByCategory = () => {
    const fixed = budgetData.expenses.fixed.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const variable = budgetData.expenses.variable.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const discretionary = budgetData.expenses.discretionary.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const twentyEightDay = budgetData.expenses.twentyEightDay.reduce((sum: number, exp: any) => sum + (exp.amount * 13) / 12, 0);
    
    return { fixed, variable, discretionary, twentyEightDay };
  };

  const calculateDebtPayments = () => {
    return budgetData.debts.reduce((sum: number, debt: any) => sum + debt.minimumPayment, 0);
  };

  const generate28DayImpactAnalysis = () => {
    const analysis = [];
    const currentDate = new Date();
    
    // Look at next 12 months
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() + month, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + month + 1, 0);
      
      let monthlyTwentyEightDayTotal = 0;
      
      budgetData.expenses.twentyEightDay.forEach((expense: any) => {
        if (!expense.dueDate) return;
        
        const dueDate = new Date(expense.dueDate);
        let currentDueDate = new Date(dueDate);
        
        // Find all instances of this 28-day expense in this month
        while (currentDueDate <= monthEnd) {
          if (currentDueDate >= monthStart && currentDueDate <= monthEnd) {
            monthlyTwentyEightDayTotal += expense.amount;
          }
          currentDueDate.setDate(currentDueDate.getDate() + 28);
          
          if (currentDueDate > new Date(currentDate.getFullYear() + 1, 11, 31)) break;
        }
      });
      
      analysis.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        twentyEightDayTotal: monthlyTwentyEightDayTotal,
        isHighMonth: monthlyTwentyEightDayTotal > (budgetData.expenses.twentyEightDay.reduce((sum: number, exp: any) => sum + exp.amount, 0) * 13) / 12
      });
    }
    
    return analysis;
  };

  const monthlyIncome = calculateMonthlyIncome();
  const expenses = calculateExpensesByCategory();
  const debtPayments = calculateDebtPayments();
  const totalExpenses = expenses.fixed + expenses.variable + expenses.discretionary + expenses.twentyEightDay + debtPayments;
  const monthlySurplus = monthlyIncome - totalExpenses;
  const twentyEightDayAnalysis = generate28DayImpactAnalysis();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getHealthScore = () => {
    let score = 100;
    
    // Negative if spending more than earning
    if (monthlySurplus < 0) score -= 30;
    
    // Deduct for high debt payments
    if (debtPayments > monthlyIncome * 0.3) score -= 20;
    
    // Deduct for low emergency fund
    if (budgetData.emergencyFund.current < expenses.fixed * 3) score -= 15;
    
    // Deduct for high discretionary spending
    if (expenses.discretionary > monthlyIncome * 0.2) score -= 10;
    
    // Add points for good savings rate
    if (monthlySurplus > monthlyIncome * 0.2) score += 15;
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = getHealthScore();
  
  const getHealthColor = (score: number) => {
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const healthColors = getHealthColor(healthScore);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Budget Analysis</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${healthColors.bg} ${healthColors.border} border-2 rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Financial Health Score</h3>
              <div className={`text-3xl font-bold ${healthColors.color}`}>
                {healthScore}/100
              </div>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  healthScore >= 80 ? 'bg-green-500' : healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
            
            <div className="space-y-2 text-sm">
              {monthlySurplus >= 0 ? (
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>Positive cash flow</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Spending exceeds income</span>
                </div>
              )}
              
              {budgetData.emergencyFund.current >= expenses.fixed * 3 ? (
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>Adequate emergency fund</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-yellow-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Build emergency fund</span>
                </div>
              )}
              
              {debtPayments <= monthlyIncome * 0.3 ? (
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>Manageable debt load</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  <span>High debt payments</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Monthly Net Income</span>
              <span className="font-semibold text-green-600">{formatCurrency(monthlyIncome)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Fixed Expenses</span>
              <span className="font-semibold text-slate-800">{formatCurrency(expenses.fixed)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Variable Expenses</span>
              <span className="font-semibold text-slate-800">{formatCurrency(expenses.variable)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">28-Day Cycle (Monthly Avg)</span>
              <span className="font-semibold text-slate-800">{formatCurrency(expenses.twentyEightDay)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Discretionary</span>
              <span className="font-semibold text-slate-800">{formatCurrency(expenses.discretionary)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Debt Payments</span>
              <span className="font-semibold text-orange-600">{formatCurrency(debtPayments)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-4">
              <span className="font-semibold text-slate-800">Net Cash Flow</span>
              <span className={`text-xl font-bold ${monthlySurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlySurplus)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Spending Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Fixed', amount: expenses.fixed, color: 'bg-blue-500' },
            { name: 'Variable', amount: expenses.variable, color: 'bg-green-500' },
            { name: 'Discretionary', amount: expenses.discretionary, color: 'bg-purple-500' },
            { name: '28-Day Cycle', amount: expenses.twentyEightDay, color: 'bg-orange-500' }
          ].map((category) => {
            const percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0;
            return (
              <div key={category.name} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">{category.name}</span>
                  <span className="text-sm text-slate-500">{percentage.toFixed(1)}%</span>
                </div>
                
                <div className="text-lg font-semibold text-slate-800 mb-3">
                  {formatCurrency(category.amount)}
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${category.color}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {budgetData.expenses.twentyEightDay.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">28-Day Cycle Impact Analysis</h3>
          
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> 28-day billing cycles don't align with calendar months, creating variable monthly expenses. 
              Some months will have higher costs when multiple 28-day cycles occur.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {twentyEightDayAnalysis.map((month, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  month.isHighMonth 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="text-sm font-medium text-slate-800 mb-2">
                  {month.month}
                </div>
                
                <div className={`text-lg font-semibold ${
                  month.isHighMonth ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(month.twentyEightDayTotal)}
                </div>
                
                {month.isHighMonth && (
                  <div className="text-xs text-red-600 mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    High month
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Average Monthly</div>
              <div className="text-lg font-semibold text-slate-800">
                {formatCurrency(expenses.twentyEightDay)}
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-600 mb-1">Highest Month</div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(Math.max(...twentyEightDayAnalysis.map(m => m.twentyEightDayTotal)))}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Lowest Month</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(Math.min(...twentyEightDayAnalysis.map(m => m.twentyEightDayTotal)))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Immediate Actions</h4>
            
            {monthlySurplus < 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-red-800">Address Budget Deficit</h5>
                    <p className="text-sm text-red-700 mt-1">
                      You're spending {formatCurrency(Math.abs(monthlySurplus))} more than you earn each month. 
                      Focus on reducing discretionary spending or increasing income.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {expenses.discretionary > monthlyIncome * 0.15 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <span className="h-5 w-5 text-yellow-600 mt-0.5 font-bold flex items-center justify-center">£</span>
                  <div>
                    <h5 className="font-semibold text-yellow-800">Review Discretionary Spending</h5>
                    <p className="text-sm text-yellow-700 mt-1">
                      Discretionary spending is {((expenses.discretionary / monthlyIncome) * 100).toFixed(1)}% of income. 
                      Consider reducing to 10-15%.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {budgetData.emergencyFund.current < expenses.fixed * 3 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-blue-800">Build Emergency Fund</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      Target 3-6 months of fixed expenses ({formatCurrency(expenses.fixed * 3)} - {formatCurrency(expenses.fixed * 6)}).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Long-term Goals</h4>
            
            {monthlySurplus > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-green-800">Optimize Surplus</h5>
                    <p className="text-sm text-green-700 mt-1">
                      With {formatCurrency(monthlySurplus)} monthly surplus, consider increasing retirement contributions 
                      or investing in index funds.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {budgetData.debts.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-orange-800">Accelerate Debt Payoff</h5>
                    <p className="text-sm text-orange-700 mt-1">
                      Focus on high-interest debt first. Even an extra $50/month can save significantly on interest.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-purple-800">Automate Savings</h5>
                  <p className="text-sm text-purple-700 mt-1">
                    Set up automatic transfers to savings accounts. Aim to save at least 20% of income.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAnalysis;