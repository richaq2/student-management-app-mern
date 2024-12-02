import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const navLinkStyles = ({ isActive }) =>
    `text-sm font-medium px-3 py-2 rounded-md ${
      isActive ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-700'
    }`;

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">School CRM</h1>
        <div className="flex space-x-4">
          <NavLink to="/" className={navLinkStyles}>
            Dashboard
          </NavLink>
          {user?.role === 'admin' && (
            <>
            <NavLink to="/manage/classes" className={navLinkStyles}>
              Manage Classes
            </NavLink>
             <NavLink to="/manage/students" className={navLinkStyles}>
             Manage Student
           </NavLink>
           <NavLink to="/manage/teachers" className={navLinkStyles}>
             Manage Teacher
           </NavLink>
            </>
          )}
          {user?.role === 'teacher' && (
            <NavLink to="/teacher-profile" className={navLinkStyles}>
              My teacher Profile
            </NavLink>
          )}
          {user?.role === 'student' && (
            <NavLink to="/student-profile" className={navLinkStyles}>
              My Student Profile
            </NavLink>
          )}
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
