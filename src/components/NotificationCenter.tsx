import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Calendar, CheckCircle, Settings } from 'lucide-react';

interface NotificationCenterProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
}

interface Notification {
  id: string;
  type: 'bill_reminder' | 'low_balance' | 'goal_achieved' | 'expense_alert' | 'vehicle_maintenance';
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
  actionable?: boolean;
  data?: any;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ budgetData, setBudgetData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState({
    billReminders: true,
    lowBalanceAlerts: true,
    goalAchievements: true,
    expenseAlerts: true,
    vehicleReminders: true,
    reminderDays: 3
  });

  useEffect(() => {
    generateNotifications();
  }, [budgetData]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    const reminderDate = new Date(now.getTime() + settings.reminderDays * 24 * 60 * 60 * 1000);

    // Bill reminders
    if (settings.billReminders) {
      // Fixed expenses
      budgetData.expenses.fixed.forEach((expense: any, index: number) => {
        const dueDay = ((index * 7) % 28) + 1;
        const dueDate = new Date(now.getFullYear(), now.getMonth(), Math.min(dueDay, 28));
        
        if (dueDate <= reminderDate && dueDate >= now) {
          newNotifications.push({
            id: `bill-${expense.id}-${dueDate.getTime()}`,
            type: 'bill_reminder',
            title: 'Bill Due Soon',
            message: `${expense.name} (${formatCurrency(expense.amount)}) is due on ${dueDate.toLocaleDateString()}`,
            date: now,
            isRead: false,
            actionable: true,
            data: { expense, dueDate }
          });
        }
      });

      // 28-day cycle expenses
      budgetData.expenses.twentyEightDay.forEach((expense: any) => {
        if (expense.dueDate) {
          const dueDate = new Date(expense.dueDate);
          if (dueDate <= reminderDate && dueDate >= now) {
            newNotifications.push({
              id: `28day-${expense.id}-${dueDate.getTime()}`,
              type: 'bill_reminder',
              title: '28-Day Bill Due Soon',
              message: `${expense.name} (${formatCurrency(expense.amount)}) is due on ${dueDate.toLocaleDateString()}`,
              date: now,
              isRead: false,
              actionable: true,
              data: { expense, dueDate }
            });
          }
        }
      });

      // Debt payments
      budgetData.debts.forEach((debt: any) => {
        const dueDay = debt.paymentDate || 15;
        const dueDate = new Date(now.getFullYear(), now.getMonth(), Math.min(dueDay, 28));
        
        if (dueDate <= reminderDate && dueDate >= now) {
          newNotifications.push({
            id: `debt-${debt.id}-${dueDate.getTime()}`,
            type: 'bill_reminder',
            title: 'Debt Payment Due',
            message: `${debt.name} payment (${formatCurrency(debt.minimumPayment)}) is due on ${dueDate.toLocaleDateString()}`,
            date: now,
            isRead: false,
            actionable: true,
            data: { debt, dueDate }
          });
        }
      });
    }

    // Vehicle maintenance reminders
    if (settings.vehicleReminders && budgetData.vehicleExpenses) {
      budgetData.vehicleExpenses.forEach((expense: any) => {
        const dueDate = new Date(expense.dueDate);
        if (dueDate <= reminderDate && dueDate >= now) {
          const vehicle = budgetData.vehicles?.find((v: any) => v.id === expense.vehicleId);
          newNotifications.push({
            id: `vehicle-${expense.id}-${dueDate.getTime()}`,
            type: 'vehicle_maintenance',
            title: 'Vehicle Maintenance Due',
            message: `${vehicle?.name || 'Vehicle'} ${expense.name} (${formatCurrency(expense.amount)}) is due on ${dueDate.toLocaleDateString()}`,
            date: now,
            isRead: false,
            actionable: true,
            data: { expense, vehicle, dueDate }
          });
        }
      });
    }

    // Emergency fund goal achievements
    if (settings.goalAchievements && budgetData.emergencyFund.target > 0) {
      const progress = (budgetData.emergencyFund.current / budgetData.emergencyFund.target) * 100;
      
      if (progress >= 100) {
        newNotifications.push({
          id: `goal-emergency-${Date.now()}`,
          type: 'goal_achieved',
          title: '🎉 Emergency Fund Goal Achieved!',
          message: `Congratulations! You've reached your emergency fund target of ${formatCurrency(budgetData.emergencyFund.target)}`,
          date: now,
          isRead: false,
          data: { type: 'emergency_fund', amount: budgetData.emergencyFund.current }
        });
      } else if (progress >= 75 && progress < 100) {
        newNotifications.push({
          id: `goal-emergency-75-${Date.now()}`,
          type: 'goal_achieved',
          title: '🎯 75% to Emergency Fund Goal',
          message: `You're almost there! Only ${formatCurrency(budgetData.emergencyFund.target - budgetData.emergencyFund.current)} left to reach your goal`,
          date: now,
          isRead: false,
          data: { type: 'emergency_fund_progress', progress }
        });
      }
    }

    // Low balance alerts (simulated based on cash flow)
    if (settings.lowBalanceAlerts) {
      const monthlyIncome = (budgetData.income.biweeklyGross * (1 - budgetData.income.taxRate) * 26) / 12;
      const monthlyExpenses = calculateMonthlyExpenses();
      const surplus = monthlyIncome - monthlyExpenses;
      
      if (surplus < 0) {
        newNotifications.push({
          id: `low-balance-${Date.now()}`,
          type: 'low_balance',
          title: 'Budget Deficit Alert',
          message: `You're spending ${formatCurrency(Math.abs(surplus))} more than you earn each month. Review your expenses.`,
          date: now,
          isRead: false,
          actionable: true,
          data: { deficit: Math.abs(surplus) }
        });
      }
    }

    setNotifications(newNotifications);
  };

  const calculateMonthlyExpenses = () => {
    const fixed = budgetData.expenses.fixed.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const variable = budgetData.expenses.variable.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const discretionary = budgetData.expenses.discretionary.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const twentyEightDay = budgetData.expenses.twentyEightDay.reduce((sum: number, exp: any) => sum + (exp.amount * 13) / 12, 0);
    const debtPayments = budgetData.debts.reduce((sum: number, debt: any) => sum + debt.minimumPayment, 0);
    
    return fixed + variable + discretionary + twentyEightDay + debtPayments;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bill_reminder':
      case 'vehicle_maintenance':
        return <Calendar className="h-5 w-5 text-orange-600" />;
      case 'low_balance':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'goal_achieved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <Settings className="h-4 w-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <X className="h-4 w-4 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => dismissNotification(notification.id)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-500">
                              {notification.date.toLocaleDateString()}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default NotificationCenter;