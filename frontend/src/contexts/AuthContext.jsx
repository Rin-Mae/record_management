import { createContext, useContext, useState, useEffect, useRef } from "react";
import AuthServices from "../services/AuthServices.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authChecked = useRef(false);

  useEffect(() => {
    if (!authChecked.current) {
      authChecked.current = true;
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const payload = await AuthServices.getUser();
      const normalized = payload?.user
        ? {
            ...payload.user,
            roles: payload?.roles,
            permissions: payload?.permissions,
            account_status: payload?.account_status,
          }
        : null;
      setUser(normalized);
      try {
        if (typeof window !== "undefined") window.__appUser = normalized;
      } catch (e) {}
    } catch (err) {
      // User not authenticated - this is ok, they may be on a public page
      // Only log non-401 errors
      if (err?.response?.status !== 401) {
        console.error("Auth check error:", err?.response?.status);
      }
      setUser(null);
      try {
        if (typeof window !== "undefined") window.__appUser = null;
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const loginResponse = await AuthServices.login(credentials);
    const payload = await AuthServices.getUser();
    const normalized = payload?.user
      ? {
          ...payload.user,
          roles: payload?.roles,
          permissions: payload?.permissions,
          account_status:
            loginResponse?.account_status ?? payload?.account_status,
          message: loginResponse?.message,
          status: loginResponse?.status,
        }
      : null;
    setUser(normalized);
    try {
      if (typeof window !== "undefined") window.__appUser = normalized;
    } catch (e) {}
    return normalized;
  };

  const logout = async () => {
    const response = await AuthServices.logout();
    setUser(null);
    try {
      if (typeof window !== "undefined") window.__appUser = null;
    } catch (e) {}
    return response;
  };

  const register = async (userData) => {
    const response = await AuthServices.register(userData);
    return response;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
