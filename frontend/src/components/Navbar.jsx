import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logoIcon from "../assets/icons/logo.png";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-blue-900/50 border-b border-white/10 shadow-sm h-14 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        {/* Brand with icon */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-semibold text-white"
        >
          <img src={logoIcon} alt="BookMate Logo" className="w-7 h-7" />
          BookMate
        </Link>

        {/* Right side (auth buttons) */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-white/90">
                Hi {user.name || user.email}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Link
                  to="/login"
                  className="px-3 py-1 rounded hover:bg-blue-800/40 transition text-white"
                >
                  Login
                </Link>
              )}
              {location.pathname !== "/register" && (
                <Link
                  to="/register"
                  className="px-3 py-1 rounded hover:bg-blue-800/40 transition text-white"
                >
                  Register
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
