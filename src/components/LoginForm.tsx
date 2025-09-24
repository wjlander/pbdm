import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');

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

  // Check for account lockout
  const checkLockout = (): boolean => {
    const lockoutData = localStorage.getItem('account_lockout');
    if (lockoutData) {
      const { attempts, timestamp } = JSON.parse(lockoutData);
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      
      if (attempts >= 5 && Date.now() - timestamp < lockoutDuration) {
        const unlockTime = new Date(timestamp + lockoutDuration);
        setLockoutTime(unlockTime);
        setIsLocked(true);
        return true;
      } else if (Date.now() - timestamp >= lockoutDuration) {
        localStorage.removeItem('account_lockout');
        setLoginAttempts(0);
        setIsLocked(false);
        setLockoutTime(null);
      }
    }
    return false;
  };

  // Record failed login attempt
  const recordFailedAttempt = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      localStorage.setItem('account_lockout', JSON.stringify({
        attempts: newAttempts,
        timestamp: Date.now()
      }));
      setIsLocked(true);
      setLockoutTime(new Date(Date.now() + 15 * 60 * 1000));
    } else {
      localStorage.setItem('login_attempts', newAttempts.toString());
    }
  };

  // Generate 2FA code (in production, this would be sent via SMS/email)
  const generate2FACode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Simulate 2FA verification
  const verify2FA = (code: string): boolean => {
    const stored2FA = sessionStorage.getItem('temp_2fa_code');
    return code === stored2FA;
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
    
    if (checkLockout()) {
      setError(`Account locked. Try again after ${lockoutTime?.toLocaleTimeString()}`);
      return;
    }
    
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
        // Clear failed attempts on successful login
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('account_lockout');
        setLoginAttempts(0);
        
        // Check if 2FA is enabled for this user
        const user2FA = localStorage.getItem(`2fa_${user.id}`);
        if (user2FA) {
          const code = generate2FACode();
          sessionStorage.setItem('temp_2fa_code', code);
          sessionStorage.setItem('temp_user_id', user.id);
          sessionStorage.setItem('temp_user_name', user.displayName);
          
          // In production, send code via SMS/email
          console.log('2FA Code:', code); // For demo purposes
          alert(`Your 2FA code is: ${code}`); // For demo purposes
          
          setShowTwoFA(true);
          setIsLoading(false);
          return;
        }
        
        onLogin(user.id, user.displayName);
      } else {
        recordFailedAttempt();
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (verify2FA(twoFACode)) {
        const userId = sessionStorage.getItem('temp_user_id');
        const userName = sessionStorage.getItem('temp_user_name');
        
        if (userId && userName) {
          // Clear temporary session data
          sessionStorage.removeItem('temp_2fa_code');
          sessionStorage.removeItem('temp_user_id');
          sessionStorage.removeItem('temp_user_name');
          
          onLogin(userId, userName);
        }
      } else {
        setError('Invalid 2FA code. Please try again.');
        setTwoFACode('');
      }
    } catch (err) {
      setError('2FA verification failed. Please try again.');
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

  // Check lockout status on component mount
  React.useEffect(() => {
    checkLockout();
    const attempts = localStorage.getItem('login_attempts');
    if (attempts) {
      setLoginAttempts(parseInt(attempts));
    }
  }, []);

  if (needsSetup || showSetup) {
    return <UserSetup onSetupComplete={handleSetupUsers} onCancel={() => setShowSetup(false)} />;
  }

  // 2FA verification screen
  if (showTwoFA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-green-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Two-Factor Authentication</h1>
            <p className="text-slate-600">Enter the 6-digit code sent to your device</p>
          </div>

          <form onSubmit={handle2FASubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || twoFACode.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setShowTwoFA(false);
                setTwoFACode('');
                setError('');
              }}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
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

        {/* Security Status Indicators */}
        <div className="mb-6 space-y-2">
          {isLocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">
                Account locked until {lockoutTime?.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-600">
                {5 - loginAttempts} login attempts remaining
              </span>
            </div>
          )}
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
            disabled={isLoading || !username || !password || isLocked}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              isLocked ? 'Account Locked' : 'Sign In'
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
    displayName: '',
    enable2FA: false
  });
  const [partnerUser, setPartnerUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    enable2FA: false
  });
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });

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

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    if (score < 3) feedback = 'Weak';
    else if (score < 5) feedback = 'Medium';
    else feedback = 'Strong';
    
    setPasswordStrength({ score, feedback });
  };

  const validateStep1 = () => {
    if (!primaryUser.username || !primaryUser.password || !primaryUser.displayName) {
      setError('All fields are required');
      return false;
    }
    
    const passwordValidation = validatePassword(primaryUser.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return false;
    }
    
    if (primaryUser.password !== primaryUser.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!partnerUser.username || !partnerUser.password || !partnerUser.displayName) {
      setError('All fields are required');
      return false;
    }
    
    const passwordValidation = validatePassword(partnerUser.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return false;
    }
    
    if (partnerUser.password !== partnerUser.confirmPassword) {
      setError('Passwords do not match');
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
                  required
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
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={primaryUser.password}
                  onChange={(e) => {
                    setPrimaryUser({ ...primaryUser, password: e.target.value });
                    calculatePasswordStrength(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a password"
                  required
                />
                {primaryUser.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score < 3 ? 'bg-red-500' :
                            passwordStrength.score < 5 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score < 3 ? 'text-red-600' :
                        passwordStrength.score < 5 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.feedback}
                      </span>
                    </div>
                  </div>
                )}
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
                  required
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
                  required
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
                  required
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
                  required
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
                  required
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