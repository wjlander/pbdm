import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Calculator, TrendingDown } from 'lucide-react';

interface DebtManagerProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
}

interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  paymentDate: number;
}

const DebtManager: React.FC<DebtManagerProps> = ({ budgetData, setBudgetData }) => {
  const [newDebt, setNewDebt] = useState<Partial<Debt>>({
    name: '',
    balance: 0,
    interestRate: 0,
    minimumPayment: 0,
    paymentDate: 1
  });
  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [extraPayment, setExtraPayment] = useState(0);

  const addDebt = () => {
    if (!newDebt.name || !newDebt.balance || !newDebt.minimumPayment) return;

    const debt: Debt = {
      id: Date.now().toString(),
      name: newDebt.name,
      balance: newDebt.balance,
      interestRate: newDebt.interestRate || 0,
      minimumPayment: newDebt.minimumPayment,
      paymentDate: newDebt.paymentDate || 1
    };

    setBudgetData({
      ...budgetData,
      debts: [...budgetData.debts, debt]
    });

    setNewDebt({ name: '', balance: 0, interestRate: 0, minimumPayment: 0, paymentDate: 1 });
  };

  const removeDebt = (debtId: string) => {
    setBudgetData({
      ...budgetData,
      debts: budgetData.debts.filter((debt: Debt) => debt.id !== debtId)
    });
  };

  const calculatePayoffOrder = () => {
    const debts = [...budgetData.debts];
    
    if (payoffStrategy === 'snowball') {
      return debts.sort((a, b) => a.balance - b.balance);
    } else {
      return debts.sort((a, b) => b.interestRate - a.interestRate);
    }
  };

  const calculatePayoffSchedule = () => {
    const orderedDebts = calculatePayoffOrder();
    const totalMinimum = orderedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
    const totalAvailable = totalMinimum + extraPayment;
    
    let schedule: any[] = [];
    let remainingDebts = [...orderedDebts];
    let month = 1;
    
    while (remainingDebts.length > 0 && month <= 120) { // Cap at 10 years
      const targetDebt = remainingDebts[0];
      const otherDebts = remainingDebts.slice(1);
      const minimumForOthers = otherDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      const availableForTarget = totalAvailable - minimumForOthers;
      
      const monthlyInterest = (targetDebt.balance * targetDebt.interestRate / 100) / 12;
      const principalPayment = Math.max(0, availableForTarget - monthlyInterest);
      
      if (principalPayment <= 0) {
        // Can't make progress, debt is growing
        break;
      }
      
      targetDebt.balance = Math.max(0, targetDebt.balance - principalPayment);
      
      if (targetDebt.balance <= 0) {
        remainingDebts.shift();
        schedule.push({
          month,
          paidOff: targetDebt.name,
          remainingDebts: remainingDebts.length,
          totalRemaining: remainingDebts.reduce((sum, debt) => sum + debt.balance, 0)
        });
      }
      
      month++;
    }
    
    return schedule;
  };

  const calculateTotalInterest = () => {
    const schedule = calculatePayoffSchedule();
    const totalPayments = schedule.length * (budgetData.debts.reduce((sum: number, debt: Debt) => sum + debt.minimumPayment, 0) + extraPayment);
    const totalPrincipal = budgetData.debts.reduce((sum: number, debt: Debt) => sum + debt.balance, 0);
    return Math.max(0, totalPayments - totalPrincipal);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalDebt = budgetData.debts.reduce((sum: number, debt: Debt) => sum + debt.balance, 0);
  const totalMinimumPayment = budgetData.debts.reduce((sum: number, debt: Debt) => sum + debt.minimumPayment, 0);
  const averageInterestRate = budgetData.debts.length > 0 
    ? budgetData.debts.reduce((sum: number, debt: Debt) => sum + debt.interestRate * (debt.balance / totalDebt), 0)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold text-slate-800">Debt Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Debt</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalDebt)}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Minimum Payments</p>
                <p className="text-2xl font-bold text-orange-700">{formatCurrency(totalMinimumPayment)}</p>
              </div>
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Avg. Interest Rate</p>
                <p className="text-2xl font-bold text-yellow-700">{averageInterestRate.toFixed(1)}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Add New Debt</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Debt Name
              </label>
              <input
                type="text"
                value={newDebt.name || ''}
                onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Credit Card, Loan, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Balance
              </label>
              <input
                type="number"
                value={newDebt.balance || ''}
                onChange={(e) => setNewDebt({ ...newDebt, balance: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={newDebt.interestRate || ''}
                onChange={(e) => setNewDebt({ ...newDebt, interestRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="18.99"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Payment
              </label>
              <input
                type="number"
                value={newDebt.minimumPayment || ''}
                onChange={(e) => setNewDebt({ ...newDebt, minimumPayment: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Day
              </label>
              <select
                value={newDebt.paymentDate || 1}
                onChange={(e) => setNewDebt({ ...newDebt, paymentDate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={addDebt}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {budgetData.debts.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Current Debts</h3>

            <div className="space-y-4">
              {budgetData.debts.map((debt: Debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{debt.name}</h4>
                    <div className="flex space-x-4 text-sm text-slate-600 mt-1">
                      <span>Balance: {formatCurrency(debt.balance)}</span>
                      <span>Rate: {debt.interestRate}%</span>
                      <span>Min Payment: {formatCurrency(debt.minimumPayment)}</span>
                      <span>Due: {debt.paymentDate}{debt.paymentDate === 1 ? 'st' : debt.paymentDate === 2 ? 'nd' : debt.paymentDate === 3 ? 'rd' : 'th'}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeDebt(debt.id)}
                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Payoff Strategy</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Strategy
                    </label>
                    <select
                      value={payoffStrategy}
                      onChange={(e) => setPayoffStrategy(e.target.value as 'snowball' | 'avalanche')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="avalanche">Debt Avalanche (Highest Interest First)</option>
                      <option value="snowball">Debt Snowball (Smallest Balance First)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Extra Monthly Payment
                    </label>
                    <input
                      type="number"
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Strategy Explanation</h4>
                  <p className="text-sm text-blue-700">
                    {payoffStrategy === 'avalanche' 
                      ? 'Pay minimums on all debts, then put extra money toward the highest interest rate debt first. This saves the most money on interest.'
                      : 'Pay minimums on all debts, then put extra money toward the smallest balance first. This provides psychological wins and momentum.'
                    }
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-4">Payoff Order</h4>
                <div className="space-y-3">
                  {calculatePayoffOrder().map((debt, index) => (
                    <div
                      key={debt.id}
                      className={`p-3 rounded-lg border-2 ${
                        index === 0 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-800">
                            #{index + 1} {debt.name}
                          </span>
                          {index === 0 && (
                            <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                              Focus Here
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          {formatCurrency(debt.balance)} @ {debt.interestRate}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {extraPayment > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Payoff Projection</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Total Monthly Payment:</span>
                    <div className="font-semibold text-green-800">
                      {formatCurrency(totalMinimumPayment + extraPayment)}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700">Estimated Payoff Time:</span>
                    <div className="font-semibold text-green-800">
                      {calculatePayoffSchedule().length} months
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700">Est. Total Interest:</span>
                    <div className="font-semibold text-green-800">
                      {formatCurrency(calculateTotalInterest())}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DebtManager;