import React, { useState } from 'react';
import { Car, Plus, Trash2, Calendar, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

interface VehicleManagerProps {
  budgetData: any;
  setBudgetData: (data: any) => void;
}

interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  registration: string;
}

interface VehicleExpense {
  id: string;
  vehicleId: string;
  type: 'MOT' | 'Service' | 'Insurance' | 'Tax' | 'Repair' | 'Fuel' | 'Other';
  name: string;
  amount: number;
  dueDate: string;
  isRecurring: boolean;
  recurringMonths?: number;
  lastCompleted?: string;
  notes?: string;
}

const VehicleManager: React.FC<VehicleManagerProps> = ({ budgetData, setBudgetData }) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'expenses'>('vehicles');
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    registration: ''
  });
  const [newExpense, setNewExpense] = useState<Partial<VehicleExpense>>({
    vehicleId: '',
    type: 'Service',
    name: '',
    amount: 0,
    dueDate: '',
    isRecurring: true,
    recurringMonths: 12
  });

  const vehicles = budgetData.vehicles || [];
  const vehicleExpenses = budgetData.vehicleExpenses || [];

  const addVehicle = () => {
    if (!newVehicle.name || !newVehicle.make || !newVehicle.model) return;

    const vehicle: Vehicle = {
      id: Date.now().toString(),
      name: newVehicle.name,
      make: newVehicle.make,
      model: newVehicle.model,
      year: newVehicle.year || new Date().getFullYear(),
      registration: newVehicle.registration || ''
    };

    setBudgetData({
      ...budgetData,
      vehicles: [...vehicles, vehicle]
    });

    setNewVehicle({ name: '', make: '', model: '', year: new Date().getFullYear(), registration: '' });
  };

  const addExpense = () => {
    if (!newExpense.vehicleId || !newExpense.name || !newExpense.amount || !newExpense.dueDate) return;

    const expense: VehicleExpense = {
      id: Date.now().toString(),
      vehicleId: newExpense.vehicleId,
      type: newExpense.type || 'Service',
      name: newExpense.name,
      amount: newExpense.amount,
      dueDate: newExpense.dueDate,
      isRecurring: newExpense.isRecurring || false,
      recurringMonths: newExpense.recurringMonths,
      notes: newExpense.notes
    };

    setBudgetData({
      ...budgetData,
      vehicleExpenses: [...vehicleExpenses, expense]
    });

    setNewExpense({
      vehicleId: '',
      type: 'Service',
      name: '',
      amount: 0,
      dueDate: '',
      isRecurring: true,
      recurringMonths: 12
    });
  };

  const removeVehicle = (vehicleId: string) => {
    setBudgetData({
      ...budgetData,
      vehicles: vehicles.filter((v: Vehicle) => v.id !== vehicleId),
      vehicleExpenses: vehicleExpenses.filter((e: VehicleExpense) => e.vehicleId !== vehicleId)
    });
  };

  const removeExpense = (expenseId: string) => {
    setBudgetData({
      ...budgetData,
      vehicleExpenses: vehicleExpenses.filter((e: VehicleExpense) => e.id !== expenseId)
    });
  };

  const getUpcomingExpenses = () => {
    const now = new Date();
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    return vehicleExpenses
      .filter((expense: VehicleExpense) => {
        const dueDate = new Date(expense.dueDate);
        return dueDate >= now && dueDate <= threeMonthsFromNow;
      })
      .sort((a: VehicleExpense, b: VehicleExpense) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
  };

  const getExpensesByVehicle = (vehicleId: string) => {
    return vehicleExpenses.filter((e: VehicleExpense) => e.vehicleId === vehicleId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getExpenseTypeIcon = (type: string) => {
    switch (type) {
      case 'MOT': return <CheckCircle className="h-4 w-4" />;
      case 'Service': return <Wrench className="h-4 w-4" />;
      case 'Insurance': return <AlertTriangle className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getExpenseTypeColor = (type: string) => {
    switch (type) {
      case 'MOT': return 'text-green-600 bg-green-50 border-green-200';
      case 'Service': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Insurance': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Tax': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Repair': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const upcomingExpenses = getUpcomingExpenses();
  const totalUpcomingCost = upcomingExpenses.reduce((sum: number, expense: VehicleExpense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Car className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Vehicle Management</h2>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-blue-700">{vehicles.length}</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Upcoming (3 months)</p>
                <p className="text-2xl font-bold text-orange-700">{upcomingExpenses.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Upcoming Costs</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalUpcomingCost)}</p>
              </div>
              <span className="h-8 w-8 text-green-600 font-bold text-xl flex items-center justify-center">£</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'vehicles'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'expenses'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Expenses & Maintenance
          </button>
        </div>

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Add New Vehicle</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={newVehicle.name || ''}
                    onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Car"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Make *
                  </label>
                  <input
                    type="text"
                    value={newVehicle.make || ''}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Toyota"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={newVehicle.model || ''}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Corolla"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={newVehicle.year || ''}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2020"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={addVehicle}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Vehicle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Vehicle List */}
            <div className="space-y-4">
              {vehicles.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vehicles added yet. Add your first vehicle above!</p>
                </div>
              ) : (
                vehicles.map((vehicle: Vehicle) => {
                  const vehicleExpensesList = getExpensesByVehicle(vehicle.id);
                  const nextExpense = vehicleExpensesList
                    .filter((e: VehicleExpense) => new Date(e.dueDate) > new Date())
                    .sort((a: VehicleExpense, b: VehicleExpense) => 
                      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                    )[0];

                  return (
                    <div
                      key={vehicle.id}
                      className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Car className="h-5 w-5 text-blue-600" />
                            <h4 className="text-lg font-semibold text-slate-800">{vehicle.name}</h4>
                          </div>
                          <div className="text-sm text-slate-600 space-y-1">
                            <p>{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                            {vehicle.registration && <p>Registration: {vehicle.registration}</p>}
                            <p>{vehicleExpensesList.length} maintenance items tracked</p>
                            {nextExpense && (
                              <p className="text-orange-600 font-medium">
                                Next: {nextExpense.name} - {new Date(nextExpense.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeVehicle(vehicle.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {vehicles.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Please add a vehicle first before tracking expenses.</p>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Add Vehicle Expense</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Vehicle *
                      </label>
                      <select
                        value={newExpense.vehicleId || ''}
                        onChange={(e) => setNewExpense({ ...newExpense, vehicleId: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map((vehicle: Vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={newExpense.type || 'Service'}
                        onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="MOT">MOT</option>
                        <option value="Service">Service</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Tax">Road Tax</option>
                        <option value="Repair">Repair</option>
                        <option value="Fuel">Fuel</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={newExpense.name || ''}
                        onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Annual MOT"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Amount *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">£</span>
                        <input
                          type="number"
                          value={newExpense.amount || ''}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50.00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={newExpense.dueDate || ''}
                        onChange={(e) => setNewExpense({ ...newExpense, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={addExpense}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upcoming Expenses */}
                {upcomingExpenses.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="font-semibold text-orange-800 mb-4">Upcoming Expenses (Next 3 Months)</h3>
                    <div className="space-y-3">
                      {upcomingExpenses.map((expense: VehicleExpense) => {
                        const vehicle = vehicles.find((v: Vehicle) => v.id === expense.vehicleId);
                        const daysUntilDue = Math.ceil((new Date(expense.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <div
                            key={expense.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${getExpenseTypeColor(expense.type)}`}
                          >
                            <div className="flex items-center space-x-3">
                              {getExpenseTypeIcon(expense.type)}
                              <div>
                                <div className="font-medium">{expense.name}</div>
                                <div className="text-sm opacity-75">
                                  {vehicle?.name} • Due in {daysUntilDue} days ({new Date(expense.dueDate).toLocaleDateString()})
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                              <div className="text-xs opacity-75">{expense.type}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* All Expenses */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">All Vehicle Expenses</h3>
                  {vehicleExpenses.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No vehicle expenses tracked yet. Add your first expense above!</p>
                    </div>
                  ) : (
                    vehicleExpenses.map((expense: VehicleExpense) => {
                      const vehicle = vehicles.find((v: Vehicle) => v.id === expense.vehicleId);
                      const isPastDue = new Date(expense.dueDate) < new Date();
                      
                      return (
                        <div
                          key={expense.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            isPastDue ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {getExpenseTypeIcon(expense.type)}
                            <div>
                              <div className="font-medium">{expense.name}</div>
                              <div className="text-sm text-slate-600">
                                {vehicle?.name} • {new Date(expense.dueDate).toLocaleDateString()}
                                {expense.isRecurring && ` • Recurring every ${expense.recurringMonths} months`}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                              <div className={`text-xs ${isPastDue ? 'text-red-600' : 'text-slate-500'}`}>
                                {expense.type}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeExpense(expense.id)}
                              className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManager;