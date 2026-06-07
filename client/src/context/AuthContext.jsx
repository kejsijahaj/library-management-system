import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("library_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("library_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((nextToken, nextUser) => {
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

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      login,
      logout,
      token,
      user
    }),
    [login, logout, token, user]
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
