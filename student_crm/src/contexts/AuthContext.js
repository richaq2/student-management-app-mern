import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../services/api';

// Create Context
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User object: { id, role, username }
  const navigate = useNavigate();

  // Save user data to local storage on login
  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      setUser(data); // Save user info in state
      localStorage.setItem('authUser', JSON.stringify(data)); // Save to local storage
      navigate('/'); // Redirect to dashboard
    } catch (error) {
      throw error;
    }
  };

  // Clear user data on logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser'); // Remove from local storage
    navigate('/login'); // Redirect to login page
  };

  // Restore user data from local storage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Restore user data
    }
  }, []);

  // Check if the user is authorized based on role
  const isAuthorized = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use Auth Context
export const useAuth = () => useContext(AuthContext);
