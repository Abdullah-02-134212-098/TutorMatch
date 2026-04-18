# TutorMatch PK 🎓

> Pakistan's trusted home tutor marketplace connecting students with verified tutors across Karachi

[![Live Demo](https://img.shields.io/badge/demo-live-success)](YOUR_LIVE_URL)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📖 Overview

TutorMatch PK is a full-stack web platform that connects students and parents with verified home tutors in Pakistan. Students can search for tutors by subject, area, board, and class level for free, while tutors pay per lead to access student contact information.

### Why TutorMatch PK?

- **🔐 Trust First**: All tutors are CNIC-verified before going live
- **💰 Pay-Per-Lead**: Tutors pay only Rs. 100-300 per student contact (no subscription needed)
- **📚 Pakistan-Focused**: Supports Sindh, Federal, Punjab, O/A Levels, Aga Khan, IB, and University boards
- **📍 Karachi-First**: Covers 40+ areas across Karachi with plans to expand
- **🇵🇰 Pakistani Payments**: Manual JazzCash/Easypaisa verification (API integration planned)

---

## ✨ Features

### For Students
- 🔍 Search tutors by subject, board, class level, and area
- 👁️ View full tutor profiles (subjects, fee range, boards, areas, ratings)
- 📋 Submit tutor requests with phone number and requirements
- ✅ Contact verified, CNIC-checked tutors

### For Tutors
- 📊 Dashboard to browse open student leads
- 🔓 Unlock leads by paying Rs. 100-300 (via JazzCash/Easypaisa screenshot)
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
- **React.js** - Component-based UI
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Tools & Services
- **Postman** - API testing
- **Git & GitHub** - Version control
- **Vercel** - Frontend hosting (planned)
- **Render** - Backend hosting (planned)
- **Cloudinary** - Image hosting (planned)

---

## 📂 Project Structure

```
TutorMatch/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components (Navbar, etc.)
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TutorDashboard.jsx
│   │   │   ├── TutorProfileSetup.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── context/        # React Context (Auth)
│   │   ├── services/       # API service (axios)
│   │   ├── utils/          # Helper functions, constants
│   │   └── App.jsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Database connection
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   ├── Tutor.js
│   │   ├── Lead.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── controllers/        # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Auth, admin checks
│   └── server.js
├── .env                    # Environment variables
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ and npm
- MongoDB Atlas account (free tier)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/tutormatch-pk.git
cd tutormatch-pk
```

2. **Setup Backend**
```bash
cd server
npm install
```

Create `.env` file in root:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key_here
```

3. **Setup Frontend**
```bash
cd client
npm install
```

4. **Run the application**

Terminal 1 (Backend):
```bash
cd server
node server.js
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user (protected)
```

### Tutors
```
GET    /api/tutors           - Get all verified tutors (public)
GET    /api/tutors/:id       - Get single tutor (public)
GET    /api/tutors/me        - Get own profile (protected)
POST   /api/tutors           - Create profile (protected)
PUT    /api/tutors/me        - Update profile (protected)
```

### Leads
```
POST   /api/leads            - Create lead (public)
GET    /api/leads            - Get all leads (tutor protected)
GET    /api/leads/:id        - Get single lead (tutor protected)
POST   /api/leads/:id/unlock - Unlock lead (tutor protected)
```

### Admin (Admin only)
```
GET    /api/admin/stats              - Get dashboard stats
POST   /api/admin/approve-tutor/:id  - Approve tutor
POST   /api/admin/reject-tutor/:id   - Reject tutor
POST   /api/admin/verify-payment/:id - Verify payment & unlock lead
POST   /api/admin/reject-payment/:id - Reject payment
```

---

## 🎨 Screenshots

### Home Page
*Smart search with autocomplete, featured tutors section, how it works*

### Search Results
*Tutor cards showing subjects, boards, areas, fees, ratings, CNIC verified badge*

### Tutor Dashboard
*Browse leads, unlock with payment, view profile status*

### Admin Panel
*Stats dashboard, pending tutors, pending payments*

---

## 🇵🇰 Pakistan-Specific Features

### Education Boards Supported
- Sindh Board (Matric, Intermediate)
- Federal Board (SSC, HSSC)
- Punjab Board
- Cambridge (O Level, A Level)
- Aga Khan Board
- IB (MYP, DP)
- University (BS, BBA, MBA, Engineering)

### Karachi Areas Covered
40+ areas including DHA Phase 1-8, Clifton, Gulshan, North Nazimabad, PECHS, Malir, Korangi, and more.

### Payment Methods
- JazzCash (manual screenshot verification)
- Easypaisa (manual screenshot verification)
- API integration planned for Month 2-3

---

## 📊 Database Schema

### User
```javascript
{
  name, email, passwordHash, phone,
  role: ['student', 'tutor', 'admin'],
  city, isVerified, createdAt
}
```

### Tutor
```javascript
{
  userId, subjects[], boards[], levels[], areas[],
  feeRange: { min, max },
  bio, photo, cnic,
  isVerified, plan, rating, totalReviews,
  featured, featuredUntil
}
```

### Lead
```javascript
{
  studentId, studentName, studentPhone (encrypted),
  subject, board, level, area, description,
  status: ['open', 'pending', 'unlocked', 'closed', 'expired'],
  unlockedBy: [{ tutorId, paidAt }],
  createdAt, expiresAt (30 days)
}
```

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Student, Tutor, Admin)
- ✅ Protected routes middleware
- ✅ CNIC verification for tutors
- ✅ Student phone number encryption (planned)
- ✅ Rate limiting (planned)

---

## 🚧 Roadmap

### Phase 1 - MVP (Weeks 1-6) ✅
- [x] Core authentication
- [x] Tutor profiles with board/subject/area filters
- [x] Lead creation and unlocking
- [x] Manual payment verification
- [x] Admin panel

### Phase 2 - Growth (Month 2-3)
- [ ] JazzCash/Easypaisa API integration
- [ ] WhatsApp notifications
- [ ] In-app messaging (student ↔ tutor)
- [ ] Review system
- [ ] Map view for tutor coverage
- [ ] Urdu language toggle

### Phase 3 - Scale (Month 4-6)
- [ ] Expand to Lahore and Islamabad
- [ ] Mobile app (React Native)
- [ ] AI-powered tutor matching
- [ ] Background check integration
- [ ] Tutor subscription plans
- [ ] SEO optimization

---

## 💰 Monetization

| Feature | Free | Pro (Rs. 1,500/mo) |
|---------|------|-------------------|
| Profile visible | ✅ | ✅ |
| Leads/month | 3 | Unlimited |
| Search ranking | Normal | Higher |
| Verified badge | ❌ | ✅ |
| WhatsApp alerts | ❌ | ✅ |

**Pay-Per-Lead Pricing:**
- Matric/Primary: Rs. 100
- Intermediate/ICS/ICOM: Rs. 150
- O/A Level: Rs. 250-300
- University: Rs. 200

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Abdullah**  
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Built with guidance from the Claude AI assistant
- Inspired by the need for trusted home tutors in Pakistan
- Thanks to the Pakistani EdTech community

---

## 📞 Support

For support, email tutormatchpk@gmail.com or open an issue on GitHub.

---

**Built with ❤️ for Pakistan's students and tutors**
