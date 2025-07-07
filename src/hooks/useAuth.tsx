import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Admin, authManager, User } from "@/lib/auth";
import { apiClient, LoginRequest } from "@/lib/api";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | Admin | null;
  token: string | null;
  role: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginRequest
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | Admin | null>(null);
  const [token, setToken] = useState<string | null>(
    Cookies.get("session_token") || null
  );
  const [role, setRole] = useState<string | null>(
    localStorage.getItem("role") || null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = role === "ADMIN";

  useEffect(() => {
    try {
      const currentUser = authManager.getUser();
      const authenticated = authManager.isAuthenticated();

      setUser(currentUser);
      setIsAuthenticated(authenticated);
      setToken(Cookies.get("session_token") || null);
      setRole(localStorage.getItem("role") || null);
      setIsLoading(false);

      if (authenticated) {
        const timeout = setTimeout(() => {
          logout();
        }, SESSION_TIMEOUT_MS);

        return () => clearTimeout(timeout);
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      setIsLoading(false);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        const updatedUser = authManager.getUser();
        const updatedAuth = authManager.isAuthenticated();
        setUser(updatedUser);
        setIsAuthenticated(updatedAuth);
        setToken(Cookies.get("session_token") || null);
        setRole(localStorage.getItem("role") || null);
        console.log("Auth state changed:", {
          user: updatedUser,
          authenticated: updatedAuth,
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      authManager.destroy();
    };
  }, []);

  const login = async (
    credentials: LoginRequest
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      const response = await apiClient.login(credentials);

      if (response.success && response.token) {
        authManager.login(credentials.username, response.token);

        const newUser = authManager.getUser();
        const authenticated = authManager.isAuthenticated();
        const userRole = newUser?.role || "USER";

        setUser(newUser);
        setIsAuthenticated(authenticated);
        setToken(response.token);
        setRole(userRole);

        Cookies.set("session_token", response.token, { expires: 0.0208 });
        localStorage.setItem("role", userRole);

        console.log("Login successful:", { user: newUser, authenticated });
        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || "Invalid credentials",
        };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Login failed unexpectedly",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authManager.logout();
    apiClient.logout();
    Cookies.remove("session_token");
    localStorage.removeItem("role");
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    console.log("Logout successful");
    window.location.href = "/login";
  };

  const refreshSession = () => {
    authManager.refreshSession();
    Cookies.set("session_token", token || "", { expires: 0.0208 });
  };

  const value: AuthContextType = {
    user,
    token,
    role,
    isAdmin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
