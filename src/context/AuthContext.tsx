'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'employer';
  }

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      try {
        const decoded = jwt.decode(stored) as AuthUser;
        setToken(stored);
        setUser(decoded);
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (newToken: string) => {
    const decoded = jwt.decode(newToken) as AuthUser;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
