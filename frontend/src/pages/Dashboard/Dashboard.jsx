// pages/Dashboard/Dashboard.jsx — Home Dashboard
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

const distressColors = {
  Low: { bg: 'bg-calm-500/20', border: 'border-calm-500/30', text: 'text-calm-400', icon: '🌱' },
  Medium: { bg: 'bg-warm-500/20', border: 'border-warm-500/30', text: 'text-warm-400', icon: '🌤️' },
  High: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', icon: '⛈️' },
};

const quickActions = [
  { path: '/chat', icon: '💬', label: 'Anonymous Chat', desc: 'Talk to a stranger', color: 'from-primary-500/20 to-primary-600/10' },
  { path: '/help', icon: '🌿', label: 'Help & Techniques', desc: 'Grounding exercises', color: 'from-calm-500/20 to-calm-600/10' },
  { path: '/music', icon: '🎵', label: 'Calming Music', desc: 'Curated playlists', color: 'from-purple-500/20 to-purple-600/10' },
  { path: '/quiz', icon: '🧠', label: 'Self-Discovery Quiz', desc: 'Know yourself better', color: 'from-amber-500/20 to-amber-600/10' },
  { path: '/emergency', icon: '🆘', label: 'Emergency Help', desc: 'Crisis helplines', color: 'from-red-500/20 to-red-600/10' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get('/user/dashboard');
      setDashboard(res.data.dashboard);
    } catch {}
  };

  const getGreeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const distressInfo = dashboard?.quizResult?.distressLevel
    ? distressColors[dashboard.quizResult.distressLevel]
    : null;

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-48 h-48 bg-calm-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <p className="text-white/40 text-sm">{getGreeting()}</p>
            <h1 className="text-3xl font-display text-white mt-0.5">
              {dashboard?.initials || user?.initials || '...'}{' '}
              <span className="text-white/30 text-2xl">👋</span>
            </h1>
          </div>
          <div className="w-12 h-12 bg-primary-500/20 border border-primary-500/30 rounded-2xl flex items-center justify-center">
            <span className="text-xl font-display font-bold text-primary-400">
              {(dashboard?.initials || user?.initials || '?')[0]}
            </span>
          </div>
        </div>

        {/* Quiz Result Card */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {distressInfo ? (
            <div className={`card ${distressInfo.bg} ${distressInfo.border}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Your Mental Profile</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{distressInfo.icon}</span>
                    <span className={`text-lg font-semibold ${distressInfo.text}`}>
                      {dashboard.quizResult.distressLevel} Distress
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">{dashboard.quizResult.personalityType}</p>
                  <p className="text-white/40 text-xs mt-1">
                    Quiz taken · {new Date(dashboard.quizResult.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/quiz')}
                  className="text-xs text-white/40 hover:text-white/70 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Retake
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/quiz')}
              className="w-full card border-dashed border-primary-500/30 hover:border-primary-500/50 transition-all duration-200 text-center group"
            >
              <div className="text-3xl mb-2 group-hover:animate-float">🧠</div>
              <p className="text-white font-medium">Take your Self-Discovery Quiz</p>
              <p className="text-white/40 text-sm mt-1">Understand your distress level & personality type</p>
              <div className="mt-3 inline-flex items-center gap-1 text-primary-400 text-sm font-medium">
                Start Quiz <span>→</span>
              </div>
            </button>
          )}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="card text-center">
            <p className="text-2xl font-display font-bold text-primary-400">{dashboard?.chatCount || 0}</p>
            <p className="text-white/40 text-xs mt-0.5">Chats completed</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-display font-bold text-calm-400">
              {dashboard?.memberSince
                ? Math.floor((Date.now() - new Date(dashboard.memberSince)) / (1000 * 60 * 60 * 24))
                : 0}
            </p>
            <p className="text-white/40 text-xs mt-0.5">Days with HelpBuddy</p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">Quick Access</h2>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${action.color} border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-[0.98] text-left`}
                style={{ animationDelay: `${0.2 + i * 0.05}s` }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-xl flex-shrink-0">
                  {action.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{action.label}</p>
                  <p className="text-white/40 text-xs">{action.desc}</p>
                </div>
                <span className="ml-auto text-white/20">›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-white/15 text-xs mt-8">
          💙 Remember: You are not alone. Reaching out takes courage.
        </p>
      </div>

      <Navbar />
    </div>
  );
};

export default Dashboard;
