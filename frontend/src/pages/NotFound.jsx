import React from "react";
import { Link } from "react-router-dom";
import bgImage from "../assets/images/background.png";

const NotFound = () => (
  <div
    className="min-h-screen flex items-center justify-center bg-gray-900/50 bg-cover bg-center relative"
    style={{ backgroundImage: `url(${bgImage})` }}
  >
    {/* blue overlay with blur */}
    <div className="absolute inset-0 backdrop-blur-sm bg-blue-900/50"></div>

    {/* content box */}
    <div className="relative text-center z-10">
      <h1 className="text-7xl font-bold mb-4 text-white">404</h1>
      <p className="mb-6 text-white">Page not found</p>
      <Link
        to="/"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded"
      >
        Login
      </Link>
    </div>
  </div>
);

export default NotFound;
