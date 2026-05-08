# Marxen ERP - Complete Documentation Index

## 📋 Available Documentation

### 1. **SETUP_GUIDE.md** ⭐ START HERE
**Complete 20-step setup walkthrough**
- ✅ Getting Anthropic API key
- ✅ PostgreSQL installation & database creation
- ✅ Backend configuration & startup
- ✅ Frontend configuration & startup
- ✅ Testing every feature
- ✅ Troubleshooting common issues
- ✅ Production deployment

**Time to complete:** 30-45 minutes

### 2. **QUICK_REFERENCE.md** 🚀 QUICK LOOKUP
**Quick commands and troubleshooting**
- Common commands (backend, frontend, database)
- File structure quick map
- Default test accounts
- API endpoint reference
- Database tables overview
- Environment variables reference
- Debugging tips
- 1-minute troubleshooting guide

**Use when:** You need to quickly find a command or reference

### 3. **README.md** 📖 PROJECT OVERVIEW
**General project information**
- Features overview
- Tech stack details
- Installation summary
- Project structure
- API endpoints (brief)
- Environment variables
- Development instructions
- License & support info

**Use when:** You need project overview or context

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   MARXEN ERP SYSTEM                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐              ┌──────────────────────┐
│   FRONTEND (React)   │              │   BACKEND (Express)  │
│   Port: 5173         │◄────REST─────│   Port: 5000         │
├──────────────────────┤    JSON      ├──────────────────────┤
│ • Dashboards         │              │ • API Routes         │
│ • Auth Pages         │              │ • Controllers        │
│ • Voice Input        │              │ • Middleware         │
│ • AI Chat            │              │ • Database Queries   │
│ • Language Switcher  │              │ • Authentication     │
│ • Responsive Design  │              │ • AI Integration     │
└──────────────────────┘              └──────────────────────┘
         ▲                                      ▲
         │                                      │
         │ HTTP/HTTPS                           │ SQL Queries
         │                                      │
         └──────────────────────────────────────┘
                        │
                        ▼
        ┌────────────────────────────┐
        │  PostgreSQL Database       │
        │  - Users (admin, manager,  │
        │    employee)               │
        │  - Attendance Records      │
        │  - Work Items              │
        │  - Companies               │
        │  - Categories              │
        │  - AI Conversations        │
        │  - Audit Logs              │
        └────────────────────────────┘
```

---

## 📂 Directory Tree

```
Marxen/
│
├── README.md                          # Project overview
├── SETUP_GUIDE.md                     # 20-step setup guide ⭐
├── QUICK_REFERENCE.md                 # Quick commands
├── ARCHITECTURE.md                    # This file
│
├── backend/
│   ├── .env                           # Environment config (EDIT THIS!)
│   ├── .env.example                   # Environment template
│   ├── package.json                   # Dependencies
│   ├── server.js                      # Start point (npm run dev)
│   │
│   ├── src/
│   │   ├── app.js                     # Express app setup
│   │   │
│   │   ├── config/
│   │   │   ├── env.js                 # Environment variables
│   │   │   └── database.js            # PostgreSQL connection
│   │   │
│   │   ├── controllers/               # Business logic
│   │   │   ├── authController.js      # Register/login
│   │   │   ├── attendanceController.js # Check-in/out
│   │   │   ├── workController.js      # Work item logging
│   │   │   ├── adminController.js     # Company/team management
│   │   │   └── aiController.js        # AI mentor & recommendations
│   │   │
│   │   ├── routes/                    # API endpoints
│   │   │   ├── auth.js                # /api/auth/*
│   │   │   ├── attendance.js          # /api/attendance/*
│   │   │   ├── work.js                # /api/work/*
│   │   │   ├── admin.js               # /api/admin/*
│   │   │   └── ai.js                  # /api/ai/*
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verification
│   │   │   └── errorHandler.js        # Error handling
│   │   │
│   │   └── utils/
│   │       └── (utilities)
│   │
│   └── migrations/
│       └── 001_init_schema.sql        # Database schema
│
├── frontend/
│   ├── .env                           # Frontend config
│   ├── .env.example                   # Environment template
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── index.html                     # HTML entry point
│   │
│   └── src/
│       ├── main.jsx                   # React entry point
│       ├── App.jsx                    # Main component & routing
│       │
│       ├── components/
│       │   ├── Auth/
│       │   │   └── Login.jsx           # Login/Register page
│       │   │
│       │   ├── Dashboard/
│       │   │   ├── EmployeeDashboard.jsx
│       │   │   └── AdminDashboard.jsx
│       │   │
│       │   ├── Attendance/
│       │   │   └── CheckIn.jsx         # Check-in/out UI
│       │   │
│       │   ├── WorkManagement/
│       │   │   └── WorkLogger.jsx      # Work logging form
│       │   │
│       │   ├── AI/
│       │   │   └── AIMentor.jsx        # AI chat panel
│       │   │
│       │   ├── Voice/
│       │   │   └── VoiceInput.jsx      # Voice check-in
│       │   │
│       │   ├── Common/
│       │   │   ├── Navigation.jsx      # Top navbar
│       │   │   └── LanguageSwitcher.jsx
│       │   │
│       │   └── styles/
│       │       ├── auth.css
│       │       ├── navigation.css
│       │       └── dashboard.css
│       │
│       ├── context/
│       │   └── AuthContext.js          # Global auth state
│       │
│       ├── services/
│       │   └── api.js                  # API client (axios)
│       │
│       ├── i18n/
│       │   ├── config.js               # i18next setup
│       │   ├── en.json                 # English
│       │   ├── ta.json                 # Tamil
│       │   ├── te.json                 # Telugu
│       │   └── hi.json                 # Hindi
│       │
│       ├── styles/
│       │   ├── global.css              # Global styles
│       │   └── theme.css
│       │
│       └── public/
│           └── (static files)
│
└── .gitignore                         # Git ignore rules
```

---

## 🔄 Data Flow Example: Check-In Process

```
┌──────────────────────────┐
│  Employee clicks         │
│  "Check In" button       │
└──────────────┬───────────┘
               │
               ▼
     ┌─────────────────────┐
     │ Frontend API Call   │
     │ POST /attendance/   │
     │      check-in       │
     └────────┬────────────┘
              │
              ▼
     ┌─────────────────────────────┐
     │ Backend Route Handler       │
     │ (src/routes/attendance.js)  │
     └────────┬────────────────────┘
              │
              ▼
     ┌──────────────────────────────────┐
     │ Controller Function              │
     │ checkIn() in                      │
     │ src/controllers/attendance.js     │
     └────────┬─────────────────────────┘
              │
              ▼
     ┌──────────────────────────────────┐
     │ Database Query                   │
     │ INSERT INTO attendance_records    │
     │ check_in_time = NOW()            │
     └────────┬─────────────────────────┘
              │
              ▼
     ┌──────────────────────────────────┐
     │ Database Response                │
     │ (attendance record created)      │
     └────────┬─────────────────────────┘
              │
              ▼
     ┌──────────────────────────────────┐
     │ Return JSON Response             │
     │ {                                │
     │   "message": "Checked in",      │
     │   "attendance": {...}           │
     │ }                                │
     └────────┬─────────────────────────┘
              │
              ▼
     ┌──────────────────────────────────┐
     │ Frontend receives response       │
     │ Updates UI with success message  │
     │ Refreshes attendance data        │
     └──────────────────────────────────┘
```

---

## 🗄️ Database Schema Overview

```
COMPANIES
├─ id (UUID)
├─ name (string)
├─ logo_url (string)
└─ description (text)

USERS
├─ id (UUID)
├─ company_id (FK → companies)
├─ email (string, unique)
├─ password_hash (bcrypt)
├─ first_name, last_name
├─ role (admin/manager/employee)
├─ department, designation
└─ is_active (boolean)

WORK_CATEGORIES
├─ id (UUID)
├─ company_id (FK → companies)
├─ name (string)
├─ description
└─ is_active (boolean)

WORK_ITEMS
├─ id (UUID)
├─ user_id (FK → users)
├─ category_id (FK → work_categories)
├─ title, description
├─ time_spent_minutes
├─ priority (low/medium/high)
├─ status (completed/in_progress/paused)
└─ created_at, updated_at

ATTENDANCE_RECORDS
├─ id (UUID)
├─ user_id (FK → users)
├─ check_in_time
├─ check_out_time
├─ duration_minutes
├─ voice_transcription
└─ status (present/absent/leave)

AI_MENTOR_CONVERSATIONS
├─ id (UUID)
├─ user_id (FK → users)
├─ messages (JSONB) [array of {role, content, timestamp}]
└─ context (JSONB)

AUDIT_LOGS
├─ id (UUID)
├─ user_id (FK → users)
├─ action (string)
├─ entity_type, entity_id
├─ changes (JSONB)
└─ created_at
```

---

## 🔐 Authentication Flow

```
1. USER REGISTERS
   Email + Password → Frontend
        │
        ▼
   Backend hashes password with bcrypt
   Creates user record in database
        │
        ▼
   Returns JWT token
        │
        ▼
   Frontend saves token in localStorage
        │
        ▼
   User is logged in

2. USER LOGS IN
   Email + Password → Frontend
        │
        ▼
   Backend verifies password
        │
        ▼
   Returns JWT token
        │
        ▼
   Frontend saves token

3. AUTHENTICATED REQUEST
   Token in request header:
   Authorization: Bearer eyJhbGc...
        │
        ▼
   Backend verifies token signature
        │
        ▼
   If valid → proceed
   If invalid → return 401
```

---

## 🌐 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": {...},
  "work_item": {...}
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

### Status Codes
- `200` - OK (request succeeded)
- `201` - Created (resource created)
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

---

## 🚀 Deployment Checklist

### Before Going Live

- [ ] Change JWT_SECRET to strong random string
- [ ] Set NODE_ENV=production
- [ ] Use managed PostgreSQL (AWS RDS, Render, Heroku)
- [ ] Configure strong database password
- [ ] Set up HTTPS certificate
- [ ] Test all features with real Anthropic API key
- [ ] Configure monitoring/logging
- [ ] Setup automated backups
- [ ] Load test the application
- [ ] Security audit of API endpoints

### Hosting Options

| Provider | Backend | Frontend | Database |
|----------|---------|----------|----------|
| Heroku | ✅ Yes | ✅ Yes | ✅ Add-on |
| AWS | ✅ EC2/Elastic Beanstalk | ✅ S3/CloudFront | ✅ RDS |
| DigitalOcean | ✅ App Platform | ✅ App Platform | ✅ Managed |
| Render | ✅ Yes | ✅ Yes | ✅ Postgres |
| Vercel | ❌ No* | ✅ Yes | - |

*Vercel is frontend-only, but you can use any backend elsewhere

---

## 📱 Feature Checklist

### Core Features
- ✅ User Authentication (register/login/logout)
- ✅ Role-based Access Control (admin, manager, employee)
- ✅ Attendance Tracking (check-in/check-out)
- ✅ Work Item Logging (with categories)
- ✅ Company Management (setup profile)
- ✅ Team Management (add/edit/remove members)
- ✅ Audit Logging (all actions tracked)

### AI Features
- ✅ AI Mentor Chat (Claude-powered)
- ✅ Work Recommendations (based on history)
- ✅ Productivity Analysis
- ✅ Conversational UI

### Voice Features
- ✅ Voice Check-In (Web Speech API)
- ✅ Voice Transcription
- ✅ Voice Commands Support

### Multilingual
- ✅ English
- ✅ Tamil
- ✅ Telugu
- ✅ Hindi
- ✅ Language Switcher in UI
- ✅ All strings translatable

### Security
- ✅ Password Hashing (bcrypt)
- ✅ JWT Authentication
- ✅ CORS Configuration
- ✅ Role-based Authorization
- ✅ Data Encryption (future)
- ✅ Audit Trail
- ✅ SQL Injection Protection

---

## 🎯 Common Use Cases

### Use Case 1: New Employee Onboarding
1. Admin adds employee via "Add Member"
2. Employee registers with email
3. Employee completes first check-in
4. System starts tracking attendance and work

### Use Case 2: Daily Standup
1. All employees check-in (standard or voice)
2. Log morning work items
3. Chat with AI Mentor for priorities
4. Check team status in admin dashboard

### Use Case 3: End of Day Report
1. Employee logs remaining work items
2. Checks out
3. Views AI-generated productivity summary
4. Conversation stored for future reference

### Use Case 4: Admin Reporting
1. Admin views team status dashboard
2. Exports attendance and productivity reports
3. Reviews audit logs for compliance
4. Adjusts team strategies based on data

---

## 🔧 Customization Guide

### Add New Language
1. Create `frontend/src/i18n/xx.json` (xx = language code)
2. Copy keys from `en.json`
3. Translate all values
4. Edit `frontend/src/i18n/config.js` - add language to resources

### Add New API Endpoint
1. Create controller method in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Add service method in `frontend/src/services/api.js`
4. Create UI component in `frontend/src/components/`

### Add New Database Table
1. Add SQL to `backend/migrations/001_init_schema.sql`
2. Run `npm run migrate` in backend
3. Update controllers to query new table
4. Add API endpoints as needed

---

## 📞 Support Resources

### Documentation Files
- `SETUP_GUIDE.md` - Step-by-step setup (20 steps)
- `QUICK_REFERENCE.md` - Commands & troubleshooting
- `README.md` - Project overview
- `ARCHITECTURE.md` - This file (system design)

### External Resources
- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [i18next Docs](https://www.i18next.com)

---

## 🎓 Learning Path

### Beginner
1. Read README.md
2. Follow SETUP_GUIDE.md steps 1-9
3. Test login and check-in features
4. Explore Admin Dashboard

### Intermediate
5. Test AI Mentor with valid API key
6. Test Voice Check-In
7. Change language to test i18n
8. Review QUICK_REFERENCE.md

### Advanced
9. Modify Login.jsx to customize styling
10. Add new translation language
11. Create new work category via API
12. Review API endpoints in QUICK_REFERENCE.md
13. Deploy to Heroku/Vercel

### Expert
14. Understand database schema
15. Modify database tables
16. Add new API endpoint
17. Customize AI Mentor system prompt
18. Setup production deployment

---

**Last Updated:** May 7, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
