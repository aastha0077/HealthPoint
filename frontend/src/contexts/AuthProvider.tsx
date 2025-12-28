import { apiClient } from "@/apis/apis";
import type { SignupType } from "@/types/user";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";

interface AuthContextType {
  token: string | null;
  handleLogin: (email: string, password: string) => Promise<LoginResponse>;
  handleSignup: (user: SignupType) => Promise<SignupResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

interface ApiResponse {
  status?: number;
  message: string;
}

type LoginResponse = ApiResponse;
type SignupResponse = ApiResponse;


const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const token = localStorage.getItem("token");
  const [loading, setIsLoading] = useState<boolean>(true)

  useState(() => {
    if (token) {
      setIsAuthenticated(true)
      setIsLoading(false)
    }
  })

  async function handleLogin(email: string, password: string): Promise<LoginResponse> {
    let response;


    response = await apiClient.post(
      "/api/auth/login",
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response:", response)
    setIsAuthenticated(true)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true)
    }
    return {
      status: response.status,
      message: response.data.message
    }

  }
  async function handleSignup(
    user: SignupType
  ): Promise<SignupResponse> {
    const formValues = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      district: user.district,
      municipality: user.municipality,
      wardNo: user.wardNo,
      contactNumber: user.contactNumber,
      password: user.password,
    };
    const res = await apiClient.post("/api/auth/signup", formValues);
    return {
      status: res.status,
      message: res.data.message
    }

  }

  function logout() {
    localStorage.removeItem("token");
    setIsAuthenticated(true)
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ token, handleLogin, handleSignup, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
function useAuth() {
  const context: AuthContextType | null = useContext(AuthContext);
  return context;
}

export { useAuth, AuthProvider };
