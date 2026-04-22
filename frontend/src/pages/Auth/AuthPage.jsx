// pages/Auth/AuthPage.jsx — Full Auth Flow (Signup → OTP, Login → OTP)
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const AuthPage = () => {
  const { login } = useAuth();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');

  // Form state
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // ─── Step 1: Signup ──────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/signup', form);
      setUserId(res.data.userId);
      setSuccess(res.data.message);
      setMode('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 1: Login ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email: form.email });
      setUserId(res.data.userId);
      setSuccess(res.data.message);
      setMode('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp });
      login(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-calm-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 rounded-2xl border border-primary-500/30 mb-4 animate-float">
            <span className="text-3xl">💙</span>
          </div>
          <h1 className="text-3xl font-display text-white mb-1">HelpBuddy</h1>
          <p className="text-white/40 text-sm">Your anonymous safe space</p>
        </div>

        {/* Card */}
        <div className="card">
          {/* Tab switcher (only for signup/login, not otp) */}
          {mode !== 'otp' && (
            <div className="flex rounded-xl bg-white/5 p-1 mb-6">
              {['signup', 'login'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    mode === m
                      ? 'bg-primary-500 text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {m === 'signup' ? 'Sign Up' : 'Login'}
                </button>
              ))}
            </div>
          )}

          {/* Error / Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-calm-500/10 border border-calm-500/30 rounded-xl text-calm-400 text-sm">
              ✅ {success}
            </div>
          )}

          {/* ─── SIGNUP FORM ─────────────────────────────────────────────────── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Deepika Patel"
                  className="input-field"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>

              {/* Privacy note */}
              <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-xs text-primary-300">
                🔒 <strong>Your identity is protected.</strong> In chats, you'll only appear as your initials (e.g., D.P.). Your real name and contact details are never shared.
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : 'Continue with OTP →'}
              </button>
            </form>
          )}

          {/* ─── LOGIN FORM ──────────────────────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5 ml-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                />
              </div>
              <p className="text-white/40 text-xs text-center">
                We'll send a 6-digit OTP to your registered email.
              </p>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : 'Send OTP →'}
              </button>
            </form>
          )}

          {/* ─── OTP VERIFICATION ────────────────────────────────────────────── */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-calm-500/20 rounded-xl border border-calm-500/30 mb-3">
                  <span className="text-2xl">📬</span>
                </div>
                <h3 className="text-white font-display text-lg">Check your email</h3>
                <p className="text-white/40 text-sm mt-1">Enter the 6-digit OTP we sent you</p>
              </div>

              <div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                    setError('');
                  }}
                  placeholder="• • • • • •"
                  className="input-field text-center text-2xl tracking-[1rem] font-bold"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : 'Verify OTP ✓'}
              </button>

              <button
                type="button"
                onClick={() => { setMode(mode === 'otp' ? 'login' : mode); setError(''); }}
                className="w-full text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                ← Go back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          By using HelpBuddy, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
