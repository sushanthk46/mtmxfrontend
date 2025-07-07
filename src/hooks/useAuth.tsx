import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Admin, authManager, User } from "@/lib/auth";
import { apiClient, LoginRequest } from "@/lib/api";

interface AuthContextType {
  user: User | Admin;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginRequest,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize auth state with error handling
    try {
      const currentUser = authManager.getUser();
      const authenticated = authManager.isAuthenticated();

      setUser(currentUser);
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      console.log("Auth initialized:", { user: currentUser, authenticated });
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      setIsLoading(false);
    }

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        const newUser = authManager.getUser();
        const newAuthenticated = authManager.isAuthenticated();
        setUser(newUser);
        setIsAuthenticated(newAuthenticated);
        console.log("Auth state changed:", {
          user: newUser,
          authenticated: newAuthenticated,
        });
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      authManager.destroy();
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);

    try {
      const response = await apiClient.login(credentials);

      if (response.success && response.token) {
        authManager.login(credentials.username, response.token);
        const newUser = authManager.getUser();
        const authenticated = authManager.isAuthenticated();

        setUser(newUser);
        setIsAuthenticated(authenticated);

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
        message: error instanceof Error ? error.message : "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authManager.logout();
    apiClient.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log("Logout successful");
  };

  const refreshSession = () => {
    authManager.refreshSession();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth called outside of AuthProvider context");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
