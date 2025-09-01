import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import bgImage from "../assets/images/background.png";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrorMsg("");

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      setErrorMsg(msg);
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-900/50 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* blue overlay with blur */}
      <div className="absolute inset-0 backdrop-blur-sm bg-blue-900/50"></div>

      {/* loader overlay */}
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-md z-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* form container */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-sm z-10"
      >
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-900">
          Login
        </h2>

        <label className="block mb-2 text-sm">Username</label>
        <input
          required
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-3 bg-white/70 backdrop-blur-sm"
        />

        <label className="block mb-2 text-sm">Password</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4 bg-white/70 backdrop-blur-sm"
        />

        <button
          disabled={busy}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mb-2"
        >
          {busy ? "Logging in..." : "Login"}
        </button>

        {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}
      </form>
    </div>
  );
};

export default Login;
