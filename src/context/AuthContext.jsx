import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { dummyData } from "../data/dummyData";

const AuthContext = createContext(null);

/**
 * AuthProvider
 * 
 * Replaces the previous ViewModeProvider with a production-ready authentication architecture.
 * While we still use dummy data for now, this context is structured to handle real JWT/Session
 * auth in the future.
 */
export function AuthProvider({ children }) {
  // In a real app, we would check localStorage/cookies for a token here.
  const [user, setUser] = useState({
    ...dummyData.student,
    role: "student", // Default role
    isAuthenticated: true,
  });

  const login = async (role) => {
    // Mock login logic
    const mockUser = {
      ...dummyData.student,
      role: role,
      isAuthenticated: true,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      role: user?.role,
      isParent: user?.role === "parent",
      isStudent: user?.role === "student",
      login,
      logout,
      // Compatibility helper to minimize breaking changes during refactor
      viewMode: user?.role === "parent" ? "parent" : "student",
      setViewMode: (mode) => login(mode), 
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
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
