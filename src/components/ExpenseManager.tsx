import React, { useState } from 'react';
import { Plus, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface ExpenseManagerProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
}

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate?: string;
  dueDayOfMonth?: number;
  nextDueDate?: string;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ budgetData, setBudgetData }) => {
  const [activeCategory, setActiveCategory] = useState('fixed');
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    name: '',
    amount: 0,
    category: activeCategory,
    dueDate: '',
    dueDayOfMonth: 1
  });

  const categories = [
    { id: 'fixed', name: 'Fixed Monthly', description: 'Rent, insurance, subscriptions' },
    { id: 'variable', name: 'Variable Monthly', description: 'Utilities, groceries' },
    { id: 'discretionary', name: 'Discretionary', description: 'Entertainment, dining out' },
    { id: 'twentyEightDay', name: '28-Day Cycle', description: 'Bills that repeat every 28 days' },
    { id: 'oneOff', name: 'One-Off Expenses', description: 'Scheduled future expenses' }
  ];

  const addExpense = () => {
    if (!newExpense.name || !newExpense.amount) return;

    const expense: Expense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: newExpense.amount,
      category: activeCategory,
      ...(activeCategory === 'twentyEightDay' && newExpense.dueDate && {
        dueDate: newExpense.dueDate,
        nextDueDate: calculateNext28DayDate(newExpense.dueDate)
      }),
      ...(activeCategory === 'fixed' && {
        dueDayOfMonth: newExpense.dueDayOfMonth || 1
      }),
      ...(activeCategory === 'variable' && {
        dueDayOfMonth: newExpense.dueDayOfMonth || 1
      }),
      ...(activeCategory === 'oneOff' && newExpense.dueDate && {
        dueDate: newExpense.dueDate
      })
    };

    const categoryKey = activeCategory === 'twentyEightDay' ? 'twentyEightDay' : activeCategory;
    
    setBudgetData({
      ...budgetData,
      expenses: {
        ...budgetData.expenses,
        [categoryKey]: [...(budgetData.expenses[categoryKey] || []), expense]
      }
    });

    setNewExpense({ name: '', amount: 0, category: activeCategory, dueDate: '', dueDayOfMonth: 1 });
  };

  const removeExpense = (categoryKey: string, expenseId: string) => {
    setBudgetData({
      ...budgetData,
      expenses: {
        ...budgetData.expenses,
        [categoryKey]: budgetData.expenses[categoryKey].filter((exp: Expense) => exp.id !== expenseId)
      }
    });
  };

  const calculateNext28DayDate = (startDate: string) => {
    const date = new Date(startDate);
    const currentDate = new Date();
    
    while (date <= currentDate) {
      date.setDate(date.getDate() + 28);
    }
    
    return date.toISOString().split('T')[0];
  };

  const get28DayDates = (startDate: string, count: number = 6) => {
    const dates = [];
    const date = new Date(startDate);
    
    for (let i = 0; i < count; i++) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 28);
    }
    
    return dates;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateCategoryTotal = (categoryKey: string) => {
    const expenses = budgetData.expenses[categoryKey] || [];
    if (categoryKey === 'twentyEightDay') {
      // Convert 28-day cycle to monthly equivalent
      return expenses.reduce((sum: number, exp: Expense) => sum + (exp.amount * 13) / 12, 0);
    } else if (categoryKey === 'oneOff') {
      // One-off expenses don't contribute to monthly totals
      return 0;
    }
    return expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
  };

  const getCurrentCategoryExpenses = () => {
    const categoryKey = activeCategory === 'twentyEightDay' ? 'twentyEightDay' : activeCategory;
    return budgetData.expenses[categoryKey] || [];
  };

  return (
    <>
      <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Expense Management</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                activeCategory === category.id
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-xs opacity-75">{category.description}</p>
              <div className="mt-2 text-lg font-bold">
                {formatCurrency(calculateCategoryTotal(category.id === 'twentyEightDay' ? 'twentyEightDay' : category.id))}
                {category.id === 'twentyEightDay' && (
                  <span className="text-xs font-normal ml-1">/month</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-slate-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">
            Add New {categories.find(c => c.id === activeCategory)?.name} Expense
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expense Name
              </label>
              <input
                type="text"
                value={newExpense.name || ''}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Rent, Groceries"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">£</span>
                <input
                  type="number"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {(activeCategory === 'fixed' || activeCategory === 'variable') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Day of Month
                </label>
                <select
                  value={newExpense.dueDayOfMonth || 1}
                  onChange={(e) => setNewExpense({ ...newExpense, dueDayOfMonth: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            )}
            
            {(activeCategory === 'twentyEightDay' || activeCategory === 'oneOff') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {activeCategory === 'oneOff' ? 'Expense Date' : 'Next Due Date'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={newExpense.dueDate || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-end">
              <button
                onClick={addExpense}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">
          {categories.find(c => c.id === activeCategory)?.name} Expenses
        </h3>

        <div className="space-y-3">
          {getCurrentCategoryExpenses().length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses added yet. Add your first expense above!</p>
            </div>
          ) : (
            getCurrentCategoryExpenses().map((expense: Expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{expense.name}</h4>
                  {expense.dueDayOfMonth && (activeCategory === 'fixed' || activeCategory === 'variable') && (
                    <p className="text-sm text-slate-600">
                      Due: {expense.dueDayOfMonth}{expense.dueDayOfMonth === 1 ? 'st' : expense.dueDayOfMonth === 2 ? 'nd' : expense.dueDayOfMonth === 3 ? 'rd' : 'th'} of each month
                    </p>
                  )}
                  {expense.nextDueDate && activeCategory === 'twentyEightDay' && (
                    <p className="text-sm text-slate-600">
                      Next due: {new Date(expense.nextDueDate).toLocaleDateString()}
                    </p>
                  )}
                  {expense.dueDate && activeCategory === 'oneOff' && (
                    <p className="text-sm text-slate-600">
                      Scheduled: {new Date(expense.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-slate-800">
                    {formatCurrency(expense.amount)}
                  </span>
                  
                  <button
                    onClick={() => removeExpense(activeCategory === 'twentyEightDay' ? 'twentyEightDay' : activeCategory, expense.id)}
                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeCategory === 'twentyEightDay' && getCurrentCategoryExpenses().length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">28-Day Cycle Schedule</h3>
          
          {getCurrentCategoryExpenses().map((expense: Expense) => (
            <div key={expense.id} className="mb-6 last:mb-0">
              <h4 className="font-semibold text-slate-800 mb-3">{expense.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {get28DayDates(expense.dueDate || '').map((date, index) => {
                  const isPast = date < new Date();
                  const isNext = !isPast && index === 0;
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border text-center ${
                        isPast 
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : isNext 
                            ? 'bg-orange-50 border-orange-200 text-orange-800'
                            : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-xs mt-1">
                        {formatCurrency(expense.amount)}
                      </div>
                      {isNext && (
                        <div className="text-xs font-medium mt-1">Next Due</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      )}

      {activeCategory === 'oneOff' && getCurrentCategoryExpenses().length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Upcoming One-Off Expenses</h3>
          
          <div className="space-y-3">
            {getCurrentCategoryExpenses()
              .filter((expense: Expense) => expense.dueDate && new Date(expense.dueDate) >= new Date())
              .sort((a: Expense, b: Expense) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
              .map((expense: Expense) => {
                const daysUntil = Math.ceil((new Date(expense.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={expense.id}
                    className={`p-4 rounded-lg border-2 ${
                      daysUntil <= 7 ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{expense.name}</h4>
                        <p className="text-sm text-slate-600">
                          {new Date(expense.dueDate!).toLocaleDateString('en-GB', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-slate-500">
                          {daysUntil === 0 ? 'Today' : 
                           daysUntil === 1 ? 'Tomorrow' : 
                           `In ${daysUntil} days`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-800">
                          {formatCurrency(expense.amount)}
                        </div>
                        {daysUntil <= 7 && (
                          <div className="text-xs text-orange-600 font-medium">
                            Due Soon
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> One-off expenses don't count toward your monthly budget totals. 
              They're tracked separately to help you plan for upcoming costs.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseManager;