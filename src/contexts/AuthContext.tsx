'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, authToken?: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cureconnect_user');
      const savedToken = localStorage.getItem('cureconnect_token');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (error) {
          console.error('Error parsing saved user:', error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User, authToken?: string) => {
    setUser(userData);
    if (authToken) {
      setToken(authToken);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('cureconnect_user', JSON.stringify(userData));
      if (authToken) {
        localStorage.setItem('cureconnect_token', authToken);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cureconnect_user');
      localStorage.removeItem('cureconnect_token');
    }
    router.push('/login');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cureconnect_user', JSON.stringify(updatedUser));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
