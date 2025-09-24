import React, { useState } from 'react';
import { Plus, Zap, DollarSign, CreditCard, Target, Camera } from 'lucide-react';

interface QuickActionsProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
  onShowReceiptScanner?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ budgetData, setBudgetData, onShowReceiptScanner }) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickExpense, setQuickExpense] = useState({ name: '', amount: '', category: 'discretionary' });

  const addQuickExpense = () => {
    if (!quickExpense.name || !quickExpense.amount) return;

    const expense = {
      id: Date.now().toString(),
      name: quickExpense.name,
      amount: Number(quickExpense.amount),
      category: quickExpense.category
    };

    setBudgetData({
      ...budgetData,
      expenses: {
        ...budgetData.expenses,
        [quickExpense.category]: [...budgetData.expenses[quickExpense.category], expense]
      }
    });

    setQuickExpense({ name: '', amount: '', category: 'discretionary' });
    setShowQuickAdd(false);
  };

  const quickActions = [
    {
      id: 'add-expense',
      name: 'Quick Expense',
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => setShowQuickAdd(true)
    },
    {
      id: 'emergency-fund',
      name: 'Add to Emergency',
      icon: Target,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        const amount = prompt('How much to add to emergency fund?');
        if (amount && !isNaN(Number(amount))) {
          setBudgetData({
            ...budgetData,
            emergencyFund: {
              ...budgetData.emergencyFund,
              current: budgetData.emergencyFund.current + Number(amount)
            }
          });
        }
      }
    },
    {
      id: 'scan-receipt',
      name: 'Scan Receipt',
      icon: Camera,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => onShowReceiptScanner?.()
    }
  ];

  return (
    <>
      <div className="fixed bottom-20 right-4 z-30 md:bottom-4">
        <div className="flex flex-col space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`${action.color} text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105`}
                title={action.name}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      {showQuickAdd && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Quick Add Expense</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expense Name
                </label>
                <input
                  type="text"
                  value={quickExpense.name}
                  onChange={(e) => setQuickExpense({ ...quickExpense, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Coffee, Lunch, etc."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
                  <input
                    type="number"
                    value={quickExpense.amount}
                    onChange={(e) => setQuickExpense({ ...quickExpense, amount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={quickExpense.category}
                  onChange={(e) => setQuickExpense({ ...quickExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="discretionary">Discretionary</option>
                  <option value="variable">Variable</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowQuickAdd(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addQuickExpense}
                disabled={!quickExpense.name || !quickExpense.amount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;