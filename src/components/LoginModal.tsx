"use client";

import { useState } from "react";
import { X } from "lucide-react";

type LoginModalProps = {
  onClose: () => void;
  onSuccess: () => void;
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
    onSuccess(); 
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    setError("Something went wrong");
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-2xl font-semibold mb-6">Login</h2>

        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}

        <input
          placeholder="Username"
          className="w-full mb-3 px-4 py-2 border rounded-lg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
           disabled={loading || !username || !password}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-center mt-4 text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={onSignupClick}
            className="text-blue-600 hover:underline"
          >
            Signup
          </button>
        </p>
      </div>
    </div>
  );
}
