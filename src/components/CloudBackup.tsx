import React, { useState, useEffect } from 'react';
import { Cloud, Download, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface CloudBackupProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface BackupStatus {
  isConnected: boolean;
  lastSync: string | null;
  syncInProgress: boolean;
  error: string | null;
}

const CloudBackup: React.FC<CloudBackupProps> = ({ currentUser }) => {
  const [oneDriveStatus, setOneDriveStatus] = useState<BackupStatus>({
    isConnected: false,
    lastSync: null,
    syncInProgress: false,
    error: null
  });
  
  const [googleDriveStatus, setGoogleDriveStatus] = useState<BackupStatus>({
    isConnected: false,
    lastSync: null,
    syncInProgress: false,
    error: null
  });

  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    // Load backup settings
    const settings = localStorage.getItem(`backup_settings_${currentUser.id}`);
    if (settings) {
      const parsed = JSON.parse(settings);
      setAutoBackupEnabled(parsed.autoBackupEnabled || false);
      setBackupFrequency(parsed.backupFrequency || 'weekly');
    }

    // Load sync status
    const oneDriveSync = localStorage.getItem(`onedrive_sync_${currentUser.id}`);
    const googleDriveSync = localStorage.getItem(`googledrive_sync_${currentUser.id}`);
    
    if (oneDriveSync) {
      const parsed = JSON.parse(oneDriveSync);
      setOneDriveStatus(prev => ({ ...prev, ...parsed }));
    }
    
    if (googleDriveSync) {
      const parsed = JSON.parse(googleDriveSync);
      setGoogleDriveStatus(prev => ({ ...prev, ...parsed }));
    }
  }, [currentUser.id]);

  const saveBackupSettings = () => {
    const settings = {
      autoBackupEnabled,
      backupFrequency,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`backup_settings_${currentUser.id}`, JSON.stringify(settings));
  };

  const connectToOneDrive = async () => {
    setOneDriveStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    try {
      // DEMO MODE: This is a simulation of OneDrive integration
      // In production, this would redirect to Microsoft OAuth
      setOneDriveStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'OneDrive integration is currently in demo mode. Real integration requires Microsoft Graph API setup.'
      }));
      return;
      
      // Real implementation would look like:
      // window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=Files.ReadWrite.All`;
    } catch (error) {
      setOneDriveStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Failed to connect to OneDrive'
      }));
    }
  };

  const connectToGoogleDrive = async () => {
    setGoogleDriveStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    try {
      // DEMO MODE: This is a simulation of Google Drive integration
      setGoogleDriveStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Google Drive integration is currently in demo mode. Real integration requires Google Drive API setup.'
      }));
      return;
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      const newStatus = {
        isConnected: true,
        lastSync: null,
        syncInProgress: false,
        error: null
      };
      
      setGoogleDriveStatus(newStatus);
      localStorage.setItem(`googledrive_sync_${currentUser.id}`, JSON.stringify(newStatus));
      
      // Perform initial sync
      await syncToGoogleDrive();
    } catch (error) {
      setGoogleDriveStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Failed to connect to Google Drive'
      }));
    }
  };

  const syncToOneDrive = async () => {
    if (!oneDriveStatus.isConnected) return;
    
    setOneDriveStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    try {
      // Get user data
      const budgetData = localStorage.getItem(`budgetData_${currentUser.id}`);
      const backupData = {
        userId: currentUser.id,
        username: currentUser.username,
        budgetData: budgetData ? JSON.parse(budgetData) : {},
        backupDate: new Date().toISOString(),
        version: '1.0'
      };

      // Simulate upload to OneDrive (in production, use Microsoft Graph API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newStatus = {
        ...oneDriveStatus,
        lastSync: new Date().toISOString(),
        syncInProgress: false,
        error: null
      };
      
      setOneDriveStatus(newStatus);
      localStorage.setItem(`onedrive_sync_${currentUser.id}`, JSON.stringify(newStatus));
    } catch (error) {
      setOneDriveStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Sync to OneDrive failed'
      }));
    }
  };

  const syncToGoogleDrive = async () => {
    if (!googleDriveStatus.isConnected) return;
    
    setGoogleDriveStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    try {
      // Get user data
      const budgetData = localStorage.getItem(`budgetData_${currentUser.id}`);
      const backupData = {
        userId: currentUser.id,
        username: currentUser.username,
        budgetData: budgetData ? JSON.parse(budgetData) : {},
        backupDate: new Date().toISOString(),
        version: '1.0'
      };

      // Simulate upload to Google Drive (in production, use Google Drive API)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newStatus = {
        ...googleDriveStatus,
        lastSync: new Date().toISOString(),
        syncInProgress: false,
        error: null
      };
      
      setGoogleDriveStatus(newStatus);
      localStorage.setItem(`googledrive_sync_${currentUser.id}`, JSON.stringify(newStatus));
    } catch (error) {
      setGoogleDriveStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Sync to Google Drive failed'
      }));
    }
  };

  const restoreFromCloud = async (provider: 'onedrive' | 'googledrive') => {
    const status = provider === 'onedrive' ? oneDriveStatus : googleDriveStatus;
    const setStatus = provider === 'onedrive' ? setOneDriveStatus : setGoogleDriveStatus;
    
    if (!status.isConnected) return;
    
    setStatus(prev => ({ ...prev, syncInProgress: true, error: null }));
    
    try {
      // Simulate download from cloud (in production, implement actual API calls)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate restored data
      const restoredData = {
        // This would be actual data from cloud storage
        budgetData: {},
        restoreDate: new Date().toISOString()
      };
      
      // In production, you would restore the actual data
      // localStorage.setItem(`budgetData_${currentUser.id}`, JSON.stringify(restoredData.budgetData));
      
      setStatus(prev => ({ ...prev, syncInProgress: false, error: null }));
      alert(`Data restored from ${provider === 'onedrive' ? 'OneDrive' : 'Google Drive'}. Please refresh the page.`);
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: `Failed to restore from ${provider === 'onedrive' ? 'OneDrive' : 'Google Drive'}`
      }));
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    return new Date(lastSync).toLocaleString();
  };

  useEffect(() => {
    saveBackupSettings();
  }, [autoBackupEnabled, backupFrequency]);

  // Auto backup functionality
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const getBackupInterval = () => {
      switch (backupFrequency) {
        case 'daily': return 24 * 60 * 60 * 1000; // 24 hours
        case 'weekly': return 7 * 24 * 60 * 60 * 1000; // 7 days
        case 'monthly': return 30 * 24 * 60 * 60 * 1000; // 30 days
        default: return 7 * 24 * 60 * 60 * 1000;
      }
    };

    const checkAndSync = () => {
      const interval = getBackupInterval();
      const now = Date.now();

      if (oneDriveStatus.isConnected && oneDriveStatus.lastSync) {
        const lastSyncTime = new Date(oneDriveStatus.lastSync).getTime();
        if (now - lastSyncTime >= interval) {
          syncToOneDrive();
        }
      }

      if (googleDriveStatus.isConnected && googleDriveStatus.lastSync) {
        const lastSyncTime = new Date(googleDriveStatus.lastSync).getTime();
        if (now - lastSyncTime >= interval) {
          syncToGoogleDrive();
        }
      }
    };

    // Check immediately and then set up interval
    checkAndSync();
    const intervalId = setInterval(checkAndSync, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(intervalId);
  }, [autoBackupEnabled, backupFrequency, oneDriveStatus, googleDriveStatus]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Cloud className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">Cloud Backup</h3>
      </div>

      {/* Auto Backup Settings */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoBackupEnabled}
              onChange={(e) => setAutoBackupEnabled(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-slate-800">Enable Automatic Backup</span>
          </label>
        </div>
        
        {autoBackupEnabled && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}
      </div>

      {/* Cloud Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OneDrive */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Cloud className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-slate-800">Microsoft OneDrive</h4>
            {oneDriveStatus.isConnected && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              <p>Status: {oneDriveStatus.isConnected ? 'Connected' : 'Not Connected'}</p>
              <p>Last Sync: {formatLastSync(oneDriveStatus.lastSync)}</p>
            </div>

            {oneDriveStatus.error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{oneDriveStatus.error}</span>
              </div>
            )}

            <div className="space-y-2">
              {!oneDriveStatus.isConnected ? (
                <button
                  onClick={connectToOneDrive}
                  disabled={oneDriveStatus.syncInProgress}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors flex items-center justify-center space-x-2"
                >
                  {oneDriveStatus.syncInProgress ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4" />
                      <span>Connect to OneDrive</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={syncToOneDrive}
                    disabled={oneDriveStatus.syncInProgress}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-slate-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    {oneDriveStatus.syncInProgress ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Sync Now</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => restoreFromCloud('onedrive')}
                    disabled={oneDriveStatus.syncInProgress}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Restore Data</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Google Drive */}
        <div className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Cloud className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold text-slate-800">Google Drive</h4>
            {googleDriveStatus.isConnected && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              <p>Status: {googleDriveStatus.isConnected ? 'Connected' : 'Not Connected'}</p>
              <p>Last Sync: {formatLastSync(googleDriveStatus.lastSync)}</p>
            </div>

            {googleDriveStatus.error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{googleDriveStatus.error}</span>
              </div>
            )}

            <div className="space-y-2">
              {!googleDriveStatus.isConnected ? (
                <button
                  onClick={connectToGoogleDrive}
                  disabled={googleDriveStatus.syncInProgress}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-slate-300 transition-colors flex items-center justify-center space-x-2"
                >
                  {googleDriveStatus.syncInProgress ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4" />
                      <span>Connect to Google Drive</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={syncToGoogleDrive}
                    disabled={googleDriveStatus.syncInProgress}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-slate-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    {googleDriveStatus.syncInProgress ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Sync Now</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => restoreFromCloud('googledrive')}
                    disabled={googleDriveStatus.syncInProgress}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:bg-slate-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Restore Data</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Demo Mode Notice</p>
            <ul className="space-y-1 text-xs">
              <li>• Cloud backup is currently in demonstration mode</li>
              <li>• Real integration requires API keys and OAuth setup</li>
              <li>• Use the Export/Import feature for actual backups</li>
              <li>• Supabase provides automatic cloud storage for your data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudBackup;