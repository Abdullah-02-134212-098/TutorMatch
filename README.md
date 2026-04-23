# TutorMatch PK 🎓

> Pakistan's trusted home tutor marketplace connecting students with verified tutors across Karachi

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://tutor-match-pk.vercel.app/)

---

## 📖 Overview

TutorMatch PK is a full-stack web platform that connects students and parents with verified home tutors in Pakistan. Students can search for tutors by subject, area, board, and class level for free, while tutors pay per lead to access student contact information.

### Why TutorMatch PK?

- **🔐 Trust First** — All tutors are CNIC-verified before going live
- **💰 Pay-Per-Lead** — Tutors pay only Rs. 100–300 per student contact (no subscription needed)
- **📚 Pakistan-Focused** — Supports Sindh, Federal, Punjab, O/A Levels, Aga Khan, IB, and University boards
- **📍 Karachi-First** — Covers 40+ areas across Karachi with plans to expand
- **🇵🇰 Pakistani Payments** — Manual JazzCash/Easypaisa verification (API integration planned)

---

## ✨ Features

### For Students
- 🔍 Search tutors by subject, board, class level, and area
- 👁️ View full tutor profiles (subjects, fee range, boards, areas, ratings)
- 📋 Submit tutor requests with phone number and requirements
- ✅ Contact verified, CNIC-checked tutors

### For Tutors
- 📊 Dashboard to browse open student leads
- 🔓 Unlock leads by paying Rs. 100–300 (via JazzCash/Easypaisa screenshot)
- ⭐ Build profile with subjects, boards, levels, areas, and bio
- 📈 Track lead history and payment status
- 🎯 Get matched with relevant students based on profile

### For Admins
- 🛡️ Approve/reject tutor applications
- 💳 Verify payment screenshots and unlock leads
- 📊 Revenue dashboard with key metrics
- 🌟 Feature tutors on homepage

---

## 🛠️ Tech Stack

### Frontend
- **React.js** — Component-based UI
- **Vite** — Fast build tool
- **Tailwind CSS** — Utility-first styling
- **React Router DOM** — Client-side routing
- **Axios** — HTTP client

### Backend
- **Node.js** — Runtime environment
- **Express.js v5** — Web framework
- **MongoDB Atlas** — Cloud database
- **Mongoose** — ODM for MongoDB
- **JWT** — Authentication tokens
- **bcryptjs** — Password hashing
- **Nodemailer** — Email notifications

### Deployment
- **Vercel** — Frontend + Backend (serverless)
- **MongoDB Atlas** — Cloud database

---

## 📂 Project Structure

```
TutorMatch/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TutorDashboard.jsx
│   │   │   ├── TutorProfileSetup.jsx
│   │   │   ├── TutorPublicProfile.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios instance with VITE_API_URL
│   │   ├── utils/
│   │   │   ├── boards.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json             # SPA rewrite rule for React Router
│   ├── vite.config.js
│   └── package.json
├── server/                    # Node.js backend
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tutorController.js
│   │   ├── leadController.js
│   │   ├── adminController.js
│   │   ├── paymentController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── adminOnly.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Tutor.js
│   │   ├── Lead.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tutors.js
│   │   ├── leads.js
│   │   ├── payments.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── server.js
│   ├── vercel.json             # Routes all requests to server.js
│   └── package.json
└── .env                       # Local environment variables (never commit)
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- npm
- MongoDB Atlas account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/TutorMatch.git
cd TutorMatch
```

### 2. Create `.env` file in the root

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_secret_key_here
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Install & run the backend

```bash
cd server
npm install
node server.js
```

Backend runs at: `http://localhost:5000`

### 4. Install & run the frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

> The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically.

---

## ☁️ Deployment (Vercel)

Both frontend and backend are deployed separately on Vercel.

### Backend Deployment

```bash
cd server
npx vercel --prod
```

Set these environment variables in **Vercel Dashboard → tutormatch-server → Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your JWT secret key |
| `EMAIL_USER` | Gmail address |
| `EMAIL_PASS` | Gmail app password |
| `CLIENT_URL` | `https://tutormatch-client.vercel.app` |

### Frontend Deployment

```bash
cd client
npx vercel --prod
```

Set this environment variable in **Vercel Dashboard → tutormatch-client → Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://tutormatch-server.vercel.app/api` |

### MongoDB Atlas — Allow All IPs

In MongoDB Atlas → **Network Access** → **Add IP Address** → select **Allow Access from Anywhere** (`0.0.0.0/0`). Required because Vercel uses dynamic IPs.

### Verify Deployment

```
https://tutormatch-server.vercel.app/ping
```
Should return: `{ "pong": true, "time": "..." }`

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register         Register new user
POST   /api/auth/login            Login user
GET    /api/auth/me               Get current user (protected)
```

### Tutors
```
GET    /api/tutors                Get all verified tutors (public)
GET    /api/tutors/:id            Get single tutor (public)
GET    /api/tutors/me             Get own profile (protected)
POST   /api/tutors                Create tutor profile (protected)
PUT    /api/tutors/me             Update tutor profile (protected)
```

### Leads
```
POST   /api/leads                 Create lead (public)
GET    /api/leads                 Get all leads (tutor protected)
GET    /api/leads/:id             Get single lead (tutor protected)
POST   /api/leads/:id/unlock      Unlock lead (tutor protected)
```

### Admin (Admin only)
```
GET    /api/admin/stats                  Dashboard stats
POST   /api/admin/approve-tutor/:id      Approve tutor
POST   /api/admin/reject-tutor/:id       Reject tutor
POST   /api/admin/verify-payment/:id     Verify payment & unlock lead
POST   /api/admin/reject-payment/:id     Reject payment
```

### Reviews
```
POST   /api/reviews               Submit review
GET    /api/reviews/:tutorId      Get tutor reviews
```

---

## 📊 Database Schema

### User
```js
{ name, email, passwordHash, phone, role: ['student','tutor','admin'], city, isVerified, createdAt }
```

### Tutor
```js
{ userId, subjects[], boards[], levels[], areas[], feeRange: { min, max }, bio, photo, cnic,
  isVerified, plan, rating, totalReviews, featured, featuredUntil }
```

### Lead
```js
{ studentId, studentName, studentPhone, subject, board, level, area, description,
  status: ['open','pending','unlocked','closed','expired'],
  unlockedBy: [{ tutorId, paidAt }], createdAt, expiresAt }
```

### Payment
```js
{ tutorId, leadId, amount, method: ['jazzcash','easypaisa'], screenshotUrl, status: ['pending','verified','rejected'] }
```

---

## 🔒 Security

- JWT-based stateless authentication
- Password hashing with bcryptjs
- Role-based access control (Student / Tutor / Admin)
- Protected route middleware on all sensitive endpoints
- CNIC verification required before tutor goes live
- CORS restricted to frontend origin via `CLIENT_URL` env var

---

## 🇵🇰 Pakistan-Specific

### Education Boards Supported
Sindh Board, Federal Board, Punjab Board, Cambridge O/A Level, Aga Khan Board, IB (MYP/DP), University (BS/BBA/MBA/Engineering)

### Karachi Areas Covered
40+ areas including DHA Phase 1–8, Clifton, Gulshan, North Nazimabad, PECHS, Malir, Korangi, Saddar, Gulistan-e-Johar, and more.

### Payment Methods
- JazzCash (manual screenshot verification)
- Easypaisa (manual screenshot verification)
- API integration planned

---

## 💰 Monetization

**Pay-Per-Lead Pricing:**

| Level | Price |
|-------|-------|
| Matric / Primary | Rs. 100 |
| Intermediate / ICS / ICOM | Rs. 150 |
| O Level / A Level | Rs. 300 |
| University | Rs. 200 |

---

## 🚧 Roadmap

### Phase 1 — MVP ✅
- [x] Auth (register/login/JWT)
- [x] Tutor profiles with filters
- [x] Lead creation & unlocking
- [x] Manual payment verification
- [x] Admin panel
- [x] Deployed on Vercel

### Phase 2 — Growth
- [ ] JazzCash/Easypaisa API integration
- [ ] WhatsApp notifications (Twilio)
- [ ] In-app messaging
- [ ] Review system
- [ ] Map view for tutor coverage
- [ ] Urdu language toggle

### Phase 3 — Scale
- [ ] Expand to Lahore & Islamabad
- [ ] Mobile app (React Native)
- [ ] AI-powered tutor matching
- [ ] Tutor subscription plans
- [ ] SEO optimization

---

**Built with ❤️ for Pakistan's students and tutors**
