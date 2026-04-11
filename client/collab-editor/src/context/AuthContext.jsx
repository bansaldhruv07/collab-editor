import { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };
  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };
  const updateUser = (updatedData) => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const newUser = { ...currentUser, ...updatedData };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
