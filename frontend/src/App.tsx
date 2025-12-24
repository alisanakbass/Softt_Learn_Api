import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PathDetail from "./pages/PathDetail";
import NodeDetail from "./pages/NodeDetail";
import Dashboard from "./pages/Dashboard";
import PathEditor from "./pages/PathEditor";
import UserManagement from "./pages/UserManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/path/:id" element={<PathDetail />} />
        <Route path="/node/:id" element={<NodeDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/path/:id" element={<PathEditor />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
