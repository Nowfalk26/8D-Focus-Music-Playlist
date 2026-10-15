import React, { useState } from "react";
import { authApi } from "../api/api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("admin@focusmusic.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ email, password });

      if (res.data && res.data.success) {
        const userData = res.data.data;

        if (userData.role !== "admin") {
          setError("Access Denied: You must have an administrator account to log in.");
          setLoading(false);
          return;
        }

        localStorage.setItem("adminToken", userData.token);
        localStorage.setItem("adminUser", JSON.stringify(userData));

        onLoginSuccess(userData);
      } else {
        setError(res.data?.message || "Failed to log in.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Check server connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 select-none">
      <div className="w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient subtle green glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#1DB954]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1DB954]/25 mb-4">
            <span className="material-symbols-outlined text-black text-3xl font-bold">graphic_eq</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Flow <span className="text-[#1DB954]">8D</span> Admin
          </h1>
          <p className="text-xs text-neutral-400 mt-1">Management Portal & Spatial Catalog</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-500 text-lg">
                mail
              </span>
              <input
                type="email"
                className="w-full bg-[#242424] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]"
                placeholder="admin@focusmusic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-500 text-lg">
                lock
              </span>
              <input
                type="password"
                className="w-full bg-[#242424] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Management"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center relative z-10">
          <p className="text-[11px] text-neutral-500 font-mono">
            Default credentials: <span className="text-neutral-300">admin@focusmusic.com</span> / <span className="text-neutral-300">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
