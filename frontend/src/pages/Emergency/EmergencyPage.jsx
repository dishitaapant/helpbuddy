// pages/Emergency/EmergencyPage.jsx — Emergency Mental Health Support
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';

const HELPLINES = [
  {
    name: 'iCall',
    org: 'TISS — Tata Institute of Social Sciences',
    number: '9152987821',
    description: 'Free counseling by trained professionals. Hindi & English. Mon–Sat 8am–10pm.',
    emoji: '💙',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    type: 'Counseling',
  },
  {
    name: 'Vandrevala Foundation',
    org: 'Vandrevala Foundation',
    number: '1860-2662-345',
    description: '24/7 crisis helpline. Multilingual support across India.',
    emoji: '🌿',
    color: 'from-calm-500/20 to-calm-600/10',
    border: 'border-calm-500/30',
    accent: 'text-calm-400',
    type: 'Crisis',
  },
  {
    name: 'AASRA',
    org: 'AASRA Crisis Intervention',
    number: '9820466627',
    description: '24/7 crisis & suicide prevention. Empathetic, non-judgmental support.',
    emoji: '🌸',
    color: 'from-pink-500/20 to-pink-600/10',
    border: 'border-pink-500/30',
    accent: 'text-pink-400',
    type: 'Suicide Prevention',
  },
  {
    name: 'Snehi',
    org: 'Snehi Foundation',
    number: '044-24640050',
    description: 'Emotional support and crisis intervention. Mon–Fri 8am–10pm.',
    emoji: '🤝',
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    type: 'Emotional Support',
  },
  {
    name: 'Fortis Stress Helpline',
    org: 'Fortis Healthcare',
    number: '8376804102',
    description: 'For COVID and general stress. Professional mental health support.',
    emoji: '🏥',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    accent: 'text-purple-400',
    type: 'Medical',
  },
  {
    name: 'National Emergency',
    org: 'Government of India',
    number: '112',
    description: 'All-in-one emergency number. Police, fire, ambulance.',
    emoji: '🚨',
    color: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    accent: 'text-red-400',
    type: '24/7 Emergency',
  },
];

const SAFETY_PLAN = [
  { icon: '⚠️', step: 'Recognize warning signs', desc: 'Notice when thoughts become distressing or overwhelming.' },
  { icon: '🌿', step: 'Use coping strategies', desc: 'Try breathing exercises, grounding, or music from this app.' },
  { icon: '💬', step: 'Talk to someone', desc: 'Use anonymous chat or reach out to a trusted person.' },
  { icon: '📞', step: 'Call a helpline', desc: 'Any of the numbers above are free and confidential.' },
  { icon: '🏥', step: 'Go to emergency services', desc: 'If in immediate danger, call 112 or go to your nearest hospital.' },
];

const EmergencyPage = () => {
  const [calling, setCalling] = useState(null);

  const handleCall = (helpline) => {
    setCalling(helpline.name);
    window.location.href = `tel:${helpline.number.replace(/[^0-9]/g, '')}`;
    setTimeout(() => setCalling(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 relative">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-3xl font-display text-white">Emergency Support</h1>
          <p className="text-white/40 text-sm mt-1">
            You are not alone. Help is available right now, for free.
          </p>
        </div>

        {/* Crisis Banner */}
        <div className="card bg-red-500/10 border-red-500/30 mb-6 animate-slide-up">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="text-white font-semibold mb-1">In immediate danger?</p>
              <p className="text-white/50 text-sm mb-3">
                If you or someone else is in immediate physical danger, call the national emergency number immediately.
              </p>
              <a
                href="tel:112"
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                📞 Call 112 — National Emergency
              </a>
            </div>
          </div>
        </div>

        {/* Helplines */}
        <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
          Mental Health Helplines (India)
        </h2>
        <div className="space-y-3 mb-8 animate-slide-up">
          {HELPLINES.map((h, i) => (
            <div
              key={h.name}
              className={`card bg-gradient-to-br ${h.color} ${h.border} transition-all duration-200`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-0.5">{h.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-white font-semibold text-sm">{h.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/10 ${h.accent} font-medium`}>
                      {h.type}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mb-1">{h.org}</p>
                  <p className="text-white/60 text-xs leading-relaxed mb-3">{h.description}</p>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-base ${h.accent}`}>{h.number}</span>
                    <button
                      onClick={() => handleCall(h)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${h.accent}`}
                    >
                      {calling === h.name ? '⏳ Connecting...' : '📞 Call Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Safety Plan */}
        <div className="animate-slide-up">
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 ml-1">
            Personal Safety Plan
          </h2>
          <div className="card">
            <p className="text-white/50 text-sm mb-4">
              Follow these steps when you're feeling overwhelmed or in crisis:
            </p>
            <div className="space-y-4">
              {SAFETY_PLAN.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base flex-shrink-0">
                      {step.icon}
                    </div>
                    {i < SAFETY_PLAN.length - 1 && (
                      <div className="w-px h-4 bg-white/10 mt-1" />
                    )}
                  </div>
                  <div className="pt-1 pb-2">
                    <p className="text-white font-medium text-sm">{step.step}</p>
                    <p className="text-white/40 text-xs mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Affirmation */}
        <div className="text-center py-6">
          <p className="text-white/30 text-sm italic leading-relaxed">
            "Asking for help is not a sign of weakness.<br />
            It's one of the bravest things you can do."
          </p>
          <p className="text-primary-500/60 text-xs mt-2">— HelpBuddy</p>
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default EmergencyPage;
