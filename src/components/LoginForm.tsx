import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react';

interface LoginFormProps {
  onLogin: (userId: string, username: string) => void;
}

interface UserCredentials {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: 'primary' | 'partner';
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Simple hash function for password storage (in production, use bcrypt or similar)
  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  };

  // Get stored users or create default setup
  const getStoredUsers = (): UserCredentials[] => {
    const stored = localStorage.getItem('app_users');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  };

  const saveUsers = (users: UserCredentials[]) => {
    localStorage.setItem('app_users', JSON.stringify(users));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const users = getStoredUsers();
      const hashedPassword = simpleHash(password);
      
      const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.passwordHash === hashedPassword
      );

      if (user) {
        onLogin(user.id, user.displayName);
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupUsers = (primaryUser: any, partnerUser: any) => {
    const users: UserCredentials[] = [
      {
        id: 'user_1',
        username: primaryUser.username,
        passwordHash: simpleHash(primaryUser.password),
        displayName: primaryUser.displayName,
        role: 'primary'
      },
      {
        id: 'user_2',
        username: partnerUser.username,
        passwordHash: simpleHash(partnerUser.password),
        displayName: partnerUser.displayName,
        role: 'partner'
      }
    ];

    saveUsers(users);
    setShowSetup(false);
    setError('');
  };

  const users = getStoredUsers();
  const needsSetup = users.length === 0;

  if (needsSetup || showSetup) {
    return <UserSetup onSetupComplete={handleSetupUsers} onCancel={() => setShowSetup(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Personal Finance Manager</h1>
          <p className="text-slate-600">Secure access for you and your partner</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="text-center">
            <button
              onClick={() => setShowSetup(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset User Accounts
            </button>
          </div>
          
          <div className="mt-4 text-xs text-slate-500 text-center">
            <p>Registered Users: {users.map(u => u.displayName).join(' & ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Setup Component
interface UserSetupProps {
  onSetupComplete: (primaryUser: any, partnerUser: any) => void;
  onCancel: () => void;
}

const UserSetup: React.FC<UserSetupProps> = ({ onSetupComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [primaryUser, setPrimaryUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [partnerUser, setPartnerUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [error, setError] = useState('');

  const validateStep1 = () => {
    if (!primaryUser.username || !primaryUser.password || !primaryUser.displayName) {
      setError('All fields are required');
      return false;
    }
    if (primaryUser.password !== primaryUser.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (primaryUser.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!partnerUser.username || !partnerUser.password || !partnerUser.displayName) {
      setError('All fields are required');
      return false;
    }
    if (partnerUser.password !== partnerUser.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (partnerUser.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (partnerUser.username.toLowerCase() === primaryUser.username.toLowerCase()) {
      setError('Usernames must be different');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      onSetupComplete(primaryUser, partnerUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-green-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Setup User Accounts</h1>
          <p className="text-slate-600">Create accounts for you and your partner</p>
          <div className="mt-4 text-sm text-slate-500">
            Step {step} of 2
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">
            {step === 1 ? 'Primary User Account' : 'Partner Account'}
          </h3>

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={primaryUser.displayName}
                  onChange={(e) => setPrimaryUser({ ...primaryUser, displayName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={primaryUser.username}
                  onChange={(e) => setPrimaryUser({ ...primaryUser, username: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={primaryUser.password}
                  onChange={(e) => setPrimaryUser({ ...primaryUser, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={primaryUser.confirmPassword}
                  onChange={(e) => setPrimaryUser({ ...primaryUser, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={partnerUser.displayName}
                  onChange={(e) => setPartnerUser({ ...partnerUser, displayName: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Partner's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={partnerUser.username}
                  onChange={(e) => setPartnerUser({ ...partnerUser, username: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={partnerUser.password}
                  onChange={(e) => setPartnerUser({ ...partnerUser, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={partnerUser.confirmPassword}
                  onChange={(e) => setPartnerUser({ ...partnerUser, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {step === 1 ? 'Next' : 'Create Accounts'}
            </button>
          </div>

          {step === 1 && (
            <div className="text-center">
              <button
                onClick={onCancel}
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                Cancel Setup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;