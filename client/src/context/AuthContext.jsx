import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("library_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem("library_user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("library_token"));
  const [user, setUser] = useState(readStoredUser);
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(token));

  const setSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem("library_token", nextToken);
    localStorage.setItem("library_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("library_token");
    localStorage.removeItem("library_user");
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const refreshUser = async () => {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");

        if (isMounted) {
          localStorage.setItem("library_user", JSON.stringify(data.user));
          setUser(data.user);
        }
      } catch {
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    refreshUser();

    return () => {
      isMounted = false;
    };
  }, [logout, token]);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post("/auth/login", credentials);
      setSession(data.token, data.user);
      return data.user;
    },
    [setSession]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/auth/register", payload);
      setSession(data.token, data.user);
      return data.user;
    },
    [setSession]
  );

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      isBootstrapping,
      login,
      logout,
      register,
      token,
      user
    }),
    [isBootstrapping, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
