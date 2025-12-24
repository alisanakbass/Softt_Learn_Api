import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PathDetail from "./pages/PathDetail";
import NodeDetail from "./pages/NodeDetail";
import Dashboard from "./pages/Dashboard";
import PathEditor from "./pages/PathEditor";
import UserManagement from "./pages/UserManagement";
import Profile from "./pages/Profile";

import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Member Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/path/:id"
          element={
            <ProtectedRoute>
              <PathDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/node/:id"
          element={
            <ProtectedRoute>
              <NodeDetail />
            </ProtectedRoute>
          }
        />

        {/* Teacher & Admin Routes */}
        <Route
          path="/editor/path/:id"
          element={
            <ProtectedRoute allowedRoles={["TEACHER", "ADMIN"]}>
              <PathEditor />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
