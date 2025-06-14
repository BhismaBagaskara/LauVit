// src/lib/authContext.tsx
"use client";

import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APP_NAME } from './constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  signup: (email?: string, password?: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking auth status
    const storedUser = localStorage.getItem(`${APP_NAME}_user`);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);


  const login = async (email?: string, password?: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser: User = { id: 'mock-user-id', email: email || 'user@example.com', name: 'Mock User' };
    setUser(mockUser);
    localStorage.setItem(`${APP_NAME}_user`, JSON.stringify(mockUser));
    setLoading(false);
    router.push('/dashboard');
  };

  const signup = async (email?: string, password?: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser: User = { id: 'mock-new-user-id', email: email || 'newuser@example.com', name: 'New User' };
    setUser(mockUser);
    localStorage.setItem(`${APP_NAME}_user`, JSON.stringify(mockUser));
    setLoading(false);
    router.push('/dashboard');
  };
  
  const googleSignIn = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser: User = { id: 'mock-google-user-id', email: 'googleuser@example.com', name: 'Google User' };
    setUser(mockUser);
    localStorage.setItem(`${APP_NAME}_user`, JSON.stringify(mockUser));
    setLoading(false);
    router.push('/dashboard');
  };

  const logout = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem(`${APP_NAME}_user`);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleSignIn, logout }}>
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
