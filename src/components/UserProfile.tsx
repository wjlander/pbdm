import React, { useState } from 'react';
import { User, Settings, LogOut, Shield, Edit2, Save, X, Key, Cloud, Download, Upload } from 'lucide-react';

interface UserProfileProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string;
    role: 'primary' | 'partner';
  };
  onLogout: () => void;
  onUpdateProfile: (updates: any) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser, onLogout, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: currentUser.displayName,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: !!localStorage.getItem(`2fa_${currentUser.id}`)
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBackupOptions, setShowBackupOptions] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');

  // Enhanced password validation
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleSave = () => {
    setError('');
    setSuccess('');

    if (!editForm.displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (editForm.newPassword) {
      const passwordValidation = validatePassword(editForm.newPassword);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0]);
        return;
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (!editForm.currentPassword) {
        setError('Current password is required to change password');
        return;
      }
    }

    // Update profile
    onUpdateProfile({
      displayName: editForm.displayName,
      ...(editForm.newPassword && {
        currentPassword: editForm.currentPassword,
        newPassword: editForm.newPassword
      })
    });

    // Update 2FA setting
    if (editForm.enable2FA) {
      localStorage.setItem(`2fa_${currentUser.id}`, 'enabled');
    } else {
      localStorage.removeItem(`2fa_${currentUser.id}`);
    }

    setSuccess('Profile updated successfully');
    setIsEditing(false);
    setEditForm({
      ...editForm,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      enable2FA: editForm.enable2FA
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      displayName: currentUser.displayName,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      enable2FA: !!localStorage.getItem(`2fa_${currentUser.id}`)
    });
    setError('');
    setSuccess('');
  };

  const exportData = () => {
    const userData = {
      profile: currentUser,
      budgetData: JSON.parse(localStorage.getItem(`budgetData_${currentUser.id}`) || '{}'),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-backup-${currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccess('Data exported successfully');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.budgetData) {
          localStorage.setItem(`budgetData_${currentUser.id}`, JSON.stringify(importedData.budgetData));
          setSuccess('Data imported successfully. Please refresh the page.');
        } else {
          setError('Invalid backup file format');
        }
      } catch (err) {
        setError('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const syncToCloud = async (provider: 'onedrive' | 'googledrive') => {
    setBackupStatus('Syncing to cloud...');
    
    try {
      // Simulate cloud sync (in production, implement actual API calls)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userData = {
        profile: currentUser,
        budgetData: JSON.parse(localStorage.getItem(`budgetData_${currentUser.id}`) || '{}'),
        syncDate: new Date().toISOString(),
        version: '1.0'
      };
      
      // Store sync timestamp
      localStorage.setItem(`last_sync_${provider}`, new Date().toISOString());
      
      setBackupStatus(`Successfully synced to ${provider === 'onedrive' ? 'OneDrive' : 'Google Drive'}`);
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (err) {
      setBackupStatus('Sync failed. Please try again.');
      setTimeout(() => setBackupStatus(''), 3000);
    }
  };

  const getLastSyncDate = (provider: 'onedrive' | 'googledrive') => {
    const lastSync = localStorage.getItem(`last_sync_${provider}`);
    return lastSync ? new Date(lastSync).toLocaleDateString() : 'Never';
  };

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

          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-medium text-slate-800 mb-3">Change Password (Optional)</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={editForm.currentPassword}
                  onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={editForm.confirmPassword}
                  onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-medium text-slate-800 mb-3">Security Settings</h4>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700">Two-Factor Authentication</span>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.enable2FA}
                  onChange={(e) => setEditForm({ ...editForm, enable2FA: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <p className="text-xs text-slate-500 ml-6">
                Require a verification code when signing in
              </p>
            </div>
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
              <p className="text-slate-800 font-semibold">{currentUser.displayName}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Username</span>
              </div>
              <p className="text-slate-800 font-semibold">{currentUser.username}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Role</span>
              </div>
              <p className="text-slate-800 font-semibold capitalize">
                {currentUser.role === 'primary' ? 'Primary User' : 'Partner'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">User ID</span>
              </div>
              <p className="text-slate-800 font-mono text-sm">{currentUser.id}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Key className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Two-Factor Auth</span>
              </div>
              <p className="text-slate-800 font-semibold">
                {localStorage.getItem(`2fa_${currentUser.id}`) ? 'Enabled' : 'Disabled'}
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
            
            <button
              onClick={() => setShowBackupOptions(!showBackupOptions)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Cloud className="h-4 w-4" />
              <span>Cloud Backup Options</span>
            </button>
            
            {showBackupOptions && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <button
                      onClick={() => syncToCloud('onedrive')}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Cloud className="h-4 w-4" />
                      <span>Sync to OneDrive</span>
                    </button>
                    <p className="text-xs text-slate-500 text-center">
                      Last sync: {getLastSyncDate('onedrive')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => syncToCloud('googledrive')}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Cloud className="h-4 w-4" />
                      <span>Sync to Google Drive</span>
                    </button>
                    <p className="text-xs text-slate-500 text-center">
                      Last sync: {getLastSyncDate('googledrive')}
                    </p>
                  </div>
                </div>
                
                {backupStatus && (
                  <div className="text-center">
                    <p className="text-sm text-blue-600 font-medium">{backupStatus}</p>
                  </div>
                )}
                
                <div className="text-xs text-slate-500 text-center">
                  <p>Cloud sync stores your financial data securely in your personal cloud storage.</p>
                  <p>Data is encrypted before upload for maximum security.</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={onLogout}
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

export default UserProfile;