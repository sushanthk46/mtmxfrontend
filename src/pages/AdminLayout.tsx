import React from "react"; // ✅ required for JSX parsing with SWC
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LogOut, UserPlus, Users, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { name: "Dashboard", path: "/dashboard/home", icon: LayoutDashboard },
  { name: "Add User", path: "/admin/add-user", icon: UserPlus },
  { name: "Manage Users", path: "/admin/manage-users", icon: Users },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-6 shadow-lg flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
          <nav className="flex flex-col gap-4">
            {navItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition ${isActive ? "bg-gray-700" : ""}`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
        <Outlet />
      </main>
    </div>
  );
}
