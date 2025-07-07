import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeftRight,
  Loader2,
  AlertCircle,
  Building2,
  Shield,
  Zap,
  Globe,
  Lock,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const data= {
      username:username.trim(),
      password:password.trim()
    };

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    try {
      const result = axios.post("localhost:8080/api/auth/login", data);

      if (result) {
        navigate("/dashboard/mt-to-mx", { replace: true });
      } else {
        setError((await result).data || "Invalid credentials");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-800 via-gray-700 to-slate-600 flex items-center justify-center overflow-hidden">
      {/* Full Screen Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-white rounded-full animate-pulse delay-150"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 border border-white rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 border border-white rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-white rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-10 left-10 text-blue-400/20">
        <Building2 className="h-16 w-16" />
      </div>
      <div className="absolute top-20 right-16 text-blue-400/20">
        <Shield className="h-12 w-12" />
      </div>
      <div className="absolute bottom-16 left-16 text-blue-400/20">
        <Globe className="h-14 w-14" />
      </div>
      <div className="absolute bottom-20 right-10 text-blue-400/20">
        <Zap className="h-10 w-10" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Brand Section */}
          <div className="text-center lg:text-left space-y-6 text-white">
            <div className="space-y-4">
              <div className="flex justify-center lg:justify-start">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-sm flex items-center justify-center shadow-xl">
                  <ArrowLeftRight className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                FinTech Converter
              </h1>
              <p className="text-xl text-white leading-relaxed font-medium">
                Enterprise Financial Messaging Platform
              </p>
              <p className="text-lg text-gray-200 font-normal">
                Transform MT and MX messages with precision and security
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="hidden lg:flex flex-col space-y-4 mt-8">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-400/30">
                  <Shield className="h-4 w-4 text-blue-300" />
                </div>
                <span className="text-white font-medium">
                  Bank-Grade Security
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-400/30">
                  <Zap className="h-4 w-4 text-blue-300" />
                </div>
                <span className="text-white font-medium">
                  Lightning Fast Processing
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border border-blue-400/30">
                  <Globe className="h-4 w-4 text-blue-300" />
                </div>
                <span className="text-white font-medium">
                  Global Compliance
                </span>
              </div>
            </div>
          </div>

          {/* Login Form Section */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md animate-fade-in">
              {/* Login Card */}
              <Card className="enterprise-shadow bg-white backdrop-blur-lg border-gray-200/30 shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-2xl text-foreground">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Sign in to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive" className="animate-fade-in">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        autoComplete="username"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        autoComplete="current-password"
                      />
                    </div>

                    <Button
                      type="submit"
                      className={cn(
                        "w-full h-11 font-medium transition-all duration-200",
                        "bg-primary hover:bg-primary/90 text-primary-foreground",
                        "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                      )}
                      disabled={isLoading}
                       onClick={() => {
    localStorage.setItem("role", "ADMIN");
    localStorage.setItem("token", "demo-token");
    window.location.href = "/admin/add-user";
  }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  {/* Demo Credentials Helper */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-700 font-medium text-center mb-2">
                      Demo Credentials
                    </p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Username:</span>
                        <code className="bg-blue-100 text-gray-800 px-2 py-1 rounded font-medium">
                          admin
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span>Password:</span>
                        <code className="bg-blue-100 text-gray-800 px-2 py-1 rounded font-medium">
                          password
                        </code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center text-sm text-gray-300 mt-6">
                <p>© 2024 FinTech Converter. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
