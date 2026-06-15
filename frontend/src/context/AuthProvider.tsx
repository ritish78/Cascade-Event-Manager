import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../types/user.types";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //   console.log("User:", { user });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.post("/auth/refresh");
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    setUser(response.data.user);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  const register = async (fullName: string, email: string, password: string, confirmPassword: string) => {
    await api.post("/auth/register", { fullName, email, password, confirmPassword });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
