import React, { createContext, useEffect, useState, useCallback } from "react";
import type { UserResponseDto } from "../types";
import { authApi } from "../api/auth.api";
import { setToken, removeToken, getToken } from "../utils/token";

interface AuthContextType {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = async (token: string) => {
    setIsLoading(true);
    setToken(token);
    await fetchUser();
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const isAdmin = user?.roles?.includes("Admin") ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
