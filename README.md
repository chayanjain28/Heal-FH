# 🏥 Heal From Home — Intelligent Post-Discharge Care Companion

A full-stack, production-ready healthcare platform with AI-powered recovery assistance, built with React, Node.js, MongoDB, and GROQ API.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- GROQ API Key ([Get one free](https://console.groq.com))

---

### 1. Clone & Setup

```bash
cd heal-from-home
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

**Edit `.env`:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healfromhome
JWT_SECRET=your_super_secret_key_min_32_chars
GROQ_API_KEY=gsk_your_groq_key_here
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**  
Backend runs on: **http://localhost:5000**

---

### 4. Seed Sample Doctors

After starting the backend, run:
```bash
curl -X POST http://localhost:5000/api/doctors/seed
```

Or just visit the **Doctors** page — it auto-seeds on empty database.

---

## 🏗️ Project Structure

```
heal-from-home/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # JWT auth
│   │   ├── healthLogController.js   # Vitals + auto-alerts
│   │   ├── recoveryController.js    # Recovery score + AI prediction
│   │   ├── doctorController.js      # Doctor discovery
│   │   ├── appointmentController.js # Booking system
│   │   └── aiController.js          # GROQ AI integration
│   ├── models/
│   │   ├── User.js                  # Role-based users
│   │   ├── PatientProfile.js        # Patient details
│   │   ├── HospitalRecord.js        # Hospitalization history
│   │   ├── HealthLog.js             # Vitals & symptoms
│   │   ├── Medication.js            # Medications + adherence
│   │   ├── Doctor.js                # Doctor profiles
│   │   ├── Appointment.js           # Appointments
│   │   ├── RecoveryPlan.js          # Dynamic recovery plans
│   │   ├── Alert.js                 # Health alerts
│   │   └── MedicalReport.js         # AI-analyzed reports
│   ├── middleware/
│   │   └── auth.js                  # JWT middleware
│   ├── routes/                      # All API routes
│   ├── server.js                    # Express server
│   └── .env.example
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.js       # Animated hero page
        │   ├── LoginPage.js         # JWT login
        │   ├── RegisterPage.js      # Registration
        │   ├── Dashboard.js         # Recovery score + charts
        │   ├── HealthLogs.js        # Vitals logging + trends
        │   ├── Medications.js       # Medication tracker
        │   ├── Doctors.js           # Find & book doctors
        │   ├── Appointments.js      # Appointment management
        │   ├── AIAssistant.js       # GROQ-powered chat
        │   ├── Reports.js           # AI report analyzer
        │   ├── HospitalRecords.js   # Hospital history
        │   ├── Alerts.js            # Health alerts
        │   └── Profile.js           # Patient profile
        ├── components/
        │   ├── Sidebar.js           # Animated sidebar
        │   ├── TopBar.js            # Top navigation
        │   └── common/AppLayout.js  # Layout wrapper
        ├── context/
        │   ├── AuthContext.js       # Auth state
        │   └── ThemeContext.js      # Light/dark theme
        ├── utils/api.js             # Axios instance
        └── index.css                # Glassmorphism theme
```

---

## ✨ Features

### AI Features (GROQ-Powered)
| Feature | Description |
|---|---|
| 💬 **AI Chat Assistant** | MedAI answers health questions in plain language |
| 🔬 **Report Analyzer** | Extracts medications, diagnoses, restrictions from reports |
| 🧠 **Complication Predictor** | Rule-based risk scoring from vitals |
| 📈 **Health Insights** | Trend analysis and personalized suggestions |

### Clinical Features
| Feature | Description |
|---|---|
| 📊 **Recovery Score** | 0-100 dynamic score (vitals + meds + activity + sleep) |
| 🚨 **Smart Alerts** | Auto-generated when vitals exceed thresholds |
| 💊 **Medication Tracker** | Log taken/missed doses with adherence tracking |
| 🏥 **Hospital Records** | Complete discharge history with doctor notes |
| 📅 **Appointment System** | Book, manage, and track follow-ups |
| 👨‍⚕️ **Doctor Discovery** | Filter by specialization, rating, fee |

---

## 🎨 UI Design

- **Glassmorphism**: Frosted glass cards with blur effects
- **Light Mode**: Blue → Green gradient palette
- **Dark Mode**: Cyan → Green → Amber gradient
- **Animations**: Framer Motion page transitions, micro-interactions
- **Charts**: Chart.js with custom styling
- **Responsive**: Mobile + desktop layouts

---

## 📡 API Endpoints

```
POST   /api/auth/register         Register user
POST   /api/auth/login            Login
GET    /api/auth/me               Get current user

POST   /api/health-logs           Log vitals
GET    /api/health-logs/trend     Get vital trends

GET    /api/recovery/score        Get recovery score (0-100)
GET    /api/recovery/predict      AI complication prediction
GET    /api/recovery/dashboard    Full dashboard data

GET    /api/doctors               List/search doctors
POST   /api/appointments          Book appointment

POST   /api/ai/chat               AI chat (GROQ)
POST   /api/ai/analyze-report     AI report analysis (GROQ)
GET    /api/ai/insights           Health insights (GROQ)

GET    /api/alerts                Get health alerts
POST   /api/medications           Add medication
```

---

## 🔐 Authentication

- JWT Bearer tokens stored in localStorage
- 7-day expiry with auto-redirect on 401
- Role-based: `patient`, `caregiver`, `doctor`, `admin`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Framer Motion |
| **Charts** | Chart.js + react-chartjs-2 |
| **Styling** | CSS Variables + Glassmorphism (no Tailwind) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **AI** | GROQ API (llama-3.3-70b-versatile) |
| **Auth** | JWT + bcryptjs |
| **Security** | Helmet, CORS, Rate Limiting |

---

## 🌐 Environment Variables

```env
# Backend
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healfromhome
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NODE_ENV=development

# Frontend (optional)
REACT_APP_API_URL=http://localhost:5000/api
```
