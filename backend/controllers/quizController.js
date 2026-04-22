// controllers/quizController.js — Quiz Submission & Scoring
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// ─── Quiz Questions (sent to frontend) ───────────────────────────────────────
const QUIZ_QUESTIONS = [
  // Childhood Section
  { id: 'c1', category: 'childhood', text: 'I felt emotionally supported by my parents/caregivers growing up.' },
  { id: 'c2', category: 'childhood', text: 'I experienced trauma or significant loss during childhood.' },
  { id: 'c3', category: 'childhood', text: 'I often felt lonely or isolated as a child.' },
  { id: 'c4', category: 'childhood', text: 'I was able to express my feelings freely as a child.' },

  // Relationship Section
  { id: 'r1', category: 'relationships', text: 'I find it easy to trust people in close relationships.' },
  { id: 'r2', category: 'relationships', text: 'I often worry about being abandoned by people I care about.' },
  { id: 'r3', category: 'relationships', text: 'I tend to put others\' needs before my own in relationships.' },
  { id: 'r4', category: 'relationships', text: 'I find it difficult to set healthy boundaries with others.' },

  // Emotional Patterns Section
  { id: 'e1', category: 'emotional', text: 'I frequently feel overwhelmed by my emotions.' },
  { id: 'e2', category: 'emotional', text: 'I struggle to identify what I\'m feeling in the moment.' },
  { id: 'e3', category: 'emotional', text: 'I often replay past situations and dwell on them.' },
  { id: 'e4', category: 'emotional', text: 'I find it hard to calm myself when I\'m anxious or upset.' },

  // Anxiety Section
  { id: 'a1', category: 'anxiety', text: 'I experience physical symptoms of anxiety (racing heart, sweating, etc.).' },
  { id: 'a2', category: 'anxiety', text: 'Worry interferes with my daily activities and sleep.' },
  { id: 'a3', category: 'anxiety', text: 'I avoid situations that make me feel anxious.' },
  { id: 'a4', category: 'anxiety', text: 'I feel a sense of dread about the future most days.' },
];

// ─── Scoring Logic ────────────────────────────────────────────────────────────
// Each answer is 1-5 (1=Strongly Disagree, 5=Strongly Agree)
// Some questions are "negative" (higher = worse), some are "positive" (higher = better)
const NEGATIVE_QUESTIONS = ['c1', 'c4', 'r1']; // High score = good → invert

const calculateScore = (responses) => {
  let categoryScores = { anxiety: 0, childhood: 0, relationships: 0, emotional: 0 };
  let categoryCounts = { anxiety: 0, childhood: 0, relationships: 0, emotional: 0 };

  responses.forEach(({ questionId, answer, question }) => {
    const q = QUIZ_QUESTIONS.find((q) => q.id === questionId);
    if (!q) return;

    // Invert positive questions so high score always means more distress
    let adjustedScore = NEGATIVE_QUESTIONS.includes(questionId) ? 6 - answer : answer;
    categoryScores[q.category] += adjustedScore;
    categoryCounts[q.category]++;
  });

  // Average each category
  Object.keys(categoryScores).forEach((cat) => {
    if (categoryCounts[cat] > 0) {
      categoryScores[cat] = +(categoryScores[cat] / categoryCounts[cat]).toFixed(2);
    }
  });

  // Overall distress score (avg of all categories)
  const total = +(
    Object.values(categoryScores).reduce((a, b) => a + b, 0) /
    Object.keys(categoryScores).length
  ).toFixed(2);

  return { ...categoryScores, total };
};

// ─── Personality Typing Logic ─────────────────────────────────────────────────
const determinePersonality = (scores, responses) => {
  const { anxiety, childhood, relationships, emotional } = scores;

  // High empathy + relationship focus
  if (relationships >= 3.5 && emotional >= 3.5) {
    return { type: 'Empathetic Nurturer', description: 'You deeply feel others\' emotions and often prioritize their needs. Your empathy is a gift, but remember to nurture yourself too.' };
  }

  // High anxiety + avoidance
  if (anxiety >= 3.5 && responses.find(r => r.questionId === 'a3' && r.answer >= 4)) {
    return { type: 'Anxious Avoider', description: 'You tend to manage anxiety by avoiding triggering situations. This makes sense, but gradually facing fears with support can lead to lasting relief.' };
  }

  // High childhood trauma + rumination
  if (childhood >= 3.5 && emotional >= 3.0) {
    return { type: 'Reflective Processor', description: 'Past experiences deeply shape how you feel today. You often revisit memories as your mind tries to make sense of things — therapy can help transform this into healing.' };
  }

  // High overall but functional
  if (scores.total >= 3.0 && scores.total < 3.5) {
    return { type: 'Resilient Striver', description: 'Despite facing real challenges, you continue moving forward. Your resilience is admirable — but don\'t be afraid to ask for help when the load feels heavy.' };
  }

  // Low scores (healthy)
  if (scores.total < 2.5) {
    return { type: 'Grounded & Balanced', description: 'You show strong emotional foundations and generally healthy patterns. Keep nurturing your mental wellbeing and supporting those around you.' };
  }

  // Introvert-analytical fallback
  return { type: 'Introspective Thinker', description: 'You have a rich inner world and tend to process experiences deeply. While this gives you wisdom, sharing your feelings with trusted others can lighten the load.' };
};

// ─── Distress Level ───────────────────────────────────────────────────────────
const getDistressLevel = (total) => {
  if (total < 2.5) return 'Low';
  if (total < 3.5) return 'Medium';
  return 'High';
};

// ─── POST /api/quiz/submit ────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    const { responses } = req.body;

    if (!responses || !Array.isArray(responses) || responses.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please answer all quiz questions.',
      });
    }

    // Validate responses
    for (const r of responses) {
      if (!r.questionId || !r.question || r.answer < 1 || r.answer > 5) {
        return res.status(400).json({
          success: false,
          message: 'Invalid response format.',
        });
      }
    }

    const scores = calculateScore(responses);
    const distressLevel = getDistressLevel(scores.total);
    const personality = determinePersonality(scores, responses);

    // Upsert quiz result (update if already done)
    const quiz = await Quiz.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        responses,
        scores,
        result: {
          distressLevel,
          personalityType: personality.type,
          description: personality.description,
        },
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update user's quick-access quiz result
    await User.findByIdAndUpdate(req.userId, {
      'quizResult.distressLevel': distressLevel,
      'quizResult.personalityType': personality.type,
      'quizResult.completedAt': new Date(),
    });

    return res.status(200).json({
      success: true,
      result: {
        distressLevel,
        personalityType: personality.type,
        description: personality.description,
        scores,
      },
    });
  } catch (error) {
    console.error('Quiz Submit Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during quiz submission.' });
  }
};

// ─── GET /api/quiz/questions ──────────────────────────────────────────────────
const getQuestions = async (req, res) => {
  return res.status(200).json({ success: true, questions: QUIZ_QUESTIONS });
};

// ─── GET /api/quiz/result ─────────────────────────────────────────────────────
const getResult = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ user: req.userId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'No quiz result found. Please take the quiz.' });
    }
    return res.status(200).json({ success: true, result: quiz.result, scores: quiz.scores });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { submitQuiz, getQuestions, getResult };
