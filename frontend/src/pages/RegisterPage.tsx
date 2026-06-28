import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { register } from "../api/auth";
import { parseApiError } from "../api/errorHelper";

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Split error state into general and field-specific
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await register({ username, email, password });
      setAuth(res.user, res.token);
      navigate("/dashboard");
    } catch (err) {
      // Use the helper to parse the standard error
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
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Register
        </h2>

        {/* General Error (e.g. "One or more validation errors occurred.") */}
        {generalError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {generalError}
          </div>
        )}

        <label className="mb-2 block font-medium text-gray-700">Username</label>
        <input
          placeholder="Enter your username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`mb-1 w-full rounded border p-2 text-gray-900 ${
            fieldErrors.username ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          required
        />
        {fieldErrors.username && (
          <p className="mb-4 text-xs text-red-500">{fieldErrors.username[0]}</p>
        )}
        {!fieldErrors.username && <div className="mb-4" />}

        <label className="mb-2 block font-medium text-gray-700">Email</label>
        <input
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`mb-1 w-full rounded border p-2 text-gray-900 ${
            fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          required
        />
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
          className={`mb-1 w-full rounded border p-2 text-gray-900 ${
            fieldErrors.password ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          required
        />
        {fieldErrors.password && (
          <p className="mb-4 text-xs text-red-500">{fieldErrors.password[0]}</p>
        )}
        {!fieldErrors.password && <div className="mb-4" />}

        <button
          type="submit"
          className="mt-2 w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;