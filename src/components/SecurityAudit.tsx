import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Eye, Lock, Key, Clock, Activity } from 'lucide-react';

interface SecurityAuditProps {
  currentUser: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_change' | 'data_export' | 'settings_change';
  timestamp: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityScore {
  overall: number;
  factors: {
    passwordStrength: number;
    twoFactorAuth: number;
    recentActivity: number;
    dataBackup: number;
  };
}

const SecurityAudit: React.FC<SecurityAuditProps> = ({ currentUser }) => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityScore, setSecurityScore] = useState<SecurityScore>({
    overall: 0,
    factors: {
      passwordStrength: 0,
      twoFactorAuth: 0,
      recentActivity: 0,
      dataBackup: 0
    }
  });
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    loadSecurityEvents();
    calculateSecurityScore();
  }, [currentUser.id]);

  const loadSecurityEvents = () => {
    const events = localStorage.getItem(`security_events_${currentUser.id}`);
    if (events) {
      setSecurityEvents(JSON.parse(events));
    } else {
      // Generate some sample events for demonstration
      const sampleEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login',
          timestamp: new Date().toISOString(),
          details: 'Successful login',
          ipAddress: '192.168.1.100'
        },
        {
          id: '2',
          type: 'settings_change',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          details: 'Profile settings updated',
          ipAddress: '192.168.1.100'
        }
      ];
      setSecurityEvents(sampleEvents);
      localStorage.setItem(`security_events_${currentUser.id}`, JSON.stringify(sampleEvents));
    }
  };

  const calculateSecurityScore = () => {
    let passwordStrength = 0;
    let twoFactorAuth = 0;
    let recentActivity = 0;
    let dataBackup = 0;

    // Check password strength (simplified)
    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const user = users.find((u: any) => u.id === currentUser.id);
    if (user) {
      // In a real app, you'd analyze the actual password strength
      passwordStrength = 75; // Assume decent password
    }

    // Check 2FA
    if (localStorage.getItem(`2fa_${currentUser.id}`)) {
      twoFactorAuth = 100;
    }

    // Check recent activity (no suspicious activity = good)
    const failedLogins = securityEvents.filter(e => e.type === 'failed_login').length;
    recentActivity = Math.max(0, 100 - (failedLogins * 20));

    // Check data backup
    const oneDriveSync = localStorage.getItem(`onedrive_sync_${currentUser.id}`);
    const googleDriveSync = localStorage.getItem(`googledrive_sync_${currentUser.id}`);
    if (oneDriveSync || googleDriveSync) {
      dataBackup = 100;
    }

    const overall = Math.round((passwordStrength + twoFactorAuth + recentActivity + dataBackup) / 4);

    setSecurityScore({
      overall,
      factors: {
        passwordStrength,
        twoFactorAuth,
        recentActivity,
        dataBackup
      }
    });
  };

  const logSecurityEvent = (type: SecurityEvent['type'], details: string) => {
    const newEvent: SecurityEvent = {
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: '192.168.1.100' // In production, get real IP
    };

    const updatedEvents = [newEvent, ...securityEvents].slice(0, 50); // Keep last 50 events
    setSecurityEvents(updatedEvents);
    localStorage.setItem(`security_events_${currentUser.id}`, JSON.stringify(updatedEvents));
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'password_change':
        return <Key className="h-4 w-4 text-blue-600" />;
      case 'data_export':
        return <Eye className="h-4 w-4 text-orange-600" />;
      case 'settings_change':
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-slate-600" />;
    }
  };

  const getEventColor = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return 'bg-green-50 border-green-200';
      case 'failed_login':
        return 'bg-red-50 border-red-200';
      case 'password_change':
        return 'bg-blue-50 border-blue-200';
      case 'data_export':
        return 'bg-orange-50 border-orange-200';
      case 'settings_change':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const visibleEvents = showAllEvents ? securityEvents : securityEvents.slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-800">Security Audit</h3>
      </div>

      {/* Security Score */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">Overall Security Score</h4>
          <div className={`text-3xl font-bold ${getScoreColor(securityScore.overall)}`}>
            {securityScore.overall}/100
          </div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getScoreBgColor(securityScore.overall)}`}
            style={{ width: `${securityScore.overall}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-lg font-semibold ${getScoreColor(securityScore.factors.passwordStrength)}`}>
              {securityScore.factors.passwordStrength}%
            </div>
            <div className="text-xs text-slate-600">Password Strength</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${getScoreColor(securityScore.factors.twoFactorAuth)}`}>
              {securityScore.factors.twoFactorAuth}%
            </div>
            <div className="text-xs text-slate-600">Two-Factor Auth</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${getScoreColor(securityScore.factors.recentActivity)}`}>
              {securityScore.factors.recentActivity}%
            </div>
            <div className="text-xs text-slate-600">Activity Health</div>
          </div>
          
          <div className="text-center">
            <div className={`text-lg font-semibold ${getScoreColor(securityScore.factors.dataBackup)}`}>
              {securityScore.factors.dataBackup}%
            </div>
            <div className="text-xs text-slate-600">Data Backup</div>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-800 mb-3">Security Recommendations</h4>
        <div className="space-y-2">
          {securityScore.factors.twoFactorAuth < 100 && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Enable Two-Factor Authentication for enhanced security
              </span>
            </div>
          )}
          
          {securityScore.factors.passwordStrength < 80 && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Lock className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">
                Consider using a stronger password with mixed characters
              </span>
            </div>
          )}
          
          {securityScore.factors.dataBackup < 100 && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Set up cloud backup to protect your financial data
              </span>
            </div>
          )}
          
          {securityScore.overall >= 80 && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">
                Great job! Your account security is excellent
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Security Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-800">Recent Security Activity</h4>
          <button
            onClick={() => setShowAllEvents(!showAllEvents)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAllEvents ? 'Show Less' : 'Show All'}
          </button>
        </div>

        <div className="space-y-3">
          {visibleEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events recorded</p>
            </div>
          ) : (
            visibleEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg ${getEventColor(event.type)}`}
              >
                {getEventIcon(event.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{event.details}</span>
                    <span className="text-xs text-slate-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  {event.ipAddress && (
                    <div className="text-xs text-slate-500 mt-1">
                      IP: {event.ipAddress}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Security Best Practices</p>
            <ul className="space-y-1 text-xs">
              <li>• Use a unique, strong password for your account</li>
              <li>• Enable two-factor authentication</li>
              <li>• Regularly backup your financial data</li>
              <li>• Monitor your account for suspicious activity</li>
              <li>• Keep your browser and device updated</li>
              <li>• Never share your login credentials</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAudit;