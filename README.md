# 💙 HelpBuddy — Anonymous Mental Health Support Platform

A full-stack web application for anonymous mental health support, featuring real-time chat, WebRTC voice calling, a self-discovery quiz, guided exercises, curated calming music, and emergency helplines.

---

## 🏗 Project Structure

```
helpbuddy/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── socket.js          # Socket.io handler (chat + WebRTC)
│   ├── controllers/
│   │   ├── authController.js  # Signup, login, OTP
│   │   ├── quizController.js  # Quiz scoring & personality
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT middleware
│   │   └── validate.js        # Input validation
│   ├── models/
│   │   ├── User.js            # User model (with OTP hashing)
│   │   ├── Message.js         # Chat messages
│   │   ├── Quiz.js            # Quiz results
│   │   └── Report.js          # User reports
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── quizRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   ├── email.js           # Nodemailer OTP email
│   │   └── helpers.js         # generateOtp()
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Main entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Auth/AuthPage.jsx
    │   │   ├── Dashboard/Dashboard.jsx
    │   │   ├── Chat/ChatPage.jsx
    │   │   ├── Help/HelpPage.jsx
    │   │   ├── Quiz/QuizPage.jsx
    │   │   ├── Music/MusicPage.jsx
    │   │   └── Emergency/EmergencyPage.jsx
    │   ├── utils/
    │   │   ├── api.js         # Axios instance
    │   │   └── socket.js      # Socket.io client
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    ├── .env.example
    └── package.json
```

---

## 🚀 STEP 1: Prerequisites

Install these on your computer:
- **Node.js** v18+ → https://nodejs.org
- **MongoDB Atlas** account → https://mongodb.com/atlas (free tier)
- **Gmail account** with App Password enabled
- **Git** → https://git-scm.com

---

## 🔧 STEP 2: Gmail App Password Setup

1. Go to your Google Account → Security
2. Enable **2-Step Verification**
3. Go to Security → **App Passwords**
4. Select app: "Mail", device: "Other" → type "HelpBuddy"
5. Copy the 16-character password — this is your `EMAIL_PASS`

---

## 🗄 STEP 3: MongoDB Atlas Setup

1. Create free account at https://mongodb.com/atlas
2. Create a free **M0 cluster**
3. Add a database user (remember username & password)
4. Network Access → Add IP → **Allow from anywhere** (0.0.0.0/0)
5. Click **Connect** → Drivers → Copy the connection string
6. Replace `<password>` with your DB user password

---

## ⚙️ STEP 4: Backend Setup

```bash
# Navigate to backend
cd helpbuddy/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
# MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/helpbuddy
# JWT_SECRET=at_least_32_random_characters_here
# EMAIL_USER=your_gmail@gmail.com
# EMAIL_PASS=your_16_char_app_password
# EMAIL_FROM=HelpBuddy <your_gmail@gmail.com>
# FRONTEND_URL=http://localhost:3000

# Start backend (development)
npm run dev

# You should see:
# ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
# 🚀 HelpBuddy server running on port 5000
```

---

## 🎨 STEP 5: Frontend Setup

Open a NEW terminal window:

```bash
# Navigate to frontend
cd helpbuddy/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The .env should contain:
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start frontend
npm start

# Browser opens at http://localhost:3000
```

---

## 🧪 STEP 6: Test the App Locally

1. **Signup**: Enter name, email, phone → receive OTP email → enter OTP → dashboard
2. **Chat**: Click Chat → Find Partner (open two browser tabs with two accounts)
3. **Voice Call**: While matched, click 📞 icon → other user sees incoming call
4. **Help**: Try grounding technique and breathing exercises
5. **Quiz**: Answer all 16 questions → see personality result
6. **Music**: Browse playlists → click any track to play via YouTube
7. **Emergency**: See helpline numbers, click to call

---

## 🌐 STEP 7: Deployment

### Backend → Render.com (Free)

1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo → select `helpbuddy/backend` as root
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add **Environment Variables** (copy from your .env):
   - `MONGO_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_FROM`
   - `FRONTEND_URL` = `https://your-app.vercel.app`
   - `NODE_ENV` = `production`
7. Deploy → copy the URL (e.g., `https://helpbuddy-api.onrender.com`)

### Frontend → Vercel (Free)

1. Go to https://vercel.com → New Project → Import GitHub repo
2. Set root directory to `helpbuddy/frontend`
3. **Framework**: Create React App
4. Add **Environment Variables**:
   - `REACT_APP_API_URL` = `https://helpbuddy-api.onrender.com/api`
   - `REACT_APP_SOCKET_URL` = `https://helpbuddy-api.onrender.com`
5. Deploy → your app is live!

---

## 🔐 Security Features

- OTP hashed with bcrypt before storing (never stored in plain text)
- JWT tokens with expiry
- Rate limiting (10 requests/15 min on auth routes)
- Helmet.js security headers
- Input validation on all endpoints
- Personal data NEVER sent to frontend — only initials
- OTP expires in 10 minutes, max 5 attempts
- CORS restricted to frontend URL

---

## 📊 Analytics API

```
GET /api/analytics/stats
Authorization: Bearer <token>

Response:
{
  "stats": {
    "totalUsers": 150,
    "verifiedUsers": 120,
    "totalMessages": 4300,
    "totalQuizzes": 89,
    "distressBreakdown": { "Low": 30, "Medium": 45, "High": 14 }
  }
}
```

---

## 🆘 Support

For any issues:
- Check backend console for errors
- Check browser console (F12) for frontend errors
- Verify all .env variables are set correctly
- Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0

---

Built with ❤️ for mental health awareness.
