"use client";

import { useState } from "react";
import { X } from "lucide-react";

type LoginModalProps = {
  onClose: () => void;
  onSuccess: (user: { username: string }) => void;
  onSignupClick: () => void;
};

export default function LoginModal({
  onClose,
  onSuccess,
  onSignupClick,
}: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }
      if (!res.ok) {
        setError(data?.error || "Login failed");
        setLoading(false);
        return;
      }
      setLoading(false);
      onSuccess(data.user);
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <input
              placeholder="Username"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && username && password && !loading) {
                  handleLogin();
                }
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !username || !password}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:active:scale-100 mt-6"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </div>

        <p className="text-sm text-center mt-6 text-black">
          Don't have an account?{" "}
          <button
            onClick={onSignupClick}
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}