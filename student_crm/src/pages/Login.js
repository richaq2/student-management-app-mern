import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import users from "../assests/users.svg";
import pass from "../assests/pass.svg";

const Login = () => {
  const { login, user } = useAuth();
  const [credentials, setCredentials] = useState({
    username: "admin",
    password: "admin1234",
  });
  const [error, setError] = useState(null);
  if (user) {
    // User is not authenticated, redirect to login
    if (user.role === "student") return <Navigate to="/student-profile" />;
    if (user.role === "admin") return <Navigate to="/" />;
    if (user.role === "teacher") return <Navigate to="/teacher-profile" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await login(credentials);
    } catch (err) {
      setError(err.message || "Invalid username or password");
    }
  };

  return (
    <div className="font-[sans-serif]">
      <div className="grid lg:grid-cols-2 gap-4 max-lg:gap-12 bg-gradient-to-r from-blue-900 to-blue-700 px-8 py-12 h-[320px]">
        <div>
          <h4 className="text-4xl font-bold text-white">
            Student Management System
          </h4>

          <div className="max-w-lg mt-16 max-lg:hidden">
            <h3 className="text-3xl font-bold text-white">Welcome Back</h3>
            <p className="text-sm mt-4 text-white">
              Embark on a seamless journey as you log in to your account. It's all about making things simple and hassle-free for you, while keeping your account safe. Whether you're here to work, explore, or connect, we've got you covered. Let’s get started!
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:px-6 px-4 py-8 max-w-md w-full h-max shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] max-lg:mx-auto">
          {error && (
            <p classNameName="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h3 className="text-3xl font-extrabold text-gray-800">Log in</h3>
            </div>

            <div>
              <label className="text-gray-800 text-sm mb-2 block">
                User name
              </label>
              <div className="relative flex items-center">
                <input
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      username: e.target.value,
                    })
                  }
                  className="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                  placeholder="Enter user name"
                />
                <img
                  src={users}
                  alt="user"
                  className="i-svg inline mr-4"
                  width="20px"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-gray-800 text-sm mb-2 block">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    })
                  }
                  required
                  className="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-md outline-blue-600"
                  placeholder="Enter password"
                />
                <img
                  src={pass}
                  alt="pass"
                  className="i-svg inline mr-4"
                  width="20px"
                />
              </div>
            </div>
            <div className="mt-4 text-right">
              <a
                href="/"
                className="text-blue-600 text-sm font-semibold hover:underline"
              >
                Forgot your password?
              </a>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full shadow-xl py-3 px-6 text-sm font-semibold rounded-md text-white bg-blue-900 hover:bg-blue-700 focus:outline-none"
              >
                Log in
              </button>
            </div>
            <p className="text-sm mt-8 text-center text-gray-800">
              Don't have an account{" "}
              <a
                href="/"
                className="text-blue-600 font-semibold hover:underline ml-1 whitespace-nowrap"
              >
                Register here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
