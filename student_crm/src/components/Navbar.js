import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderLinks = () => {
    let links = [];
    if(user){
      if (user.role === "admin") {
        links = [
          { to: "/", label: "Dashboard" },
          { to: "/manage/classes", label: "Manage Classes" },
          { to: "/manage/students", label: "Manage Students" },
          { to: "/manage/teachers", label: "Manage Teachers" },
          { to: "/analytics/financial", label: "Financial Analytics" },
        ];
      } else if (user.role === "teacher") {
        links = [{ to: "/teacher-profile", label: "My Profile" }];
      } else if (user.role === "student") {
        links = [{ to: `/student-profile`, label: "My Profile" }];
      }
    }
      
      return (
      <div className="flex flex-col lg:flex-row">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block mt-4 lg:mt-0 text-gray-200 hover:text-white mr-4 hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <>
    {user && (
    <nav className="bg-slate-900">
      <div className="container mx-auto flex items-center justify-between flex-wrap p-4">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <Link to="/" className="font-bold text-xl tracking-tight">
          SmartEd
          </Link>
        </div>
        <div className="block lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center px-3 py-2 border rounded text-white border-white hover:text-gray-200 hover:border-gray-200"
          >
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
              <title>Menu</title>
              <path d="M0 3h20v2H0zM0 9h20v2H0zM0 15h20v2H0z" />
            </svg>
          </button>
        </div>
        <div
          className={`w-full ${
            isMobileMenuOpen ? "block" : "hidden"
          } lg:flex lg:items-center lg:w-auto`}
        >
          <div className="lg:flex-grow">{renderLinks()}</div>
          {user && (
            <div className="flex items-center mt-4 lg:mt-0">
              <span className="text-white mr-4 font-semibold">
                {user.username}
              </span>
              <button
                onClick={logout}
                className="text-sm px-4 py-2 leading-none bg-red-500 text-white rounded hover:bg-red-600 mt-4 lg:mt-0"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )}
  </>
  );
};

export default Navbar;
