import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoutes";
import Login from "./pages/Login";
import StudentProfile from "./pages/StudentProfile";
import TeacherProfile from "./pages/TeacherProfile";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import ClassList from "./pages/Manage/Class";
import StudentManagement from "./pages/Manage/Student";
const App = () => (
  <Router>
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/student-profile/:id" element={<StudentProfile />} />
        <Route
          path="/teacher-profile"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage/classes"
          exact={true}
          element={
            <ProtectedRoute requiredRole="admin">
              <ClassList />
            </ProtectedRoute>
          }
        />

<Route
          path="/manage/students"
          exact={true}
          element={
            <ProtectedRoute requiredRole="admin">
              <StudentManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </Router>
);

export default App;
