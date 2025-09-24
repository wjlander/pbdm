import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface PayBillCalendarProps {
  budgetData: any;
  setBudgetData?: (data: any) => void;
}

interface CalendarEvent {
  date: Date;
  type: 'pay' | 'bill' | 'debt';
  name: string;
  amount: number;
  category?: string;
  isIncoming: boolean;
  isPaid?: boolean;
  billId?: string;
}

interface DayAnalysis {
  date: Date;
  balance: number;
  events: CalendarEvent[];
  needsReserve: boolean;
  reserveAmount: number;
  status: 'good' | 'caution' | 'critical';
}

const PayBillCalendar: React.FC<PayBillCalendarProps> = ({ budgetData, setBudgetData }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [startingBalance, setStartingBalance] = useState(budgetData.startingBalance || 1000);

  // Update starting balance when budgetData changes
  useEffect(() => {
    if (budgetData.startingBalance !== undefined) {
      setStartingBalance(budgetData.startingBalance);
    }
  }, [budgetData.startingBalance]);

  const updateStartingBalance = (newBalance: number) => {
    setStartingBalance(newBalance);
    if (setBudgetData) {
      setBudgetData({
        ...budgetData,
        startingBalance: newBalance
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const generatePayDates = (month: Date) => {
    const payDates = [];
    const startDate = new Date(budgetData.income.nextPayDate);
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const trackingStartDate = budgetData.trackingStartDate ? new Date(budgetData.trackingStartDate) : new Date('1900-01-01');
    
    // Go back to find pay dates that might affect this month
    let currentPayDate = new Date(startDate);
    while (currentPayDate > new Date(monthStart.getTime() - 30 * 24 * 60 * 60 * 1000)) {
      currentPayDate.setDate(currentPayDate.getDate() - 14);
    }
    
    // Generate pay dates for the period
    while (currentPayDate <= new Date(monthEnd.getTime() + 30 * 24 * 60 * 60 * 1000)) {
      if (currentPayDate >= monthStart && currentPayDate <= monthEnd && currentPayDate >= trackingStartDate) {
        payDates.push(new Date(currentPayDate));
      }
      currentPayDate.setDate(currentPayDate.getDate() + 14);
    }
    
    return payDates;
  };

  const generateBillDates = (month: Date) => {
    const billDates: CalendarEvent[] = [];
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const trackingStartDate = budgetData.trackingStartDate ? new Date(budgetData.trackingStartDate) : new Date('1900-01-01');
    
    // Get bill payment status from Bill Tracker
    const billPayments = budgetData.billPayments || {};

    // Fixed monthly expenses (assume due on various days)
    budgetData.expenses.fixed.forEach((expense: any, index: number) => {
      const dueDay = expense.dueDayOfMonth || ((index * 7) % 28) + 1; // Use specified day or spread bills across the month
      const dueDate = new Date(month.getFullYear(), month.getMonth(), Math.min(dueDay, monthEnd.getDate()));
      
      // Skip if before tracking start date
      if (dueDate < trackingStartDate) return;
      
      const billId = `fixed-${expense.id}`;
      const monthKey = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthPayments = billPayments[monthKey] || [];
      const paymentStatus = monthPayments.find((p: any) => p.billId === billId);
      
      billDates.push({
        date: dueDate,
        type: 'bill',
        name: expense.name,
        amount: expense.amount,
        category: 'fixed',
        isIncoming: false,
        isPaid: paymentStatus?.isPaid || false,
        billId
      });
    });

    // Variable monthly expenses
    budgetData.expenses.variable.forEach((expense: any, index: number) => {
      const dueDay = expense.dueDayOfMonth || ((index * 5) % 28) + 3; // Use specified day or different spread pattern
      const dueDate = new Date(month.getFullYear(), month.getMonth(), Math.min(dueDay, monthEnd.getDate()));
      
      // Skip if before tracking start date
      if (dueDate < trackingStartDate) return;
      
      const billId = `variable-${expense.id}`;
      const monthKey = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthPayments = billPayments[monthKey] || [];
      const paymentStatus = monthPayments.find((p: any) => p.billId === billId);
      
      billDates.push({
        date: dueDate,
        type: 'bill',
        name: expense.name,
        amount: expense.amount,
        category: 'variable',
        isIncoming: false,
        isPaid: paymentStatus?.isPaid || false,
        billId
      });
    });

    // 28-day cycle bills
    budgetData.expenses.twentyEightDay.forEach((expense: any) => {
      if (!expense.dueDate) return;
      
      let currentDue = new Date(expense.dueDate);
      while (currentDue <= new Date(monthEnd.getTime() + 28 * 24 * 60 * 60 * 1000)) {
        if (currentDue >= monthStart && currentDue <= monthEnd) {
          // Skip if before tracking start date
          if (currentDue < trackingStartDate) {
            currentDue.setDate(currentDue.getDate() + 28);
            continue;
          }
          
          const billId = `28day-${expense.id}-${currentDue.toISOString().split('T')[0]}`;
          const monthKey = `${currentDue.getFullYear()}-${(currentDue.getMonth() + 1).toString().padStart(2, '0')}`;
          const monthPayments = billPayments[monthKey] || [];
          const paymentStatus = monthPayments.find((p: any) => p.billId === billId);
          
          billDates.push({
            date: new Date(currentDue),
            type: 'bill',
            name: `${expense.name} (28-day)`,
            amount: expense.amount,
            category: 'twentyEightDay',
            isIncoming: false,
            isPaid: paymentStatus?.isPaid || false,
            billId
          });
        }
        currentDue.setDate(currentDue.getDate() + 28);
      }
    });

    // Debt payments (assume mid-month)
    budgetData.debts.forEach((debt: any) => {
      const dueDate = new Date(month.getFullYear(), month.getMonth(), Math.min(debt.paymentDate || 15, monthEnd.getDate()));
      
      // Skip if before tracking start date
      if (dueDate < trackingStartDate) return;
      
      const billId = `debt-${debt.id}`;
      const monthKey = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthPayments = billPayments[monthKey] || [];
      const paymentStatus = monthPayments.find((p: any) => p.billId === billId);
      
      billDates.push({
        date: dueDate,
        type: 'debt',
        name: `${debt.name} Payment`,
        amount: debt.minimumPayment,
        category: 'debt',
        isIncoming: false,
        isPaid: paymentStatus?.isPaid || false,
        billId
      });
    });

    return billDates;
  };

  const generateCalendarAnalysis = () => {
    const payDates = generatePayDates(selectedMonth);
    const billDates = generateBillDates(selectedMonth);
    const fortnightlyNet = budgetData.income.biweeklyNet || 0;
    const trackingStartDate = budgetData.trackingStartDate ? new Date(budgetData.trackingStartDate) : new Date('1900-01-01');
    const selectedMonthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    
    // Calculate starting balance for this month
    let monthStartingBalance = startingBalance;
    
    // If we're viewing a month after the tracking start month, calculate the carried forward balance
    if (selectedMonthStart > new Date(trackingStartDate.getFullYear(), trackingStartDate.getMonth(), 1)) {
      // Calculate balance from tracking start date to end of previous month
      const prevMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
      const prevMonthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 0);
      
      // Get all events from tracking start to end of previous month
      let carryForwardBalance = startingBalance;
      
      // Calculate through each month from tracking start to previous month
      let currentMonth = new Date(trackingStartDate.getFullYear(), trackingStartDate.getMonth(), 1);
      
      while (currentMonth <= prevMonth) {
        const monthPayDates = generatePayDates(currentMonth);
        const monthBillDates = generateBillDates(currentMonth);
        
        // Add income for this month
        monthPayDates.forEach(payDate => {
          if (payDate >= trackingStartDate) {
            carryForwardBalance += fortnightlyNet;
          }
        });
        
        // Subtract expenses for this month (only unpaid ones)
        monthBillDates.forEach(bill => {
          if (!bill.isPaid && bill.date >= trackingStartDate) {
            carryForwardBalance -= bill.amount;
          }
        });
        
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      
      monthStartingBalance = carryForwardBalance;
    }
    
    // Combine all events
    const allEvents: CalendarEvent[] = [
      ...payDates.map(date => ({
        date,
        type: 'pay' as const,
        name: 'Fortnightly Pay',
        amount: fortnightlyNet,
        isIncoming: true
      })),
      ...billDates
    ];

    // Sort by date
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance and identify reserve needs
    const analysis: DayAnalysis[] = [];
    let runningBalance = monthStartingBalance;
    
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    // Group events by date
    const eventsByDate = new Map<string, CalendarEvent[]>();
    allEvents.forEach(event => {
      const dateKey = event.date.toDateString();
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    });

    // Analyze each day with events
    for (const [dateKey, events] of eventsByDate) {
      const date = new Date(dateKey);
      if (date < monthStart || date > monthEnd) continue;

      const dayIncome = events.filter(e => e.isIncoming).reduce((sum, e) => sum + e.amount, 0);
      const dayExpenses = events.filter(e => !e.isIncoming).reduce((sum, e) => sum + e.amount, 0);
      
      runningBalance += dayIncome - dayExpenses;

      // Calculate reserve needs for income days only
      let reserveAmount = 0;
      let needsReserve = false;
      
      if (dayIncome > 0) { // This is a pay day
        // Find next pay date after this one
        const nextPayDate = payDates.find(payDate => payDate > date);
        
        if (nextPayDate) {
          // Calculate all expenses between this pay and next pay
          const expensesBetweenPays = allEvents
            .filter(event => 
              !event.isIncoming && 
              !event.isPaid &&
              event.date > date && 
              event.date <= nextPayDate
            )
            .reduce((sum, event) => sum + event.amount, 0);

          // If expenses would leave us with less than £100 buffer, suggest reserve
          const balanceAfterExpenses = runningBalance - expensesBetweenPays;
          if (expensesBetweenPays > 0 && balanceAfterExpenses < 100) {
            needsReserve = true;
            reserveAmount = Math.max(0, expensesBetweenPays + 100 - (runningBalance - dayIncome));
          }
        }
      }

      const status: 'good' | 'caution' | 'critical' = 
        runningBalance < 0 ? 'critical' :
        runningBalance < 200 ? 'caution' : 'good';

      analysis.push({
        date,
        balance: runningBalance,
        events,
        needsReserve,
        reserveAmount: Math.max(0, reserveAmount),
        status
      });
    }

    return analysis.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const calendarAnalysis = generateCalendarAnalysis();
  const monthName = selectedMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const navigateMonth = (direction: number) => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + direction, 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'caution': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pay': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'debt': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">Pay & Bill Calendar</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-700">Starting Balance:</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
                <input
                  type="number"
                  value={startingBalance}
                  onChange={(e) => updateStartingBalance(Number(e.target.value))}
                  className="w-32 pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  title={`Starting balance from ${budgetData.trackingStartDate || 'tracking start date'}`}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <span className="font-semibold text-slate-800 min-w-[140px] text-center">
                {monthName}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Pay Days</span>
            </div>
            <div className="text-sm text-green-700">
              {generatePayDates(selectedMonth).length} fortnightly payments
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Bills Due</span>
            </div>
            <div className="text-sm text-blue-700">
              {generateBillDates(selectedMonth).length} bills this month
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Reserve Needed</span>
            </div>
            <div className="text-sm text-yellow-700">
              {calendarAnalysis.filter(day => day.needsReserve).length} days require reserves
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="h-5 w-5 text-slate-600 font-bold flex items-center justify-center">£</span>
              <span className="font-medium text-slate-800">
                {selectedMonth.getMonth() === new Date().getMonth() && selectedMonth.getFullYear() === new Date().getFullYear() 
                  ? 'Current Balance' 
                  : 'Month End Balance'
                }
              </span>
            </div>
            <div className="text-sm text-slate-700">
              {formatCurrency(calendarAnalysis[calendarAnalysis.length - 1]?.balance || startingBalance)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Daily Cash Flow Analysis</h3>
        
        <div className="space-y-4">
          {calendarAnalysis.map((day, index) => (
            <div
              key={index}
              className={`border-2 rounded-lg p-4 ${getStatusColor(day.status)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="font-semibold">
                    {day.date.toLocaleDateString('en-GB', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </div>
                  <div className="text-sm opacity-75">
                    Balance: {formatCurrency(day.balance)}
                  </div>
                </div>
                
                {day.needsReserve && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-1">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Reserve {formatCurrency(day.reserveAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 opacity-75">Income</h4>
                  <div className="space-y-1">
                    {day.events.filter(e => e.isIncoming).map((event, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getEventIcon(event.type)}
                          <span>{event.name}</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          +{formatCurrency(event.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 opacity-75">Expenses</h4>
                  <div className="space-y-1">
                    {day.events.filter(e => !e.isIncoming).map((event, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          {getEventIcon(event.type)}
                          <span className={event.isPaid ? 'line-through text-slate-500' : ''}>
                            {event.name}
                            {event.isPaid && <span className="ml-2 text-green-600 text-xs">(Paid)</span>}
                          </span>
                        </div>
                        <span className={`font-semibold ${event.isPaid ? 'text-slate-500 line-through' : 'text-red-600'}`}>
                          -{formatCurrency(event.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {day.needsReserve && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Reserve Recommendation:</strong> From today's pay of {formatCurrency(day.events.filter(e => e.isIncoming).reduce((sum, e) => sum + e.amount, 0))}, 
                    set aside {formatCurrency(day.reserveAmount)} to cover {formatCurrency(day.events.filter(e => e.isIncoming).length > 0 ? 
                      allEvents.filter(event => !event.isIncoming && event.date > day.date && 
                        event.date <= (payDates.find(payDate => payDate > day.date) || new Date())).reduce((sum, event) => sum + event.amount, 0) : 0)} 
                    in upcoming bills before your next payday.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Money Management Tips</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Reserve Strategy</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Pay Day Planning</p>
                  <p className="text-xs text-slate-600">
                    When you receive pay, immediately set aside money for bills due before your next payday.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Separate Accounts</p>
                  <p className="text-xs text-slate-600">
                    Consider using separate accounts for bills and spending money to avoid overspending.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">28-Day Bill Buffer</p>
                  <p className="text-xs text-slate-600">
                    Keep extra buffer for 28-day cycle bills as they don't align with monthly budgets.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Cash Flow Optimization</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Bill Date Management</p>
                  <p className="text-xs text-slate-600">
                    Contact providers to adjust due dates closer to your pay dates when possible.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Emergency Buffer</p>
                  <p className="text-xs text-slate-600">
                    Maintain at least £200-300 buffer to handle timing mismatches and unexpected expenses.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Direct Debits</p>
                  <p className="text-xs text-slate-600">
                    Set up direct debits for fixed bills to ensure they're paid on time automatically.
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

export default PayBillCalendar;