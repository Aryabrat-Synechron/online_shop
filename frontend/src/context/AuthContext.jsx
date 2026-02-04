import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("email");
    return email ? { email } : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser({ email });
    localStorage.setItem("email", email);
    return res;
  };

  const register = async (email, password) => {
    return await api.register(email, password);
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("email");
  };

  const value = useMemo(() => ({ token, user, login, logout, register }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);