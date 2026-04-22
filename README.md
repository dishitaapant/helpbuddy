
## 🚀 Live Project

👉 Try it here: https://helpbuddy-six.vercel.app

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





