'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'employer';
  resumeUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      setIsReady(true);
      return;
    }

    setToken(stored);

    const fetchUserFromDB = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${stored}` },
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('[AuthContext] Failed to load user from DB:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsReady(true); // ✅ Always set this
      }
    };

    fetchUserFromDB();
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsReady(false); // force guard to wait
  
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
  
      if (!res.ok) throw new Error('Failed to fetch user');
  
      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      console.error('[login] failed to load user:', err);
      setUser(null);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsReady(true); 
    }
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('[refreshUser] failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isReady, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
