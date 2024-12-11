import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const response = await api.auth.me();
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem("auth_token");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.auth.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem("auth_token", token);
      setUser(user);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to sign in");
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await api.auth.register({ name, email, password });
      const { token, user } = response.data;
      localStorage.setItem("auth_token", token);
      setUser(user);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to sign up");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await api.auth.logout();
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
