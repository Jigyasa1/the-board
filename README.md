# 📌 The Board — Personal Life Planner

> A warm, minimal life planner built for focus, clarity and progress tracking.  
> Designed for someone navigating a new chapter — job search, new city, new goals.

---

## What is this?

**The Board** is a personal productivity app that replaces scattered notes, spreadsheets and to-do lists with one clean, organised space. It tracks everything that matters during a job search and life transition — applications, research, habits, goals and more.

Built as a personal tool. Not another generic to-do app.

---

## Sections

| Section | What it tracks |
|---|---|
| 💼 Job Applications | Every application with status, role, company, notes and job link |
| 🔎 Company Research | Notes on target companies and roles |
| 📖 Learning & Skills | Courses, books, skills to build |
| 📋 Life & Admin | US admin tasks, errands, setup (SSN, bank, lease etc.) |
| ✍️ Content & Brand | LinkedIn and Instagram content ideas |
| 🚪 Opportunities | Networking leads, freelance options, side ideas |
| ⚡ Health & Fitness | Daily habit tracker — steps, diet, no sugar, strength training |
| 🎯 Goals & Vision | 30-day, 3-month, 1-year and lifetime goals |

---

## Features

- **Cross-device sync** — data lives in the cloud, works on phone and laptop
- **Light / Dark theme** — warm earthy tones, toggles and saves your preference
- **Progress bars** — per section, updates as you complete items
- **Archive** — completed tasks move to a collapsible archive, not deleted
- **Drag to reorder** — organise tasks by priority within each section
- **Daily quote** — fresh quote every day from ZenQuotes API
- **Confetti** — small celebration every time you complete a task
- **Sync settings** — paste your user ID on any new device to instantly sync
- **Auto-save** — every change saves to the database within 2 seconds
- **Mobile ready** — add to home screen on iPhone or Android, works like a native app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Inline styles with theme tokens (no CSS framework) |
| Font | Libre Baskerville / Times New Roman |
| Database | Neon Serverless Postgres |
| API | Vercel Serverless Functions |
| Hosting | Vercel |
| Quotes | ZenQuotes API (proxied through Vercel) |
| Auth | None — simple user ID system for personal use |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- A Vercel account (free)
- A Neon database (free) connected to your Vercel project

### Local Development

```bash
# Clone the repo
git clone https://github.com/Jigyasa1/the-board.git
cd the-board

# Install dependencies
npm install

# Run locally
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variables

The following variable is required — set it in Vercel or a local `.env` file:

```
DATABASE_URL=your_neon_postgres_connection_string
```

> If you connected Neon directly through Vercel Storage, this is set automatically.

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "your message"
git push origin main
```

Vercel auto-deploys on every push to `main`. No extra configuration needed.

---

## 📱 Using on Mobile

1. Open your Vercel URL in **Safari** (iPhone) or **Chrome** (Android)
2. Tap **Share** → **Add to Home Screen**
3. It opens fullscreen like a native app

---

## Syncing Across Devices

The app uses a **User ID** system — no login required.

1. Open the app on your primary device
2. Click **⚙ Sync** in the top right
3. Copy your User ID
4. Open the app on your second device
5. Click **⚙ Sync** → paste the ID → tap **Apply ID & Sync**

Both devices now share the same data permanently.

---

## Database Schema

```sql
CREATE TABLE board_data (
  user_id    TEXT PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Simple and flat — all app data stored as a single JSON blob per user. Easy to extend.

---

## Project Structure

```
the-board/
├── api/
│   ├── load.js        # GET  /api/load  — fetch user data from DB
│   ├── save.js        # POST /api/save  — save user data to DB
│   └── quote.js       # GET  /api/quote — proxy for ZenQuotes API
├── src/
│   ├── App.jsx        # entire frontend — components, themes, logic
│   └── main.jsx       # React entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## Security Notes

- No authentication — designed as a single-user personal tool
- User ID is stored in localStorage — treat it like a password
- Database credentials managed via Vercel + Neon integration
- ZenQuotes API proxied server-side to avoid CORS and hide origin
- If sharing publicly as a template — each visitor gets their own isolated data

---

## Planned Improvements

- [ ] History view — browse what your board looked like on any previous day
- [ ] Multi-user auth — login system for sharing with others
- [ ] Weekly review — summary of what you completed each week
- [ ] Notifications — daily reminder to check in
- [ ] Export to PDF — weekly snapshot of your board

---

## 👤 About

Built by **Jigyasa** — recently moved to the US, navigating a job search and a new chapter.  
This app is a reflection of that journey — practical, personal and built to grow with you.

---
