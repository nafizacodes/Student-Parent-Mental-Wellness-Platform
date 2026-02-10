# 🧠 MindBloom — Student & Parent Mental Wellness Platform

A full-stack responsive web application for student emotional well-being tracking with privacy-respecting parent monitoring.

## Features

- 🎭 **Daily Mood Tracking** — Emoji-based mood, stress & energy levels, private journal
- 📊 **Dashboard Analytics** — Chart.js mood/stress trends, wellness score, streak counter
- 👨‍👩‍👧 **Parent Dashboard** — Link to student, weekly/monthly summaries, high-stress alerts
- 🎮 **Stress-Relief Games** — Bubble Pop, Breathing Exercise, Color Therapy
- 🎵 **Calming Music** — Web Audio ambient tones (nature, rain, instrumental)
- 📚 **Resources** — Recommended books, helplines, educational articles
- 🌍 **Multi-Language** — English, Hindi, Spanish
- 🌙 **Dark Mode** — Toggle between light and dark themes
- 🔐 **Privacy** — Parents cannot access student journal entries

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18, Chart.js, react-i18next |
| Backend | Node.js + Express |
| Database | SQLite (via sql.js) |
| Auth | JWT + bcryptjs |

## Getting Started

### 1. Install Dependencies

```bash
npm install # Root dependencies (concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. Run Application (Concurrent)

Run both backend and frontend with a single command from the project root:

```bash
npm start
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Alternative: Run Separately

**Backend**:
```bash
cd server
npm start
```

**Frontend**:
```bash
cd client
npm run dev
```

### 4. Usage

1. Register as a **Student** or **Parent**
2. **Students**: Complete daily check-ins, view dashboard, play games, listen to music
3. **Parents**: Link to student via email, view weekly/monthly summaries

## ⚠️ Disclaimer

This application is designed for wellness tracking purposes only and is not a substitute for professional medical advice.
