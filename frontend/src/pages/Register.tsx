import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { register } from "../api/auth";

const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await register({ username, email, password });

      setAuth(res.user, res.token);

      console.log("auth response", res);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
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

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <label className="mb-2 block font-medium text-gray-700">Username</label>
        <input
          placeholder="Enter your username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full rounded border p-2 text-gray-900"
          required
        />

        <label className="mb-2 block font-medium text-gray-700">Email</label>
        <input
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border p-2 text-gray-900"
          autoComplete="username"
          required
        />

        <label className="mb-2 block font-medium text-gray-700">Password</label>
        <input
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border p-2 text-gray-900"
          required
        />

        <button
          type="submit"
          className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="cursor-pointer text-blue-500 hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;