import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'primary' | 'partner';
}

interface UserCredentials {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: 'primary' | 'partner';
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simple hash function (same as in LoginForm)
  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  // Check for existing session on mount
  useEffect(() => {
    const sessionUser = localStorage.getItem('current_user');
    if (sessionUser) {
      try {
        const user = JSON.parse(sessionUser);
        setCurrentUser(user);
      } catch (error) {
        localStorage.removeItem('current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userId: string, displayName: string) => {
    const users = getStoredUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      const sessionUser: User = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      };
      
      setCurrentUser(sessionUser);
      localStorage.setItem('current_user', JSON.stringify(sessionUser));
    }
    return password.length >= 6; // Simplified for easier setup
  };

  const updateProfile = (updates: {
    displayName?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    if (!currentUser) return false;

    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) return false;

    // Enhanced password validation
    const validatePassword = (password: string): boolean => {
      return password.length >= 8 &&
             /[A-Z]/.test(password) &&
             /[a-z]/.test(password) &&
             /\d/.test(password) &&
             /[!@#$%^&*(),.?":{}|<>]/.test(password);
    };
    // Verify current password if changing password
    if (updates.newPassword && updates.currentPassword) {
      const currentPasswordHash = simpleHash(updates.currentPassword);
      if (users[userIndex].passwordHash !== currentPasswordHash) {
        throw new Error('Current password is incorrect');
      }
      
      // Simplified password validation for profile updates
      if (updates.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
    }

    // Update user data
    const updatedUser = { ...users[userIndex] };
    
    if (updates.displayName) {
      updatedUser.displayName = updates.displayName;
    }
    
    if (updates.newPassword) {
      updatedUser.passwordHash = simpleHash(updates.newPassword);
    }

    users[userIndex] = updatedUser;
    localStorage.setItem('app_users', JSON.stringify(users));

    // Update current session
    const updatedSessionUser: User = {
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      role: updatedUser.role
    };
    
    setCurrentUser(updatedSessionUser);
    localStorage.setItem('current_user', JSON.stringify(updatedSessionUser));
    
    return true;
  };

  const getStoredUsers = (): UserCredentials[] => {
    const stored = localStorage.getItem('app_users');
    return stored ? JSON.parse(stored) : [];
  };

  const getPartnerUser = (): User | null => {
    if (!currentUser) return null;
    
    const users = getStoredUsers();
    const partner = users.find(u => u.id !== currentUser.id);
    
    if (partner) {
      return {
        id: partner.id,
        username: partner.username,
        displayName: partner.displayName,
        role: partner.role
      };
    }
    
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('current_user');
  };

  return {
    currentUser,
    isLoading,
    login,
    logout,
    logout,
    updateProfile,
    getPartnerUser
  };
};