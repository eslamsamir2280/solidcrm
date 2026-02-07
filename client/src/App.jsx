import { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
// ... (استدعي باقي الصفحات بتاعتك عادي)
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import Finance from "./pages/Finance";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Technician from "./pages/Technician";
import ClientPortal from "./pages/ClientPortal";
import Reports from "./pages/Reports";

import "./App.css";

// مكون لحماية الروابط (محدش يدخل غير لما يكون مسجل)
const PrivateRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  // لو الدور مش مسموح له
  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        ⛔ غير مسموح لك بدخول هذه الصفحة
      </div>
    );
  }

  return children;
};

function AppContent() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // 1. السايد بار يختفي لو: صفحة لوجن، صفحة عميل، أو المستخدم فني
  const hideSidebar =
    location.pathname === "/login" ||
    location.pathname.startsWith("/portal") ||
    user?.role === "Technician";

  return (
    <div className="app-layout">
      <ToastContainer position="top-left" rtl={true} />

      {/* 2. السايد بار يظهر فقط لو مش مخفي ومش صفحة دخول */}
      {user && !hideSidebar && <Sidebar userRole={user.role} />}

      <main className={`main-content ${hideSidebar ? "portal-mode" : ""}`}>
        <div className={hideSidebar ? "" : "content-wrapper"}>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* --- بوابة العميل (عامة) --- */}
            <Route path="/portal/:id" element={<ClientPortal />} />

            {/* --- صفحات الفني (بدون سايد بار) --- */}
            <Route
              path="/technician"
              element={
                <PrivateRoute roles={["Technician", "Admin"]}>
                  <Technician />
                </PrivateRoute>
              }
            />

            {/* --- صفحات الأدمن والمديرين --- */}
            <Route
              path="/"
              element={
                <PrivateRoute roles={["Admin", "Sales", "Finance"]}>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <PrivateRoute roles={["Admin", "Sales"]}>
                  <Clients />
                </PrivateRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <PrivateRoute roles={["Admin", "Sales", "Finance"]}>
                  <Projects />
                </PrivateRoute>
              }
            />

            <Route
              path="/projects/:id"
              element={
                <PrivateRoute roles={["Admin", "Sales", "Finance"]}>
                  <ProjectDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <PrivateRoute roles={["Admin", "Sales"]}>
                  <Tasks />
                </PrivateRoute>
              }
            />

            <Route
              path="/finance"
              element={
                <PrivateRoute roles={["Admin", "Finance"]}>
                  <Finance />
                </PrivateRoute>
              }
            />

            <Route
              path="/employees"
              element={
                <PrivateRoute roles={["Admin", "Finance"]}>
                  <Employees />
                </PrivateRoute>
              }
            />

            <Route
              path="/attendance"
              element={
                <PrivateRoute roles={["Admin", "Finance"]}>
                  <Attendance />
                </PrivateRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <PrivateRoute roles={["Admin", "Finance"]}>
                  <Reports />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
