import { apiClient } from "@/apis/apis";
import type { SignupType } from "@/types/user";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserInfo {
  id: number;
  email: string;
  role: string; // "USER" | "DOCTOR" | "ADMIN"
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
}

interface AuthContextType {
  token: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  role: string | null;
  handleLogin: (email: string, password: string) => Promise<LoginResponse>;
  handleSignup: (user: SignupType) => Promise<SignupResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  setAuthData: (token: string, refreshToken: string, user: UserInfo) => void;
}

interface ApiResponse {
  status?: number;
  message: string;
}
interface LoginResponse extends ApiResponse {
  user?: UserInfo;
}
type SignupResponse = ApiResponse;

const AuthContext = createContext<AuthContextType | null>(null);

/** Decode a JWT payload without verifying signature (client-side only) */
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

/** Read auth state synchronously from localStorage on every mount/refresh */
function getInitialState(): { token: string | null; refreshToken: string | null; user: UserInfo | null } {
  try {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (!token && !refreshToken) return { token: null, refreshToken: null, user: null };

    let user: UserInfo | null = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    // If we have a token but no user object, try to decode it as a fallback
    if (token && !user) {
      const decoded = decodeJwt(token);
      if (decoded) {
        user = {
          id: decoded.id ?? 0,
          email: decoded.email ?? "",
          role: decoded.role ?? "USER",
          firstName: decoded.firstName ?? "User",
          lastName: decoded.lastName ?? "",
        };
      }
    }

    return { token, refreshToken, user };
  } catch (err) {
    console.warn("Auth initialization warning:", err);
    return { token: null, refreshToken: null, user: null };
  }
}

function AuthProvider({ children }: { children: ReactNode }) {
  const initial = getInitialState();

  const [token, setToken] = useState<string | null>(initial.token);
  const [refreshToken, setRefreshToken] = useState<string | null>(initial.refreshToken);
  const [user, setUser] = useState<UserInfo | null>(initial.user);
  const [loading, setLoading] = useState(false);

  // isAuthenticated is truthy if both token AND user are present
  const isAuthenticated = !!token && !!user;
  const role = user?.role ?? null;


  const setAuthData = (newToken: string, newRefreshToken: string, userData: UserInfo) => {
    // 1. Synchronous LocalStorage Save
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // 2. Update React State (triggers re-render)
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
  };

  // Synchronize state across tabs and with API interceptor updates
  useEffect(() => {
    const handleStorageChange = () => {
      const state = getInitialState();
      setToken(state.token);
      setRefreshToken(state.refreshToken);
      setUser(state.user);
    };

    window.addEventListener("storage", handleStorageChange);
    // Custom event for same-window updates (like from apis.tsx)
    window.addEventListener("auth-sync", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-sync", handleStorageChange);
    };
  }, []);

  async function handleLogin(email: string, password: string): Promise<LoginResponse> {
    setLoading(true);
    try {
      const response = await apiClient.post(
        "/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token: newToken, refreshToken: newRefreshToken, user: userData } = response.data;
      if (newToken && newRefreshToken && userData) {
        setAuthData(newToken, newRefreshToken, userData);
      }
      return { status: response.status, message: response.data.message, user: userData };
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(signupData: SignupType): Promise<SignupResponse> {
    const res = await apiClient.post("/api/auth/signup", {
      email: signupData.email,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      password: signupData.password,
      profilePicture: signupData.profilePicture,
    });
    return { status: res.status, message: res.data.message };
  }

  function logout() {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ token, refreshToken, user, role, handleLogin, handleSignup, logout, isAuthenticated, loading, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { useAuth, AuthProvider };
