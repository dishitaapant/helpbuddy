// pages/Help/HelpPage.jsx — Grounding Techniques & Breathing Exercises
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';

// ─── 5-4-3-2-1 Grounding Data ─────────────────────────────────────────────────
const GROUNDING_STEPS = [
  { num: 5, sense: 'See', emoji: '👁️', color: 'from-blue-500/20 to-blue-600/10', instruction: 'Look around and name 5 things you can SEE right now.', examples: 'A wall, a chair, your hands, a window, a light...' },
  { num: 4, sense: 'Touch', emoji: '✋', color: 'from-amber-500/20 to-amber-600/10', instruction: 'Notice 4 things you can TOUCH or feel physically.', examples: 'The chair beneath you, your clothes, the floor, your own breath...' },
  { num: 3, sense: 'Hear', emoji: '👂', color: 'from-purple-500/20 to-purple-600/10', instruction: 'Listen for 3 sounds you can HEAR right now.', examples: 'Traffic outside, your heartbeat, a fan humming...' },
  { num: 2, sense: 'Smell', emoji: '👃', color: 'from-calm-500/20 to-calm-600/10', instruction: 'Identify 2 things you can SMELL (or like the smell of).', examples: 'Fresh air, coffee, soap, the rain...' },
  { num: 1, sense: 'Taste', emoji: '👅', color: 'from-red-500/20 to-red-600/10', instruction: 'Notice 1 thing you can TASTE right now.', examples: 'Mint, water, your last meal...' },
];

// ─── Breathing Techniques ─────────────────────────────────────────────────────
const BREATHING_TECHNIQUES = [
  {
    id: 'box',
    name: 'Box Breathing',
    subtitle: 'Used by Navy SEALs for calm under pressure',
    emoji: '⬜',
    phases: [
      { label: 'Inhale', duration: 4, color: '#6B7FD4' },
      { label: 'Hold', duration: 4, color: '#9B59B6' },
      { label: 'Exhale', duration: 4, color: '#10b989' },
      { label: 'Hold', duration: 4, color: '#f97316' },
    ],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    subtitle: 'Activates your body\'s natural relaxation response',
    emoji: '🌙',
    phases: [
      { label: 'Inhale', duration: 4, color: '#6B7FD4' },
      { label: 'Hold', duration: 7, color: '#9B59B6' },
      { label: 'Exhale', duration: 8, color: '#10b989' },
    ],
  },
  {
    id: 'calm',
    name: 'Calming Breath',
    subtitle: 'Simple and effective for immediate anxiety relief',
    emoji: '🕊️',
    phases: [
      { label: 'Inhale', duration: 4, color: '#6B7FD4' },
      { label: 'Exhale slowly', duration: 6, color: '#10b989' },
    ],
  },
];

// ─── Breathing Exercise Component ─────────────────────────────────────────────
const BreathingExercise = ({ technique, onBack }) => {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(technique.phases[0].duration);
  const [cycle, setCycle] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const start = () => {
    setActive(true);
    setPhaseIndex(0);
    setTimeLeft(technique.phases[0].duration);
    setCycle(0);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setActive(false);
    setPhaseIndex(0);
    setTimeLeft(technique.phases[0].duration);
  };

  useEffect(() => {
    if (!active) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setPhaseIndex((pi) => {
            const next = (pi + 1) % technique.phases.length;
            if (next === 0) setCycle((c) => c + 1);
            setTimeLeft(technique.phases[next].duration);
            return next;
          });
          return technique.phases[(phaseIndex + 1) % technique.phases.length].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, phaseIndex]);

  const currentPhase = technique.phases[phaseIndex];
  const progress = 1 - timeLeft / currentPhase.duration;
  const circumference = 2 * Math.PI * 56;

  return (
    <div className="flex flex-col items-center">
      <button onClick={onBack} className="self-start text-white/40 text-sm hover:text-white/60 mb-6 flex items-center gap-1">
        ← Back
      </button>

      <h2 className="text-2xl font-display text-white mb-1">{technique.name}</h2>
      <p className="text-white/40 text-sm mb-8 text-center">{technique.subtitle}</p>

      {/* Breathing Circle */}
      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="64" cy="64" r="56"
            fill="none"
            stroke={currentPhase.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-display font-bold text-white">{timeLeft}</span>
          <span className="text-sm font-semibold mt-1" style={{ color: currentPhase.color }}>
            {currentPhase.label}
          </span>
          {active && <span className="text-white/30 text-xs mt-1">Cycle {cycle + 1}</span>}
        </div>
      </div>

      {/* Phase guide */}
      <div className="flex gap-2 mb-8">
        {technique.phases.map((phase, i) => (
          <div key={i} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${i === phaseIndex && active ? 'bg-white/20 text-white' : 'bg-white/5 text-white/30'}`}>
            <span>{phase.label}</span>
            <span className="font-bold">{phase.duration}s</span>
          </div>
        ))}
      </div>

      {!active ? (
        <button onClick={start} className="btn-primary px-10">Start Breathing</button>
      ) : (
        <button onClick={stop} className="btn-ghost px-10">Stop</button>
      )}
    </div>
  );
};

// ─── Main Help Page ───────────────────────────────────────────────────────────
const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('home'); // home | grounding | breathing | technique
  const [groundingStep, setGroundingStep] = useState(0);
  const [selectedTechnique, setSelectedTechnique] = useState(null);

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-calm-500/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 relative">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display text-white">Help & Support</h1>
          <p className="text-white/40 text-sm mt-1">Evidence-based techniques to help you right now</p>
        </div>

        {/* ─── HOME ─────────────────────────────────────────────────────────── */}
        {activeSection === 'home' && (
          <div className="space-y-4 animate-slide-up">
            {/* SOS Banner */}
            <div className="card bg-red-500/10 border-red-500/20">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚨</span>
                <div>
                  <p className="text-white font-semibold text-sm">In immediate danger?</p>
                  <p className="text-white/50 text-xs">Call emergency services or a crisis helpline</p>
                </div>
                <a href="tel:iCall" className="ml-auto bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors">
                  Call Now
                </a>
              </div>
            </div>

            {/* Grounding Card */}
            <button
              onClick={() => { setActiveSection('grounding'); setGroundingStep(0); }}
              className="w-full card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌍</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">5-4-3-2-1 Grounding</h3>
                  <p className="text-white/40 text-sm">Reconnect to the present moment during anxiety or panic attacks using your 5 senses.</p>
                  <span className="inline-block mt-2 text-blue-400 text-xs font-medium">Start Exercise →</span>
                </div>
              </div>
            </button>

            {/* Breathing Card */}
            <button
              onClick={() => setActiveSection('breathing')}
              className="w-full card bg-gradient-to-br from-calm-500/10 to-calm-600/5 border-calm-500/20 hover:border-calm-500/40 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">🫁</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Breathing Exercises</h3>
                  <p className="text-white/40 text-sm">Scientifically-backed breathing techniques to calm your nervous system in minutes.</p>
                  <span className="inline-block mt-2 text-calm-400 text-xs font-medium">3 Techniques →</span>
                </div>
              </div>
            </button>

            {/* Panic Attack Guide */}
            <div className="card">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>⚡</span> During a Panic Attack
              </h3>
              <div className="space-y-2">
                {[
                  'Remember: panic attacks are NOT dangerous. They feel terrible but will pass.',
                  'Do NOT fight the panic — this makes it worse. Let it wash over you.',
                  'Try box breathing: Inhale 4s → Hold 4s → Exhale 4s → Hold 4s',
                  'Stamp your feet on the ground. Feel the floor beneath you.',
                  'Say out loud: "This is a panic attack. It will be over in minutes."',
                  'Cold water on your face activates the dive reflex and slows your heart.',
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 text-sm text-white/70">
                    <span className="text-primary-400 font-bold flex-shrink-0">{i + 1}.</span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Self-Care Tips */}
            <div className="card">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>💚</span> Daily Wellbeing Tips
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '😴', tip: 'Sleep 7-9 hours' },
                  { icon: '🚶', tip: '10-min walk daily' },
                  { icon: '💧', tip: 'Stay hydrated' },
                  { icon: '📵', tip: 'Screen-free hour' },
                  { icon: '📓', tip: 'Journal feelings' },
                  { icon: '🤗', tip: 'Talk to someone' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                    <span>{item.icon}</span>
                    <span className="text-white/60 text-xs">{item.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── GROUNDING TECHNIQUE ──────────────────────────────────────────── */}
        {activeSection === 'grounding' && (
          <div className="animate-slide-up">
            <button onClick={() => setActiveSection('home')} className="text-white/40 text-sm hover:text-white/60 mb-6 flex items-center gap-1">
              ← Back
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display text-white">5-4-3-2-1 Grounding</h2>
              <p className="text-white/40 text-sm mt-1">Take it one step at a time. Breathe slowly.</p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {GROUNDING_STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= groundingStep ? 'bg-primary-400' : 'bg-white/10'}`} />
              ))}
            </div>

            {/* Current step */}
            <div className={`card bg-gradient-to-br ${GROUNDING_STEPS[groundingStep].color} mb-6`}>
              <div className="text-center">
                <div className="text-5xl mb-3">{GROUNDING_STEPS[groundingStep].emoji}</div>
                <div className="text-6xl font-display font-bold text-white mb-1">{GROUNDING_STEPS[groundingStep].num}</div>
                <div className="text-primary-300 font-semibold text-lg mb-3">Things to {GROUNDING_STEPS[groundingStep].sense}</div>
                <p className="text-white/80 text-sm leading-relaxed mb-2">{GROUNDING_STEPS[groundingStep].instruction}</p>
                <p className="text-white/30 text-xs italic">{GROUNDING_STEPS[groundingStep].examples}</p>
              </div>
            </div>

            <div className="flex gap-3">
              {groundingStep > 0 && (
                <button onClick={() => setGroundingStep(groundingStep - 1)} className="btn-ghost flex-1">← Previous</button>
              )}
              {groundingStep < GROUNDING_STEPS.length - 1 ? (
                <button onClick={() => setGroundingStep(groundingStep + 1)} className="btn-primary flex-1">Next Step →</button>
              ) : (
                <button onClick={() => setActiveSection('home')} className="btn-primary flex-1 bg-calm-600">
                  ✅ Exercise Complete!
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── BREATHING LIST ───────────────────────────────────────────────── */}
        {activeSection === 'breathing' && !selectedTechnique && (
          <div className="animate-slide-up">
            <button onClick={() => setActiveSection('home')} className="text-white/40 text-sm hover:text-white/60 mb-6 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-2xl font-display text-white mb-2">Breathing Exercises</h2>
            <p className="text-white/40 text-sm mb-6">Choose a technique and follow the guided timer.</p>
            <div className="space-y-3">
              {BREATHING_TECHNIQUES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTechnique(t)}
                  className="w-full card hover:border-primary-500/30 transition-all text-left flex items-center gap-4"
                >
                  <div className="text-3xl">{t.emoji}</div>
                  <div>
                    <p className="text-white font-semibold">{t.name}</p>
                    <p className="text-white/40 text-sm">{t.subtitle}</p>
                    <div className="flex gap-1 mt-1">
                      {t.phases.map((p, i) => (
                        <span key={i} className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">
                          {p.label} {p.duration}s
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-white/20">›</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── BREATHING EXERCISE PLAYER ────────────────────────────────────── */}
        {activeSection === 'breathing' && selectedTechnique && (
          <div className="animate-slide-up">
            <BreathingExercise
              technique={selectedTechnique}
              onBack={() => setSelectedTechnique(null)}
            />
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
};

export default HelpPage;
