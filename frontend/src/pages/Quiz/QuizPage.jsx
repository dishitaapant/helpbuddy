// pages/Quiz/QuizPage.jsx — Trauma + Personality Quiz
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import api from '../../utils/api';

const SCALE_LABELS = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Neutral',
  4: 'Agree',
  5: 'Strongly Agree',
};

const CATEGORY_INFO = {
  childhood: { label: 'Childhood', emoji: '🧒', color: 'text-amber-400' },
  relationships: { label: 'Relationships', emoji: '💞', color: 'text-pink-400' },
  emotional: { label: 'Emotional Patterns', emoji: '🌊', color: 'text-blue-400' },
  anxiety: { label: 'Anxiety', emoji: '⚡', color: 'text-purple-400' },
};

const distressConfig = {
  Low: { emoji: '🌱', color: 'text-calm-400', bg: 'bg-calm-500/20', border: 'border-calm-500/30', message: 'You\'re showing strong emotional resilience. Keep nurturing your wellbeing.' },
  Medium: { emoji: '🌤️', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', message: 'You\'re navigating some real challenges. Consider talking to a counselor or trusted person.' },
  High: { emoji: '⛈️', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', message: 'You\'re carrying a heavy load. Please reach out to a mental health professional — you deserve support.' },
};

const QuizPage = () => {
  const [phase, setPhase] = useState('intro'); // intro | quiz | result
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [existingResult, setExistingResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkExistingResult();
  }, []);

  const checkExistingResult = async () => {
    try {
      const res = await api.get('/quiz/result');
      if (res.data.result) {
        setExistingResult(res.data.result);
        setResult({ ...res.data.result, scores: res.data.scores });
        setPhase('result');
      }
    } catch {}
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quiz/questions');
      setQuestions(res.data.questions);
      setPhase('quiz');
      setCurrent(0);
      setAnswers({});
    } catch {
      setError('Could not load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value) => {
    const q = questions[current];
    setAnswers({ ...answers, [q.id]: value });
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300);
    }
  };

  const submitQuiz = async () => {
    const responses = questions.map((q) => ({
      questionId: q.id,
      question: q.text,
      answer: answers[q.id] || 3,
    }));

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/quiz/submit', { responses });
      setResult(res.data.result);
      setPhase('result');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0f0f1a] pb-24">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 relative">
        {/* ─── INTRO ─────────────────────────────────────────────────────────── */}
        {phase === 'intro' && (
          <div className="animate-fade-in">
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-float">🧠</div>
              <h1 className="text-3xl font-display text-white mb-3">Self-Discovery Quiz</h1>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                This quiz explores your emotional patterns across 4 areas. There are no right or wrong answers — only honest ones.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8 text-left">
                {Object.values(CATEGORY_INFO).map((cat) => (
                  <div key={cat.label} className="card flex items-center gap-3 py-3">
                    <span className="text-xl">{cat.emoji}</span>
                    <span className={`text-sm font-medium ${cat.color}`}>{cat.label}</span>
                  </div>
                ))}
              </div>

              <div className="card bg-primary-500/10 border-primary-500/20 mb-6 text-left">
                <p className="text-primary-300 text-sm leading-relaxed">
                  🔒 <strong>Confidential:</strong> Your responses are stored securely and used only to generate your personal profile. They are never shared with other users.
                </p>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <button onClick={loadQuestions} disabled={loading} className="btn-primary px-10">
                {loading ? 'Loading...' : 'Begin Quiz →'}
              </button>
            </div>
          </div>
        )}

        {/* ─── QUIZ ──────────────────────────────────────────────────────────── */}
        {phase === 'quiz' && questions.length > 0 && (
          <div className="animate-fade-in">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>Question {current + 1} of {questions.length}</span>
                <span>{answeredCount} answered</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Category badge */}
            {(() => {
              const q = questions[current];
              const cat = CATEGORY_INFO[q.category];
              return (
                <div className="flex items-center gap-2 mb-4">
                  <span>{cat.emoji}</span>
                  <span className={`text-xs font-medium uppercase tracking-wider ${cat.color}`}>{cat.label}</span>
                </div>
              );
            })()}

            {/* Question */}
            <div className="card mb-6" style={{ minHeight: 120 }}>
              <p className="text-white text-lg leading-relaxed font-medium">
                {questions[current].text}
              </p>
            </div>

            {/* Scale */}
            <div className="space-y-2 mb-6">
              {[1, 2, 3, 4, 5].map((val) => {
                const selected = answers[questions[current].id] === val;
                return (
                  <button
                    key={val}
                    onClick={() => handleAnswer(val)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                      selected
                        ? 'bg-primary-500/20 border-primary-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected ? 'border-primary-400 bg-primary-500' : 'border-white/20'
                    }`}>
                      {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm">{SCALE_LABELS[val]}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {current > 0 && (
                <button onClick={() => setCurrent(current - 1)} className="btn-ghost flex-1">← Back</button>
              )}
              {current < questions.length - 1 ? (
                <button
                  onClick={() => setCurrent(current + 1)}
                  disabled={!answers[questions[current].id]}
                  className="btn-primary flex-1"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={submitQuiz}
                  disabled={answeredCount < questions.length || loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Analyzing...' : answeredCount < questions.length
                    ? `Answer all ${questions.length - answeredCount} remaining`
                    : 'Get My Results ✓'}
                </button>
              )}
            </div>

            {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
          </div>
        )}

        {/* ─── RESULT ────────────────────────────────────────────────────────── */}
        {phase === 'result' && result && (
          <div className="animate-slide-up">
            <h1 className="text-3xl font-display text-white mb-6 text-center">Your Profile</h1>

            {/* Distress Level */}
            {(() => {
              const dc = distressConfig[result.distressLevel];
              return (
                <div className={`card ${dc.bg} ${dc.border} mb-4 text-center`}>
                  <div className="text-4xl mb-2">{dc.emoji}</div>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Distress Level</p>
                  <p className={`text-2xl font-display font-bold ${dc.color} mb-2`}>{result.distressLevel}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{dc.message}</p>
                </div>
              );
            })()}

            {/* Personality Type */}
            <div className="card mb-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Personality Type</p>
              <p className="text-white text-xl font-display font-semibold mb-2">{result.personalityType}</p>
              <p className="text-white/60 text-sm leading-relaxed">{result.description}</p>
            </div>

            {/* Score Breakdown */}
            {result.scores && (
              <div className="card mb-6">
                <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Score Breakdown</p>
                {['anxiety', 'childhood', 'relationships', 'emotional'].map((cat) => {
                  const score = result.scores[cat] || 0;
                  const pct = ((score - 1) / 4) * 100;
                  const catInfo = CATEGORY_INFO[cat];
                  return (
                    <div key={cat} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`font-medium ${catInfo.color}`}>{catInfo.emoji} {catInfo.label}</span>
                        <span className="text-white/40">{score}/5</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: pct > 66 ? '#ef4444' : pct > 33 ? '#f97316' : '#10b989' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => { setPhase('intro'); setResult(null); }}
              className="btn-ghost w-full text-sm"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
      <Navbar />
    </div>
  );
};

export default QuizPage;
