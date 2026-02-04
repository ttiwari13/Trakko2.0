"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  onLoginClick: () => void;
};

export default function SignupModal({
  onClose,
  onSuccess,
  onLoginClick,
}: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !username || !email || !password) return;

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }
      onSuccess();
    } catch (err) {
      console.error("Signup failed:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              placeholder="Full name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              placeholder="Username"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 active:scale-[0.98] transition shadow-lg shadow-blue-500/30 mt-6"
          >
            Sign up
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-black">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLoginClick}
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}