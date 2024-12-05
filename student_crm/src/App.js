import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoutes";
import Login from "./pages/Login";
import StudentProfile from "./pages/StudentProfile";
import TeacherProfile from "./pages/TeacherProfile";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import ClassList from "./pages/Manage/Class";
import StudentManagement from "./pages/Manage/Student";
import TeacherManagement from "./pages/Manage/Teacher";
import FinancialAnalytics from "./pages/FinancialAnalytics";
import ClassAnalytics from "./pages/ClassAnalytics";
import Unauthorized from "./pages/Unauthorized";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => (
  <Router>
    <AuthProvider>
      <ErrorBoundary>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/student-profile"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
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
            element={
              <ProtectedRoute requiredRole="admin">
                <ClassList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/students"
            element={
              <ProtectedRoute requiredRole="admin">
                <StudentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage/teachers"
            element={
              <ProtectedRoute requiredRole="admin">
                <TeacherManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/financial"
            element={
              <ProtectedRoute requiredRole="admin">
                <FinancialAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <ClassAnalytics />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer />
      </ErrorBoundary>
    </AuthProvider>
  </Router>
);

export default App;
