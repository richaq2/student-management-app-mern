// src/contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../api';

// Create Context
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User object: { username, role, token }
  const navigate = useNavigate();

  // Save user data to state and localStorage on login
  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials.username, credentials.password);
      setUser(data); // Save user info in state
      // localStorage is already handled in api.js via setToken
      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/');
      } else if (data.role === 'teacher') {
        navigate('/teacher-profile'); // Adjust route as needed
      } else if (data.role === 'student') {
        navigate(`/student-profile/${data.username}`); // Assuming username can be used as ID
      }
    } catch (error) {
      throw error;
    }
  };

  // Clear user data on logout
  const logout = () => {
    apiLogout();
    setUser(null);
    navigate('/login');
  };

  // Restore user data from local storage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Restore user data
    }
  }, []);

  // Check if the user is authorized based on role
  const isAuthorized = (requiredRole) => user?.role === requiredRole;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use Auth Context
export const useAuth = () => useContext(AuthContext);
