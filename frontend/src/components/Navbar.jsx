// components/Navbar.jsx — Bottom Navigation Bar
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/help', icon: '🌿', label: 'Help' },
  { path: '/quiz', icon: '🧠', label: 'Quiz' },
  { path: '/music', icon: '🎵', label: 'Music' },
  { path: '/emergency', icon: '🆘', label: 'SOS' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 px-2 py-2 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-white/40 hover:text-white/70'
              } ${item.path === '/emergency' ? 'text-red-400' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-white/40 hover:text-white/70 transition-all duration-200"
        >
          <span className="text-lg">🚪</span>
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
