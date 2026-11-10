import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.ts';

export interface UserProfile {
  full_name?: string;
  avatar_url?: string;
  college_name?: string;
  department?: string;
  academic_year?: string;
  organization?: string;
  designation?: string;
  bio?: string;
  skills?: string[];
  coins_balance?: number;
}

export interface User {
  id: number;
  email: string;
  role: 'STUDENT' | 'JUDGE' | 'ADMIN';
  status: string;
  profile?: UserProfile | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickSwitch: (role: 'STUDENT' | 'JUDGE' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pitcharena_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('pitcharena_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    if (!localStorage.getItem('pitcharena_token')) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('pitcharena_user', JSON.stringify(res.user));
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthChange = () => {
      fetchCurrentUser();
    };

    window.addEventListener('auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthChange);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const res = await api.post('/api/auth/login', { email, password });
    setIsLoading(false);

    if (res.success && res.accessToken && res.user) {
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('pitcharena_token', res.accessToken);
      localStorage.setItem('pitcharena_user', JSON.stringify(res.user));
      return { success: true };
    }

    return { success: false, error: res.error || 'Login failed.' };
  };

  const register = async (data: any): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const res = await api.post('/api/auth/register', data);
    setIsLoading(false);

    if (res.success && res.accessToken && res.user) {
      setToken(res.accessToken);
      setUser(res.user);
      localStorage.setItem('pitcharena_token', res.accessToken);
      localStorage.setItem('pitcharena_user', JSON.stringify(res.user));
      return { success: true };
    }

    return { success: false, error: res.error || 'Registration failed.' };
  };

  const logout = () => {
    localStorage.removeItem('pitcharena_token');
    localStorage.removeItem('pitcharena_user');
    setUser(null);
    setToken(null);
  };

  const quickSwitch = async (role: 'STUDENT' | 'JUDGE' | 'ADMIN') => {
    let email = 'founder@pitcharena.dev';
    if (role === 'JUDGE') email = 'judge@pitcharena.dev';
    if (role === 'ADMIN') email = 'admin@pitcharena.dev';
    await login(email, 'password123');
  };

  const refreshUser = async () => {
    const res = await api.get('/api/auth/me');
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('pitcharena_user', JSON.stringify(res.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickSwitch,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
