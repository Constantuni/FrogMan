import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import WorkspacePage from "./pages/WorkspacePage";
import ProjectPage from "./pages/ProjectPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

const DefaultRedirect = () => {
  const token = useAuthStore((state) => state.token);
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DefaultRedirect />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Workspace */}
          <Route
            path="/workspaces/:workspaceId"
            element={<WorkspacePage />}
          />

          {/* Project */}
          <Route
            path="/workspaces/:workspaceId/projects/:projectId"
            element={<ProjectPage />}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;