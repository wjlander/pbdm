import React, { useState } from 'react';
import { Calendar, DollarSign, Plus, Trash2 } from 'lucide-react';

interface IncomeTrackerProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
}

const IncomeTracker: React.FC<IncomeTrackerProps> = ({ budgetData, setBudgetData }) => {
  const [biweeklyNet, setBiweeklyNet] = useState(budgetData.income.biweeklyNet || 0);
  const [nextPayDate, setNextPayDate] = useState(budgetData.income.nextPayDate || new Date().toISOString().split('T')[0]);

  const updateIncome = () => {
    setBudgetData({
      ...budgetData,
      income: {
        biweeklyNet,
        nextPayDate
      }
    });
  };

  const generatePayDates = () => {
    const dates = [];
    const startDate = new Date(nextPayDate);
    
    for (let i = 0; i < 26; i++) {
      const payDate = new Date(startDate);
      payDate.setDate(startDate.getDate() + (i * 14));
      dates.push(payDate);
    }
    
    return dates;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const annualNet = biweeklyNet * 26;
  const monthlyNet = annualNet / 12;

  const payDates = generatePayDates();
  const currentDate = new Date();
  const nextPayDates = payDates.filter(date => date >= currentDate).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <span className="h-6 w-6 text-green-600 font-bold text-xl flex items-center justify-center">£</span>
          <h2 className="text-xl font-semibold text-slate-800">Income Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Biweekly Net Pay
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">£</span>
              <input
                type="number"
                value={biweeklyNet}
                onChange={(e) => setBiweeklyNet(Number(e.target.value))}
                onBlur={updateIncome}
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Your take-home pay after taxes and deductions</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Next Pay Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="date"
                value={nextPayDate}
                onChange={(e) => setNextPayDate(e.target.value)}
                onBlur={updateIncome}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Income Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600">Biweekly Net</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(biweeklyNet)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600">Monthly Net</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(monthlyNet)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600">Annual Net</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(annualNet)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Upcoming Pay Dates</h3>
          
          <div className="space-y-3">
            {nextPayDates.map((date, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <span className={`font-medium ${
                  index === 0 ? 'text-green-800' : 'text-slate-700'
                }`}>
                  {formatDate(date)}
                  {index === 0 && <span className="ml-2 text-xs">(Next)</span>}
                </span>
                <span className={`font-semibold ${
                  index === 0 ? 'text-green-600' : 'text-slate-600'
                }`}>
                  {formatCurrency(biweeklyNet)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Biweekly pay results in 26 pay periods per year, meaning you'll receive 3 paychecks in some months.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Annual Pay Schedule</h3>
        
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {payDates.map((date, index) => {
              const isPast = date < currentDate;
              const isNext = !isPast && date === nextPayDates[0];
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-center ${
                    isPast 
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : isNext 
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">
                    Pay #{index + 1}
                  </div>
                  <div className="text-sm font-semibold">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs mt-1">
                    {formatCurrency(biweeklyNet)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeTracker;