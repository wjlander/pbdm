import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Target, DollarSign, Calendar, CheckCircle } from 'lucide-react';

interface OnboardingWizardProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
  onComplete: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ budgetData, setBudgetData, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    biweeklyGross: '',
    taxRate: '25',
    nextPayDate: new Date().toISOString().split('T')[0],
    emergencyTarget: '',
    primaryGoal: ''
  });

  const steps = [
    {
      title: 'Welcome to Your Financial Journey',
      subtitle: 'Let\'s set up your personal finance manager in just a few steps',
      component: WelcomeStep
    },
    {
      title: 'Income Setup',
      subtitle: 'Tell us about your regular income',
      component: IncomeStep
    },
    {
      title: 'Emergency Fund Goal',
      subtitle: 'Set your emergency fund target',
      component: EmergencyStep
    },
    {
      title: 'Primary Financial Goal',
      subtitle: 'What\'s your main financial priority?',
      component: GoalStep
    },
    {
      title: 'You\'re All Set!',
      subtitle: 'Your personal finance manager is ready to use',
      component: CompletionStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save data and complete onboarding
      setBudgetData({
        ...budgetData,
        income: {
          biweeklyGross: Number(formData.biweeklyGross),
          taxRate: Number(formData.taxRate) / 100,
          nextPayDate: formData.nextPayDate
        },
        emergencyFund: {
          ...budgetData.emergencyFund,
          target: Number(formData.emergencyTarget)
        },
        primaryGoal: formData.primaryGoal
      });
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.biweeklyGross && Number(formData.biweeklyGross) > 0;
      case 2: return formData.emergencyTarget && Number(formData.emergencyTarget) > 0;
      case 3: return formData.primaryGoal;
      default: return true;
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-slate-600">
              {steps[currentStep].subtitle}
            </p>
          </div>

          <CurrentStepComponent formData={formData} setFormData={setFormData} />
        </div>

        {/* Navigation */}
        <div className="bg-slate-50 px-8 py-6 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
              isStepValid()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep: React.FC<any> = () => (
  <div className="text-center space-y-6">
    <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
      <Target className="h-10 w-10 text-blue-600" />
    </div>
    <div className="space-y-4">
      <p className="text-lg text-slate-700">
        Take control of your finances with a personalized budgeting experience designed for your unique situation.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4">
          <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800">Track Income</h3>
          <p className="text-sm text-slate-600">Monitor your biweekly pay schedule</p>
        </div>
        <div className="text-center p-4">
          <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800">Plan Payments</h3>
          <p className="text-sm text-slate-600">Never miss a bill or payment</p>
        </div>
        <div className="text-center p-4">
          <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800">Achieve Goals</h3>
          <p className="text-sm text-slate-600">Build wealth systematically</p>
        </div>
      </div>
    </div>
  </div>
);

const IncomeStep: React.FC<any> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Biweekly Gross Salary *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
          <input
            type="number"
            value={formData.biweeklyGross}
            onChange={(e) => setFormData({ ...formData, biweeklyGross: e.target.value })}
            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="2,500.00"
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">Your gross pay before taxes and deductions</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Tax Rate (%)
        </label>
        <input
          type="number"
          value={formData.taxRate}
          onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="25"
          min="0"
          max="50"
        />
        <p className="text-xs text-slate-500 mt-1">Combined tax and deduction rate</p>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Next Pay Date
      </label>
      <input
        type="date"
        value={formData.nextPayDate}
        onChange={(e) => setFormData({ ...formData, nextPayDate: e.target.value })}
        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {formData.biweeklyGross && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">Your Income Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-green-700">Biweekly Net:</span>
            <div className="font-semibold">
              £{(Number(formData.biweeklyGross) * (1 - Number(formData.taxRate) / 100)).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-green-700">Annual Net:</span>
            <div className="font-semibold">
              £{(Number(formData.biweeklyGross) * (1 - Number(formData.taxRate) / 100) * 26).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

const EmergencyStep: React.FC<any> = ({ formData, setFormData }) => {
  const monthlyNet = formData.biweeklyGross 
    ? (Number(formData.biweeklyGross) * (1 - Number(formData.taxRate) / 100) * 26) / 12 
    : 0;

  const suggestions = [
    { months: 3, amount: monthlyNet * 3, label: 'Conservative (3 months)' },
    { months: 6, amount: monthlyNet * 6, label: 'Recommended (6 months)' },
    { months: 12, amount: monthlyNet * 12, label: 'Aggressive (12 months)' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Emergency Fund Target *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
          <input
            type="number"
            value={formData.emergencyTarget}
            onChange={(e) => setFormData({ ...formData, emergencyTarget: e.target.value })}
            className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="10,000"
          />
        </div>
      </div>

      {monthlyNet > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-800">Suggested Targets</h4>
          <div className="grid grid-cols-1 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setFormData({ ...formData, emergencyTarget: suggestion.amount.toString() })}
                className="text-left p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-800">{suggestion.label}</div>
                    <div className="text-sm text-slate-600">
                      {suggestion.months} months of expenses
                    </div>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    £{suggestion.amount.toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Start with a smaller goal like £1,000 and gradually build up. 
          Even a small emergency fund can prevent debt when unexpected expenses arise.
        </p>
      </div>
    </div>
  );
};

const GoalStep: React.FC<any> = ({ formData, setFormData }) => {
  const goals = [
    { id: 'debt', title: 'Pay Off Debt', description: 'Eliminate high-interest debt first', icon: '💳' },
    { id: 'emergency', title: 'Build Emergency Fund', description: 'Create financial security', icon: '🛡️' },
    { id: 'house', title: 'Save for House', description: 'Build deposit for home purchase', icon: '🏠' },
    { id: 'retirement', title: 'Retirement Savings', description: 'Secure your future', icon: '🏖️' },
    { id: 'investment', title: 'Start Investing', description: 'Grow wealth through investments', icon: '📈' },
    { id: 'other', title: 'Other Goal', description: 'Custom financial objective', icon: '🎯' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-4">
          What's your primary financial goal? *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setFormData({ ...formData, primaryGoal: goal.id })}
              className={`text-left p-4 border-2 rounded-lg transition-colors ${
                formData.primaryGoal === goal.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{goal.icon}</span>
                <div>
                  <div className="font-semibold text-slate-800">{goal.title}</div>
                  <div className="text-sm text-slate-600">{goal.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CompletionStep: React.FC<any> = () => (
  <div className="text-center space-y-6">
    <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
      <CheckCircle className="h-10 w-10 text-green-600" />
    </div>
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-800">
        Congratulations! 🎉
      </h3>
      <p className="text-slate-600">
        Your personal finance manager is now configured and ready to help you achieve your financial goals.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
        <ul className="text-sm text-blue-700 space-y-1 text-left">
          <li>• Add your regular expenses in the Expenses tab</li>
          <li>• Set up your debts in the Debts section</li>
          <li>• Check your Pay Calendar for cash flow planning</li>
          <li>• Review your Dashboard for insights</li>
        </ul>
      </div>
    </div>
  </div>
);

export default OnboardingWizard;