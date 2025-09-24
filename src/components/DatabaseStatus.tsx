import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DatabaseStatusProps {
  user?: any;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ user }) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string>('');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [dbInfo, setDbInfo] = useState<any>(null);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setError('');
    
    try {
      // Test basic connection
      const { data, error: connectionError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw connectionError;
      }

      // Get database info
      const { data: versionData } = await supabase.rpc('version');
      
      setDbInfo({
        tablesAccessible: true,
        version: versionData || 'Unknown',
        userConnected: !!user,
        timestamp: new Date().toISOString()
      });

      setConnectionStatus('connected');
      setLastCheck(new Date());
    } catch (err: any) {
      console.error('Database connection error:', err);
      setError(err.message || 'Connection failed');
      setConnectionStatus('error');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
  }, [user]);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Checking connection...';
      case 'connected':
        return 'Connected to Supabase';
      case 'error':
        return 'Connection failed';
    }
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-slate-600" />
          <h4 className="font-semibold text-slate-800">Database Status</h4>
        </div>
        <button
          onClick={checkConnection}
          disabled={connectionStatus === 'checking'}
          className="p-1 hover:bg-white rounded transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw className={`h-4 w-4 text-slate-600 ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-slate-800">{getStatusText()}</span>
        </div>

        {connectionStatus === 'connected' && dbInfo && (
          <div className="text-sm text-slate-600 space-y-1">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <span>Database tables accessible</span>
            </div>
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>User authenticated: {user.email}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-orange-600" />
                  <span>No user authenticated</span>
                </>
              )}
            </div>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="text-sm text-red-600">
            <p className="font-medium">Error Details:</p>
            <p className="bg-red-100 p-2 rounded text-xs font-mono">{error}</p>
            <div className="mt-2 text-xs">
              <p><strong>Common Issues:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check .env file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                <li>Ensure database tables are created (run migration)</li>
                <li>Verify Supabase project is active</li>
                <li>Check browser console for additional errors</li>
              </ul>
            </div>
          </div>
        )}

        {lastCheck && (
          <div className="text-xs text-slate-500">
            Last checked: {lastCheck.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus;