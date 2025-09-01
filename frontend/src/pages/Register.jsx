import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/images/background.png";

const blockedDomains = ["yopmail.com", "tempmail.com", "mailinator.com"];

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [payload, setPayload] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
  });

  const validatePassword = (password) => {
    let score = 0;
    let label = "Weak";

    const rules = {
      length: password.length >= 8,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };

    score = Object.values(rules).filter(Boolean).length;

    if (score <= 2) label = "Weak";
    else if (score === 3 || score === 4) label = "Medium";
    else if (score === 5) label = "Strong";

    setPasswordStrength({ score, label });

    return rules;
  };

  const validateField = (field, value, currentPayload = payload) => {
    let message = "";

    if (field === "name" && !value.trim()) {
      message = "Name is required";
    }

    if (field === "email") {
      if (!value.trim()) {
        message = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = "Invalid email format";
      } else {
        const domain = value.split("@")[1];
        if (blockedDomains.includes(domain)) {
          message = "Disposable emails are not allowed";
        }
      }
    }

    if (field === "password") {
      const rules = validatePassword(value);
      if (Object.values(rules).includes(false)) {
        message =
          "Password must be 8+ chars with uppercase, lowercase, number, and symbol.";
      }
    }

    if (field === "confirmPassword") {
      if (value !== currentPayload.password) {
        message = "Passwords do not match";
      }
    }

    return message;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newPayload = { ...payload, [name]: value };
    setPayload(newPayload);

    const errorMsg = validateField(name, value, newPayload);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.entries(payload).forEach(([key, value]) => {
      newErrors[key] = validateField(key, value, payload);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => !msg);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;

    setBusy(true);
    try {
      await register({
        name: payload.name.trim(),
        email: payload.email.trim(),
        password: payload.password,
      });
      alert("Registered successfully. Please wait for admin approval.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-900/50 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-blue-900/50"></div>

      <form
        onSubmit={submit}
        className="relative bg-white/30 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-sm z-10"
      >
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-900">
          Register
        </h2>

        {/* Name */}
        <label className="block mb-2 text-sm">Name</label>
        <input
          name="name"
          required
          value={payload.name}
          onChange={handleChange}
          className={`w-full p-2 border rounded mb-1 bg-white/70 backdrop-blur-sm ${
            errors.name ? "border-red-500" : ""
          }`}
        />
        {errors.name && (
          <p className="text-red-600 text-sm mb-3">{errors.name}</p>
        )}

        {/* Email */}
        <label className="block mb-2 text-sm">Email</label>
        <input
          name="email"
          type="email"
          required
          value={payload.email}
          onChange={handleChange}
          className={`w-full p-2 border rounded mb-1 bg-white/70 backdrop-blur-sm ${
            errors.email ? "border-red-500" : ""
          }`}
        />
        {errors.email && (
          <p className="text-red-600 text-sm mb-3">{errors.email}</p>
        )}

        {/* Password */}
        <label className="block mb-2 text-sm">Password</label>
        <input
          name="password"
          type="password"
          required
          value={payload.password}
          onChange={handleChange}
          className={`w-full p-2 border rounded mb-1 bg-white/70 backdrop-blur-sm ${
            errors.password ? "border-red-500" : ""
          }`}
        />
        {/* Strength bar */}
        {payload.password && (
          <div className="mb-3">
            <div className="w-full h-2 bg-gray-200 rounded">
              <div
                className={`h-2 rounded ${
                  passwordStrength.label === "Weak"
                    ? "bg-red-500 w-1/3"
                    : passwordStrength.label === "Medium"
                      ? "bg-yellow-500 w-2/3"
                      : "bg-green-600 w-full"
                }`}
              ></div>
            </div>
            <p
              className={`text-sm mt-1 ${
                passwordStrength.label === "Weak"
                  ? "text-red-600"
                  : passwordStrength.label === "Medium"
                    ? "text-yellow-600"
                    : "text-green-900"
              }`}
            >
              {passwordStrength.label}
            </p>
          </div>
        )}
        {errors.password && (
          <p className="text-red-600 text-sm mb-3">{errors.password}</p>
        )}

        {/* Confirm Password */}
        <label className="block mb-2 text-sm">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          required
          value={payload.confirmPassword}
          onChange={handleChange}
          className={`w-full p-2 border rounded mb-1 bg-white/70 backdrop-blur-sm ${
            errors.confirmPassword ? "border-red-500" : ""
          }`}
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mb-3">{errors.confirmPassword}</p>
        )}

        <button
          disabled={busy || Object.values(errors).some((msg) => msg)}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {busy ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
