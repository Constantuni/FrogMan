import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { login } from "../api/auth";
import { parseApiError } from "../api/errorHelper";

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  // Client-side validation mirroring FluentValidation rules
  const validateForm = () => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    // Email Validation (Matches CascadeMode.Stop)
    if (!email) {
      errors.email = ["Email is required."];
      isValid = false;
    } else if (email.length > 254) {
      errors.email = ["Email must not exceed 254 characters."];
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ["Invalid email format."];
      isValid = false;
    }

    // Password Validation
    if (!password) {
      errors.password = ["Password is required."];
      isValid = false;
    } else if (password.length > 128) {
      errors.password = ["Password must not exceed 128 characters."];
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    // Run client-side validation first
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await login({ email, password });
      setAuth(res.user, res.token);
      navigate("/dashboard");
    } catch (err) {
      const { title, fieldErrors } = parseApiError(err);
      
      setGeneralError(title);
      setFieldErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
      <form
        className="w-full max-w-md rounded bg-white p-8 shadow-md"
        onSubmit={handleSubmit}
        noValidate // Disables default browser validation popups
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Login
        </h2>

        {/* Standardized General Error Display */}
        {generalError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {generalError}
          </div>
        )}

        <label className="mb-2 block font-medium text-gray-700">Email</label>
        <input
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          className={`mb-1 w-full rounded border p-2 text-gray-900 ${
            fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          autoComplete="username"
        />
        {/* Email Field Error */}
        {fieldErrors.email && (
          <p className="mb-4 text-xs text-red-500">{fieldErrors.email[0]}</p>
        )}
        {!fieldErrors.email && <div className="mb-4" />}

        <label className="mb-2 block font-medium text-gray-700">Password</label>
        <input
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={128}
          className={`mb-1 w-full rounded border p-2 text-gray-900 ${
            fieldErrors.password ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          autoComplete="current-password"
        />
        {/* Password Field Error */}
        {fieldErrors.password && (
          <p className="mb-4 text-xs text-red-500">{fieldErrors.password[0]}</p>
        )}
        {!fieldErrors.password && <div className="mb-4" />}

        <button
          type="submit"
          className="mt-2 w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;