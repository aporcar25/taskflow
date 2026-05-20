"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  _id: string;
  id?: string;
  nombre: string;
  email: string;
  foto?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    const userJson = localStorage.getItem("taskflow_user");
    if (userJson) {
      try {
        setUser(JSON.parse(userJson));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    const handleUserUpdate = () => {
      loadUser();
    };

    window.addEventListener("taskflow-user-updated", handleUserUpdate);
    return () => window.removeEventListener("taskflow-user-updated", handleUserUpdate);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
