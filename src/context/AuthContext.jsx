import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { ROLES } from "../auth/roles";
import { loginUser } from "../services/authService";

const AuthContext = createContext(null);

const STORAGE_KEY = "edudash_auth_state";

/**
 * AuthProvider
 * 
 * Scalable frontend authentication architecture.
 * Manages user state, roles, and simulated authentication flow.
 */
export function AuthProvider({ children }) {
  // Initialize state from localStorage or defaults
  const [authState, setAuthState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    
    return {
      user: null,
      isAuthenticated: false,
    };
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = useCallback(async (role, customUsername) => {
    
    // Determine which user to log in as based on role
    // For demo, we use a default username if none provided
    const username = customUsername || role.toLowerCase();
    
    try {
      const authenticatedUser = await loginUser(username, role);
      
      setAuthState({
        user: authenticatedUser,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Authentication failed:", error);
      // In a real app, handle UI error state
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
  }, []);

  const value = useMemo(
    () => ({
      user: authState.user,
      role: authState.user?.role,
      isAuthenticated: authState.isAuthenticated,
      isStudent: authState.user?.role === ROLES.STUDENT,
      isParent: authState.user?.role === ROLES.PARENT,
      isTeacher: authState.user?.role === ROLES.TEACHER,
      isAdmin: authState.user?.role === ROLES.ADMIN,
      login,
      logout,
    }),
    [authState.user, authState.isAuthenticated, login, logout]
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
