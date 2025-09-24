import React, { useState } from 'react';
import { Target, Plus, Trash2, TrendingUp, Calendar, Gift } from 'lucide-react';

interface SavingsGoalsProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'vacation' | 'house' | 'car' | 'emergency' | 'education' | 'other';
  priority: 'high' | 'medium' | 'low';
  monthlyContribution: number;
  isCompleted: boolean;
  createdDate: string;
}

const SavingsGoals: React.FC<SavingsGoalsProps> = ({ budgetData, setBudgetData }) => {
  const [newGoal, setNewGoal] = useState<Partial<SavingsGoal>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: 'other',
    priority: 'medium',
    monthlyContribution: 0
  });

  const savingsGoals = budgetData.savingsGoals || [];

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return;

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount || 0,
      targetDate: newGoal.targetDate,
      category: newGoal.category || 'other',
      priority: newGoal.priority || 'medium',
      monthlyContribution: newGoal.monthlyContribution || 0,
      isCompleted: false,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setBudgetData({
      ...budgetData,
      savingsGoals: [...savingsGoals, goal]
    });

    setNewGoal({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      category: 'other',
      priority: 'medium',
      monthlyContribution: 0
    });
  };

  const updateGoalProgress = (goalId: string, amount: number) => {
    setBudgetData({
      ...budgetData,
      savingsGoals: savingsGoals.map((goal: SavingsGoal) => {
        if (goal.id === goalId) {
          const newAmount = Math.max(0, goal.currentAmount + amount);
          return {
            ...goal,
            currentAmount: newAmount,
            isCompleted: newAmount >= goal.targetAmount
          };
        }
        return goal;
      })
    });
  };

  const removeGoal = (goalId: string) => {
    setBudgetData({
      ...budgetData,
      savingsGoals: savingsGoals.filter((goal: SavingsGoal) => goal.id !== goalId)
    });
  };

  const calculateMonthsToGoal = (goal: SavingsGoal) => {
    if (goal.monthlyContribution <= 0) return Infinity;
    const remaining = goal.targetAmount - goal.currentAmount;
    return Math.ceil(remaining / goal.monthlyContribution);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vacation': return '🏖️';
      case 'house': return '🏠';
      case 'car': return '🚗';
      case 'emergency': return '🛡️';
      case 'education': return '🎓';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const totalSavingsTarget = savingsGoals.reduce((sum: number, goal: SavingsGoal) => sum + goal.targetAmount, 0);
  const totalSavingsCurrent = savingsGoals.reduce((sum: number, goal: SavingsGoal) => sum + goal.currentAmount, 0);
  const completedGoals = savingsGoals.filter((goal: SavingsGoal) => goal.isCompleted).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-slate-800">Savings Goals</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Goals</p>
                <p className="text-2xl font-bold text-purple-700">{savingsGoals.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">{completedGoals}</p>
              </div>
              <Gift className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Saved</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalSavingsCurrent)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Target</p>
                <p className="text-2xl font-bold text-orange-700">{formatCurrency(totalSavingsTarget)}</p>
              </div>
              <span className="h-8 w-8 text-orange-600 font-bold text-xl flex items-center justify-center">£</span>
            </div>
          </div>
        </div>

        {/* Add New Goal */}
        <div className="bg-slate-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">Create New Savings Goal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Goal Name *
              </label>
              <input
                type="text"
                value={newGoal.name || ''}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Holiday Fund"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
                <input
                  type="number"
                  value={newGoal.targetAmount || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Date *
              </label>
              <input
                type="date"
                value={newGoal.targetDate || ''}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={newGoal.category || 'other'}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="vacation">Vacation</option>
                <option value="house">House</option>
                <option value="car">Car</option>
                <option value="emergency">Emergency</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Monthly Contribution
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
                <input
                  type="number"
                  value={newGoal.monthlyContribution || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: Number(e.target.value) })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="200"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={addGoal}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {savingsGoals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Savings Goals Yet</h3>
            <p className="text-slate-600">Create your first savings goal to start building towards your dreams!</p>
          </div>
        ) : (
          savingsGoals.map((goal: SavingsGoal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const monthsToGoal = calculateMonthsToGoal(goal);
            const daysToTarget = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div
                key={goal.id}
                className={`bg-white rounded-xl shadow-lg border-2 p-6 ${
                  goal.isCompleted ? 'border-green-200 bg-green-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{goal.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                          {goal.priority} priority
                        </span>
                        {goal.isCompleted && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            ✅ Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Progress</div>
                    <div className="text-2xl font-bold text-slate-800">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 mt-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          goal.isCompleted ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      {progress.toFixed(1)}% complete
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-600 mb-1">Target Date</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                    <div className={`text-sm mt-1 ${daysToTarget < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {daysToTarget < 0 ? `${Math.abs(daysToTarget)} days overdue` : `${daysToTarget} days remaining`}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-600 mb-1">Monthly Contribution</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {formatCurrency(goal.monthlyContribution)}
                    </div>
                    {monthsToGoal !== Infinity && (
                      <div className="text-sm text-slate-600 mt-1">
                        {monthsToGoal} months to goal
                      </div>
                    )}
                  </div>
                </div>

                {!goal.isCompleted && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, 50)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      +£50
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, 100)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      +£100
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, goal.monthlyContribution)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                    >
                      +Monthly ({formatCurrency(goal.monthlyContribution)})
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SavingsGoals;