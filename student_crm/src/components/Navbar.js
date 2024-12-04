// src/components/Navbar.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
      <div>
        <Link to="/" className="font-bold text-xl">
          Student CRM
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {user.role === 'admin' && (
              <>
                <Link to="/" className="hover:underline">
                  Dashboard
                </Link>
                <Link to="/manage/classes" className="hover:underline">
                  Manage Classes
                </Link>
                <Link to="/manage/students" className="hover:underline">
                  Manage Students
                </Link>
                <Link to="/manage/teachers" className="hover:underline">
                  Manage Teachers
                </Link>
                <Link to="/analytics/financial" className="hover:underline">
                  Financial Analytics
                </Link>
              </>
            )}
            {user.role === 'teacher' && (
              <>
                <Link to="/teacher-profile" className="hover:underline">
                  My Profile
                </Link>
                {/* Add more teacher-specific links if needed */}
              </>
            )}
            {user.role === 'student' && (
              <>
                <Link to={`/student-profile/${user.username}`} className="hover:underline">
                  My Profile
                </Link>
                {/* Add more student-specific links if needed */}
              </>
            )}
            <span className="font-semibold">{user.username}</span>
            <button onClick={logout} className="hover:underline">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
