"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const VALID_EMAIL = "rapli@nestra.id";
const VALID_PASSWORD = "nestraweb";
const AUTH_KEY = "nestra_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.email === VALID_EMAIL) {
          setIsAuthenticated(true);
          setUserEmail(data.email);
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      setUserEmail(email);
      localStorage.setItem(AUTH_KEY, JSON.stringify({ email }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    localStorage.removeItem(AUTH_KEY);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Memuat...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Redirecting...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
