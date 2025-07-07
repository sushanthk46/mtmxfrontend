import AdminLayout from "@/pages/AdminLayout";
import { configManager } from "./config";

export interface User {
  username: string;
  token: string;
  loginTime: number;
}

export interface Admin {
  username: string;
  token: string;
  loginTime: number;
}

class AuthManager {
  private user: User | Admin = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private activityListeners: (() => void)[] = [];
  private lastActivityTime: number = Date.now();

  constructor() {
    this.loadSession();
    this.startSessionCheck();
    this.setupActivityTracking();
  }

  private loadSession(): void {
    try {
      const token = localStorage.getItem("auth_token");
      const username = localStorage.getItem("auth_username");
      const loginTime = localStorage.getItem("auth_login_time");
      const lastActivity = localStorage.getItem("auth_last_activity");

      if (token && username && loginTime) {
        const loginTimeMs = parseInt(loginTime, 10);
        const lastActivityMs = lastActivity
          ? parseInt(lastActivity, 10)
          : loginTimeMs;
        const now = Date.now();
        const sessionTimeout = configManager.get().sessionTimeout;
        const timeSinceActivity = now - lastActivityMs;

        console.log("Loading session:", {
          username,
          loginTime: new Date(loginTimeMs).toISOString(),
          lastActivity: new Date(lastActivityMs).toISOString(),
          timeSinceActivity: Math.round(timeSinceActivity / 1000),
          sessionTimeoutSeconds: Math.round(sessionTimeout / 1000),
          isValid: timeSinceActivity < sessionTimeout,
        });

        if (timeSinceActivity < sessionTimeout) {
          this.user = {
            username,
            token,
            loginTime: loginTimeMs,
          };
          this.lastActivityTime = lastActivityMs;
        } else {
          console.log("Session expired, clearing");
          this.clearSession();
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      this.clearSession();
    }
  }

  private setupActivityTracking(): void {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const updateActivity = () => {
      this.lastActivityTime = Date.now();
      if (this.user) {
        // Update session in localStorage to reflect latest activity
        localStorage.setItem(
          "auth_last_activity",
          this.lastActivityTime.toString(),
        );
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Store cleanup function
    this.activityListeners.push(() => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
    });
  }

  private startSessionCheck(): void {
    this.sessionCheckInterval = setInterval(() => {
      if (this.user) {
        const now = Date.now();
        const sessionTimeout = configManager.get().sessionTimeout;
        const timeSinceActivity = now - this.lastActivityTime;

        console.log("Session check:", {
          timeSinceActivity: Math.round(timeSinceActivity / 1000),
          sessionTimeoutSeconds: Math.round(sessionTimeout / 1000),
          willExpire: timeSinceActivity >= sessionTimeout,
        });

        if (timeSinceActivity >= sessionTimeout) {
          console.log("Session expired due to inactivity");
          this.logout();
          window.location.href = "/login";
        }
      }
    }, 60000); // Check every minute
  }

  login(username: string, token: string): void {
    const loginTime = Date.now();
    this.lastActivityTime = loginTime;

    this.user = {
      username,
      token,
      loginTime,
    };

    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_username", username);
    localStorage.setItem("auth_login_time", loginTime.toString());
    localStorage.setItem(
      "auth_last_activity",
      this.lastActivityTime.toString(),
    );

    console.log("User logged in:", {
      username,
      loginTime: new Date(loginTime).toISOString(),
    });
  }

  logout(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }

    // Clean up activity listeners
    this.activityListeners.forEach((cleanup) => cleanup());
    this.activityListeners = [];

    this.clearSession();
  }

  private clearSession(): void {
    this.user = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_login_time");
    localStorage.removeItem("auth_last_activity");
  }

  isAuthenticated(): boolean {
    if (!this.user) return false;

    // Double-check session validity
    const now = Date.now();
    const sessionTimeout = configManager.get().sessionTimeout;
    const timeSinceActivity = now - this.lastActivityTime;

    if (timeSinceActivity >= sessionTimeout) {
      console.log("Session expired during auth check");
      this.logout();
      return false;
    }

    return true;
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.user?.token || null;
  }

  refreshSession(): void {
    if (this.user) {
      this.lastActivityTime = Date.now();
      localStorage.setItem(
        "auth_last_activity",
        this.lastActivityTime.toString(),
      );
    }
  }

  getSessionTimeRemaining(): number {
    if (!this.user) return 0;

    const now = Date.now();
    const sessionTimeout = configManager.get().sessionTimeout;
    const timeSinceActivity = now - this.lastActivityTime;

    return Math.max(0, sessionTimeout - timeSinceActivity);
  }

  destroy(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Clean up activity listeners
    this.activityListeners.forEach((cleanup) => cleanup());
    this.activityListeners = [];
  }
}

export const authManager = new AuthManager();
