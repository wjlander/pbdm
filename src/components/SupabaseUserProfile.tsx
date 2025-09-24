import React, { useState } from 'react';
import { User, Settings, LogOut, Shield, Edit2, Save, X, Key, Download, Upload } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

const SupabaseUserProfile: React.FC = () => {
  const { user, signOut, updateProfile } = useSupabaseAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!editForm.displayName.trim()) {
      setError('Display name is required');
      return;
    }

    try {
      await updateProfile({ display_name: editForm.displayName });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      displayName: user?.user_metadata?.display_name || user?.email?.split('@')[0] || '',
    });
    setError('');
    setSuccess('');
  };

  const exportData = () => {
    // This would export the user's budget data from Supabase
    // For now, we'll show a message that this feature is coming
    setSuccess('Export feature will be implemented with Supabase data');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // This would import data to Supabase
    // For now, we'll show a message that this feature is coming
    setSuccess('Import feature will be implemented with Supabase data');
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">User Profile</h3>
            <p className="text-sm text-slate-600">Manage your account settings</p>
          </div>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Display Name</span>
              </div>
              <p className="text-slate-800 font-semibold">
                {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Email</span>
              </div>
              <p className="text-slate-800 font-semibold">{user.email}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">User ID</span>
              </div>
              <p className="text-slate-800 font-mono text-sm">{user.id}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Key className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Account Created</span>
              </div>
              <p className="text-slate-800 font-semibold">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Data Management Section */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-medium text-slate-800 mb-4">Data Management</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <button
                onClick={exportData}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
              
              <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseUserProfile;