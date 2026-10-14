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
    <div className="w-full flex items-center justify-center py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-purple-500/30 shadow-2xl bg-[#130b26]/90 relative overflow-hidden">
        {/* Ambient neon back glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-[2px] shadow-neon-purple mb-4">
            <div className="w-full h-full bg-[#0e0818] rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Flow <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-brand-purple to-cyan-300">8D</span> Admin
          </h1>
          <p className="text-xs text-purple-300/70 mt-1">Management Portal & Spatial Catalog</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-brand-purple"
              placeholder="admin@focusmusic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5">
              Password
            </label>
            <input
              type="password"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-brand-purple"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-darkPurple hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-neon-purple active:scale-98 transition-all"
          >
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        {/* Demo Credentials hint */}
        <div className="mt-6 p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-center relative z-10">
          <p className="text-[11px] text-purple-300/80">Demo Credentials Pre-filled:</p>
          <p className="text-[11px] font-mono text-cyan-300 mt-0.5">admin@focusmusic.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
