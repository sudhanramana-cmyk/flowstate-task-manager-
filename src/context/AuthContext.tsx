import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, EnergyLevel } from '../types/index.ts';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; workingToward?: string; productivityStyle?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateEnergyLevel: (level: EnergyLevel) => Promise<void>;
  updatePreferences: (prefs: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const stored = getStoredToken();
      if (!stored) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      removeStoredToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; password: string; workingToward?: string; productivityStyle?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin();
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      removeStoredToken();
      setToken(null);
      setUser(null);
    }
  };

  const updateEnergyLevel = async (level: EnergyLevel) => {
    if (!user) return;
    setUser({ ...user, energyLevel: level });
    try {
      const res = await api.updatePreferences({ energyLevel: level });
      setUser(res.user);
    } catch (err) {
      console.error('Failed to persist energy level:', err);
    }
  };

  const updatePreferences = async (prefs: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...prefs });
    try {
      const res = await api.updatePreferences(prefs);
      setUser(res.user);
    } catch (err) {
      console.error('Failed to update preferences:', err);
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
        demoLogin,
        logout,
        updateEnergyLevel,
        updatePreferences,
        refreshUser,
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
