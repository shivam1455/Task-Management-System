import { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

function getAuthState() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return { token, role };
}

function getRoleRedirectPath(role: string | null) {
  if (role === "admin") return "/admin";
  if (role === "user") return "/user";
  return "/login";
}

// 🔐 RBAC Guard
function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: "admin" | "user";
}) {
  const { token, role: savedRole } = getAuthState();

  if (!token || !savedRole) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to correct dashboard
  if (savedRole !== role) {
    return <Navigate to={getRoleRedirectPath(savedRole)} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ADMIN ONLY */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* USER ONLY */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
