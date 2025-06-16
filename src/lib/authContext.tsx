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
  saveUserData: (userId: string, data: any) => Promise<void>;
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
    const mockUserId = 'mock-user-id'; // Replace with actual user ID from backend
    const mockUser: User = { id: mockUserId, email: email || 'user@example.com', name: 'Mock User' };
    setUser(mockUser);
    localStorage.setItem(`${APP_NAME}_user`, JSON.stringify(mockUser));

    // Simulate saving user data after login
    const initialUserData = { preferences: { theme: 'dark' } }; // Example initial data
 await saveUserData(mockUserId, initialUserData);

    setLoading(false);
    router.push('/dashboard');
  };

  const signup = async (email?: string, password?: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockNewUserId = 'mock-new-user-id'; // Replace with actual user ID from backend
    const mockUser: User = { id: mockNewUserId, email: email || 'newuser@example.com', name: 'New User' };
    setUser(mockUser);
    localStorage.setItem(`${APP_NAME}_user`, JSON.stringify(mockUser));

    // Simulate saving user data after signup
    const initialUserData = { preferences: { theme: 'light' } }; // Example initial data
 await saveUserData(mockNewUserId, initialUserData);

    setLoading(false);
    router.push('/dashboard');
  };
  
  const googleSignIn = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockGoogleUserId = 'mock-google-user-id'; // Replace with actual user ID from backend
    const mockUser: User = { id: mockGoogleUserId, email: 'googleuser@example.com', name: 'Google User' };
    setUser(mockUser);
    localStorage.setItem(`${APP_NAME}_user`, JSON.stringify(mockUser));

    // Simulate saving user data after Google sign-in
    const initialUserData = { preferences: { theme: 'system' } }; // Example initial data
 await saveUserData(mockGoogleUserId, initialUserData);

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

  const saveUserData = async (userId: string, data: any) => {
    console.log(`Simulating saving user data for user ID: ${userId}`, data);
    // In a real application, you would make an API call here to save data to your backend
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleSignIn, saveUserData, logout }}>
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
