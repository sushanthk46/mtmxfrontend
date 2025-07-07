import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import RootRoute from "@/components/RootRoute";
import Layout from "@/components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ConvertMTtoMX from "./pages/ConvertMTtoMX";
import ConvertMXtoMT from "./pages/ConvertMXtoMT";
import AuditReport from "./pages/AuditReport";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/AdminLayout";
import AddUser from "./pages/AddUser";
import AdminUserManagement from "./pages/AdminUserManagement";

const queryClient = new QueryClient();

function RequireRole({ role, children }: { role: string; children: JSX.Element }) {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;
  if (userRole !== role) return <Navigate to="/unauthorized" replace />;

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard/mt-to-mx" replace />} />
              <Route path="home" element={<Dashboard />} />
              <Route path="mt-to-mx" element={<ConvertMTtoMX />} />
              <Route path="mx-to-mt" element={<ConvertMXtoMT />} />
              <Route path="audit" element={<AuditReport />} />
            </Route>

            <Route
              path="/admin"
              element={
                <RequireRole role="ADMIN">
                  <AdminLayout />
                </RequireRole>
              }
            >
              <Route path="add-user" element={<AddUser />} />
              <Route path="manage-users" element={<AdminUserManagement />} />
              <Route index element={<Navigate to="users" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
