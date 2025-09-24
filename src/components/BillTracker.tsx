import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Calendar, DollarSign, AlertTriangle, Clock } from 'lucide-react';

interface BillTrackerProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
}

interface BillPayment {
  billId: string;
  billName: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  month: string; // Format: "2024-01"
  category: string;
}

const BillTracker: React.FC<BillTrackerProps> = ({ budgetData, setBudgetData }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);

  useEffect(() => {
    generateBillsForMonth(selectedMonth);
  }, [selectedMonth, budgetData]);

  const generateBillsForMonth = (month: string) => {
    const existingPayments = budgetData.billPayments || {};
    const monthPayments = existingPayments[month] || [];
    const generatedBills: BillPayment[] = [];
    const trackingStartDate = budgetData.trackingStartDate ? new Date(budgetData.trackingStartDate) : new Date('1900-01-01');

    // Generate bills from fixed expenses
    budgetData.expenses.fixed.forEach((expense: any) => {
      const dueDay = expense.dueDayOfMonth || 15; // Use specified day or default to 15th
      const dueDate = `${month}-${dueDay.toString().padStart(2, '0')}`;
      const dueDateObj = new Date(dueDate);
      
      // Skip if before tracking start date
      if (dueDateObj < trackingStartDate) return;
      
      const existingPayment = monthPayments.find((p: BillPayment) => p.billId === `fixed-${expense.id}`);
      
      generatedBills.push({
        billId: `fixed-${expense.id}`,
        billName: expense.name,
        amount: expense.amount,
        dueDate,
        isPaid: existingPayment?.isPaid || false,
        paidDate: existingPayment?.paidDate,
        month,
        category: 'fixed'
      });
    });

    // Generate bills from variable expenses
    budgetData.expenses.variable.forEach((expense: any) => {
      const dueDay = expense.dueDayOfMonth || 20; // Use specified day or default to 20th
      const dueDate = `${month}-${dueDay.toString().padStart(2, '0')}`;
      const dueDateObj = new Date(dueDate);
      
      // Skip if before tracking start date
      if (dueDateObj < trackingStartDate) return;
      
      const existingPayment = monthPayments.find((p: BillPayment) => p.billId === `variable-${expense.id}`);
      
      generatedBills.push({
        billId: `variable-${expense.id}`,
        billName: expense.name,
        amount: expense.amount,
        dueDate,
        isPaid: existingPayment?.isPaid || false,
        paidDate: existingPayment?.paidDate,
        month,
        category: 'variable'
      });
    });

    // Generate bills from 28-day cycle expenses
    budgetData.expenses.twentyEightDay.forEach((expense: any) => {
      if (!expense.dueDate) return;
      
      const startDate = new Date(expense.dueDate);
      const monthStart = new Date(`${month}-01`);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      let currentDue = new Date(startDate);
      while (currentDue <= monthEnd) {
        if (currentDue >= monthStart && currentDue <= monthEnd) {
          // Skip if before tracking start date
          if (currentDue < trackingStartDate) {
            currentDue.setDate(currentDue.getDate() + 28);
            continue;
          }
          
          const dueDate = currentDue.toISOString().split('T')[0];
          const billId = `28day-${expense.id}-${dueDate}`;
          
          const existingPayment = monthPayments.find((p: BillPayment) => p.billId === billId);
          
          generatedBills.push({
            billId,
            billName: `${expense.name} (28-day)`,
            amount: expense.amount,
            dueDate,
            isPaid: existingPayment?.isPaid || false,
            paidDate: existingPayment?.paidDate,
            month,
            category: 'twentyEightDay'
          });
        }
        currentDue.setDate(currentDue.getDate() + 28);
      }
    });

    // Generate bills from debt payments
    budgetData.debts.forEach((debt: any) => {
      const dueDay = debt.paymentDate || 15;
      const dueDate = `${month}-${dueDay.toString().padStart(2, '0')}`;
      const dueDateObj = new Date(dueDate);
      
      // Skip if before tracking start date
      if (dueDateObj < trackingStartDate) return;
      
      const existingPayment = monthPayments.find((p: BillPayment) => p.billId === `debt-${debt.id}`);
      
      generatedBills.push({
        billId: `debt-${debt.id}`,
        billName: `${debt.name} Payment`,
        amount: debt.minimumPayment,
        dueDate,
        isPaid: existingPayment?.isPaid || false,
        paidDate: existingPayment?.paidDate,
        month,
        category: 'debt'
      });
    });

    // Sort by due date
    generatedBills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    setBillPayments(generatedBills);
  };

  const toggleBillPayment = (billId: string) => {
    const updatedPayments = billPayments.map(bill => {
      if (bill.billId === billId) {
        const isPaid = !bill.isPaid;
        return {
          ...bill,
          isPaid,
          paidDate: isPaid ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return bill;
    });

    setBillPayments(updatedPayments);

    // Save to budget data
    const existingPayments = budgetData.billPayments || {};
    setBudgetData({
      ...budgetData,
      billPayments: {
        ...existingPayments,
        [selectedMonth]: updatedPayments
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusColor = (bill: BillPayment) => {
    if (bill.isPaid) return 'border-green-200 bg-green-50';
    
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'border-red-200 bg-red-50'; // Overdue
    if (daysDiff <= 3) return 'border-yellow-200 bg-yellow-50'; // Due soon
    return 'border-slate-200 bg-white'; // Normal
  };

  const getStatusIcon = (bill: BillPayment) => {
    if (bill.isPaid) return <CheckCircle className="h-5 w-5 text-green-600" />;
    
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (daysDiff <= 3) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <Circle className="h-5 w-5 text-slate-400" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fixed': return 'text-blue-600 bg-blue-100';
      case 'variable': return 'text-green-600 bg-green-100';
      case 'twentyEightDay': return 'text-orange-600 bg-orange-100';
      case 'debt': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const totalBills = billPayments.length;
  const paidBills = billPayments.filter(bill => bill.isPaid).length;
  const totalAmount = billPayments.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = billPayments.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
  const overdueBills = billPayments.filter(bill => !bill.isPaid && new Date(bill.dueDate) < new Date()).length;

  const navigateMonth = (direction: number) => {
    const currentDate = new Date(selectedMonth + '-01');
    currentDate.setMonth(currentDate.getMonth() + direction);
    setSelectedMonth(currentDate.toISOString().slice(0, 7));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-slate-800">Bill Tracker</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <span className="font-semibold text-slate-800 min-w-[120px] text-center">
              {new Date(selectedMonth + '-01').toLocaleDateString('en-GB', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Bills</p>
                <p className="text-2xl font-bold text-blue-700">{totalBills}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Paid</p>
                <p className="text-2xl font-bold text-green-700">{paidBills}/{totalBills}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Amount Paid</p>
                <p className="text-2xl font-bold text-purple-700">{formatCurrency(paidAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Overdue</p>
                <p className="text-2xl font-bold text-red-700">{overdueBills}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Progress: {paidBills} of {totalBills} bills paid</span>
            <span className="text-slate-600">{totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalBills > 0 ? (paidBills / totalBills) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Bills for {new Date(selectedMonth + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h3>
        
        {billPayments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bills found for this month.</p>
            <p className="text-sm">Add expenses in the Expenses tab to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {billPayments.map((bill) => (
              <div
                key={bill.billId}
                className={`border-2 rounded-lg p-4 transition-all duration-200 ${getStatusColor(bill)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleBillPayment(bill.billId)}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      {getStatusIcon(bill)}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className={`font-semibold ${bill.isPaid ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {bill.billName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bill.category)}`}>
                          {bill.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <span>Due: {formatDate(bill.dueDate)}</span>
                        <span>Amount: {formatCurrency(bill.amount)}</span>
                        {bill.isPaid && bill.paidDate && (
                          <span className="text-green-600">
                            Paid: {formatDate(bill.paidDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${bill.isPaid ? 'text-green-600' : 'text-slate-800'}`}>
                      {formatCurrency(bill.amount)}
                    </div>
                    {!bill.isPaid && (
                      <div className="text-xs text-slate-500">
                        {(() => {
                          const today = new Date();
                          const dueDate = new Date(bill.dueDate);
                          const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          
                          if (daysDiff < 0) return `${Math.abs(daysDiff)} days overdue`;
                          if (daysDiff === 0) return 'Due today';
                          if (daysDiff === 1) return 'Due tomorrow';
                          return `Due in ${daysDiff} days`;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Bills</span>
              <span className="font-semibold">{totalBills}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Bills Paid</span>
              <span className="font-semibold text-green-600">{paidBills}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Bills Remaining</span>
              <span className="font-semibold text-orange-600">{totalBills - paidBills}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Overdue Bills</span>
              <span className="font-semibold text-red-600">{overdueBills}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Amount</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Amount Paid</span>
              <span className="font-semibold text-green-600">{formatCurrency(paidAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Amount Remaining</span>
              <span className="font-semibold text-orange-600">{formatCurrency(totalAmount - paidAmount)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Completion Rate</span>
              <span className="font-semibold text-blue-600">
                {totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillTracker;