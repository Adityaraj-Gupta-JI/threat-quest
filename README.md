# ThreatQuest

**ThreatQuest** is a gamified cybersecurity platform that helps users understand digital risks through phishing scans, credential exposure checks, and a game-like security dashboard.

---

## Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Credits](#credits)
- [License](#license)

---

## About

ThreatQuest turns cybersecurity awareness into an interactive experience.  
Users can scan URLs for phishing risks, check emails for possible breaches, track their security score, earn XP, and unlock badges through a clean RPG-style interface.

The goal of the project is to make security feel simple, visual, and engaging instead of technical and intimidating.

---

## Features

- Secure user authentication with Supabase.
- Profile system linked to authenticated users.
- URL phishing scan endpoint.
- Email exposure scan endpoint.
- Security score and XP tracking.
- Badge and reward system.
- Dashboard summary with scan history.
- API-first backend design for frontend integration.
- Mock-first development support with MSW.

---

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS

### Backend
- Next.js Route Handlers
- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Zod for validation

### Development Tools
- MSW for mock APIs
- VS Code Thunder Client for API testing
- GitHub for version control
- Vercel for deployment

---

## Architecture

ThreatQuest uses a split workflow:

- The frontend team builds the website and connects to API routes.
- The backend team manages logic, database access, authentication, scoring, and badges.
- Supabase stores profiles, scans, and rewards.
- Route handlers act as the bridge between the frontend and Supabase.

### Core flow
1. User logs in.
2. Frontend sends request to backend API route.
3. Backend validates input and checks Supabase.
4. Backend stores or fetches data.
5. Frontend displays the result.

---

## Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd threatquest
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Create a `.env.local` file and add your Supabase values.

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_API_MOCKING=enabled
```

Note: disable MSW in production.

---

## Running the Project

### Development
```bash
npm run dev
```

### Production build
```bash
npm run build
npm start
```

---

## API Endpoints

### Profile
- `GET /api/profile`
- `PUT /api/profile`

### Dashboard
- `GET /api/dashboard`

### Scans
- `POST /api/scan/url`
- `POST /api/scan/email`

### Rewards
- `POST /api/badges/award`

### Score
- `POST /api/user/update-score`

---

## Deployment

The project is designed for deployment with:

- Frontend on Vercel
- Backend on Vercel or a Next.js hosting platform
- Database and auth on Supabase

Before deploying, make sure:
- all environment variables are set,
- MSW is disabled,
- Supabase auth URLs are updated,
- RLS policies are enabled.

---

## Credits

Built for the MIC Hackathon by the ThreatQuest team.

Special thanks to:
- Supabase
- Next.js
- MSW
- Vercel

---

## License

This project is currently for hackathon/demo use.