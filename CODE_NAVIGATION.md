# 🗺️ Marxen ERP - Feature to Code Navigation Guide

**Quick Links to Show Your Team the Code for Each Feature**

---

## 🤖 **AI Mentor Feature**

### Frontend (What users see)
- **Main Component:** `frontend/src/components/AI/AIMentor.jsx`
- **Used in:** `frontend/src/components/Dashboard/EmployeeDashboard.jsx`

### Backend (What powers it)
- **Controller:** `backend/src/controllers/aiController.js`
- **Routes:** `backend/src/routes/ai.js`

### API Endpoints
```
POST /api/ai/mentor/message     - Send message to AI
GET /api/ai/mentor/history      - Get conversation history
GET /api/ai/work/recommend      - Get work recommendations
```

### How to Show Your Team:
1. Open: `frontend/src/components/AI/AIMentor.jsx` (UI code)
2. Open: `backend/src/controllers/aiController.js` (Logic code)
3. Explain: How Claude API integration works

---

## 👥 **Authentication & Login**

### Frontend (User sees login page)
- **Login Form:** `frontend/src/components/Auth/Login.jsx`
- **Register Form:** `frontend/src/components/Auth/Register.jsx`
- **Auth State:** `frontend/src/context/AuthContext.jsx` (Manages login state)

### Backend (Handles authentication)
- **Controller:** `backend/src/controllers/authController.js`
- **Routes:** `backend/src/routes/auth.js`
- **Middleware:** `backend/src/middleware/auth.js` (JWT verification)

### API Endpoints
```
POST /api/auth/register    - Create new user account
POST /api/auth/login       - Login with email/password
POST /api/auth/logout      - Logout
```

### How to Show Your Team:
1. Show: Login UI in `frontend/src/components/Auth/Login.jsx`
2. Show: How credentials are validated in `backend/src/controllers/authController.js`
3. Show: JWT token handling in `backend/src/middleware/auth.js`

---

## ⏰ **Attendance Tracking (Check-in/Check-out)**

### Frontend (What users interact with)
- **Check-in Component:** `frontend/src/components/Attendance/CheckIn.jsx`
- **Attendance Display:** `frontend/src/components/Attendance/` (folder)
- **Voice Check-in:** `frontend/src/components/Voice/VoiceInput.jsx`

### Backend (Processes attendance)
- **Controller:** `backend/src/controllers/attendanceController.js`
- **Routes:** `backend/src/routes/attendance.js`
- **Database:** `backend/migrations/001_init_schema.sql` (see `attendance_records` table)

### API Endpoints
```
POST /api/attendance/check-in     - Record check-in
POST /api/attendance/check-out    - Record check-out
GET /api/attendance/today         - Get today's status
GET /api/attendance/history       - Get attendance history
```

### How to Show Your Team:
1. Show: Check-in UI in `frontend/src/components/Attendance/CheckIn.jsx`
2. Show: Backend logic in `backend/src/controllers/attendanceController.js`
3. Show: Database schema in `backend/migrations/001_init_schema.sql`

---

## 💼 **Work Management & Logging**

### Frontend (Work logging interface)
- **Work Logger:** `frontend/src/components/WorkManagement/WorkLogger.jsx`
- **Work List:** `frontend/src/components/WorkManagement/` (folder)
- **Dashboard Display:** `frontend/src/components/Dashboard/EmployeeDashboard.jsx`

### Backend (Work tracking)
- **Controller:** `backend/src/controllers/workController.js`
- **Routes:** `backend/src/routes/work.js`
- **Database:** `backend/migrations/001_init_schema.sql` (see `work_items` table)

### API Endpoints
```
POST /api/work/log-work          - Log new work item
GET /api/work/my-work            - Get user's work items
PUT /api/work/:id                - Update work item
DELETE /api/work/:id             - Delete work item
GET /api/work/categories         - Get work categories
```

### How to Show Your Team:
1. Show: Work UI in `frontend/src/components/WorkManagement/WorkLogger.jsx`
2. Show: Backend in `backend/src/controllers/workController.js`
3. Show: Database schema in `backend/migrations/001_init_schema.sql`

---

## 👨‍💼 **Admin Dashboard & Team Management**

### Frontend (Admin sees this)
- **Admin Dashboard:** `frontend/src/components/Dashboard/AdminDashboard.jsx`
- **Team Management:** `frontend/src/components/Admin/` (folder)
- **Company Setup:** `frontend/src/components/Admin/CompanySetup.jsx`

### Backend (Admin operations)
- **Controller:** `backend/src/controllers/adminController.js`
- **Routes:** `backend/src/routes/admin.js`

### API Endpoints
```
POST /api/admin/company/setup          - Create company
POST /api/admin/users                  - Add team member
GET /api/admin/users                   - List team members
PUT /api/admin/users/:id               - Update team member
DELETE /api/admin/users/:id            - Remove team member
```

### How to Show Your Team:
1. Show: Admin UI in `frontend/src/components/Dashboard/AdminDashboard.jsx`
2. Show: Team management in `backend/src/controllers/adminController.js`
3. Explain: Role-based access control

---

## 🌐 **Multilingual Support (English, Tamil, Telugu, Hindi)**

### Frontend (Language switching)
- **Language Switcher:** `frontend/src/components/Common/LanguageSwitcher.jsx`
- **i18n Config:** `frontend/src/i18n/config.js`
- **Translation Files:** `frontend/src/i18n/locales/` (en.json, ta.json, te.json, hi.json)

### How to Show Your Team:
1. Show: `frontend/src/i18n/` folder
2. Show: Language switcher UI
3. Show: How translations work in config

---

## 🎤 **Voice Commands & Voice Check-in**

### Frontend (Voice input)
- **Voice Component:** `frontend/src/components/Voice/VoiceInput.jsx`
- **Used in:** `frontend/src/components/Attendance/CheckIn.jsx`

### Backend (Processes voice data)
- **Voice handling:** Part of `attendanceController.js`

### How to Show Your Team:
1. Show: Voice UI in `frontend/src/components/Voice/VoiceInput.jsx`
2. Show: How it's integrated in attendance check-in
3. Explain: Browser Web Speech API usage

---

## 📊 **Navigation & Layout**

### Frontend Main Components
- **Main App:** `frontend/src/App.jsx` (Routing setup)
- **Navigation Bar:** `frontend/src/components/Common/Navigation.jsx`
- **Layout:** `frontend/src/components/Common/` (Shared components)

### How to Show Your Team:
1. Show: `frontend/src/App.jsx` (routing structure)
2. Show: `frontend/src/components/Common/` (shared UI)

---

## 🗄️ **Database Schema**

### All tables defined in:
- **Location:** `backend/migrations/001_init_schema.sql`

### Tables:
```
1. companies           - Company profiles
2. users              - User accounts & roles
3. work_categories    - Work task categories
4. work_items         - Work logging
5. attendance_records - Check-in/out records
6. ai_mentor_conversations - Chat history
7. audit_logs         - Audit trail
```

---

## 🔐 **Security & Middleware**

### Authentication
- **Location:** `backend/src/middleware/auth.js`
- **What it does:** Verifies JWT tokens on protected routes

### Error Handling
- **Location:** `backend/src/middleware/errorHandler.js`
- **What it does:** Catches and handles errors globally

### How to Show Your Team:
1. Show: `backend/src/middleware/auth.js` (JWT verification)
2. Show: `backend/src/middleware/errorHandler.js` (error handling)

---

## 📁 **File Quick Reference**

### By Feature:

| Feature | Frontend | Backend |
|---------|----------|---------|
| **AI Mentor** | `components/AI/AIMentor.jsx` | `controllers/aiController.js` |
| **Auth/Login** | `components/Auth/Login.jsx` | `controllers/authController.js` |
| **Attendance** | `components/Attendance/CheckIn.jsx` | `controllers/attendanceController.js` |
| **Work** | `components/WorkManagement/WorkLogger.jsx` | `controllers/workController.js` |
| **Admin** | `components/Dashboard/AdminDashboard.jsx` | `controllers/adminController.js` |
| **Voice** | `components/Voice/VoiceInput.jsx` | (in attendanceController) |
| **Languages** | `i18n/config.js` | (none) |
| **Navigation** | `components/Common/Navigation.jsx` | `routes/*.js` |

---

## 🚀 **How to Show Code to Your Team**

### Method 1: Direct File Navigation in VS Code
1. Open VS Code Explorer (left sidebar)
2. Navigate: `backend/src/controllers/` → Click `aiController.js`
3. Show the code directly to team
4. Explain the logic

### Method 2: Show Both Frontend & Backend
1. Open Split Editor: `Ctrl+\` (or Cmd+\)
2. Left Side: Frontend UI code
3. Right Side: Backend logic code
4. Walk through the flow together

### Method 3: Share via Terminal Commands
```bash
# Show AI Controller
cat backend/src/controllers/aiController.js

# Show Authentication
cat backend/src/middleware/auth.js

# Show Frontend Component
cat frontend/src/components/AI/AIMentor.jsx
```

### Method 4: Open in Code Presentation Mode
1. Press `Ctrl+K Ctrl+P` (or Cmd+K Cmd+P)
2. VS Code enters presentation mode
3. Perfect for showing code to team!

---

## 💡 **Quick Show & Tell Scenarios**

### "Let me show you how AI Mentor works"
```
1. Open: frontend/src/components/AI/AIMentor.jsx (UI)
2. Open: backend/src/controllers/aiController.js (Logic)
3. Explain: Claude API integration
4. Show: API endpoint in routes/ai.js
```

### "Here's how authentication works"
```
1. Open: frontend/src/context/AuthContext.jsx (State)
2. Open: backend/src/controllers/authController.js (Logic)
3. Open: backend/src/middleware/auth.js (JWT verification)
4. Explain: Token flow
```

### "Let me show you the database design"
```
1. Open: backend/migrations/001_init_schema.sql
2. Show: All 7 tables
3. Explain: Relationships and constraints
4. Show: Data flow
```

### "Here's the attendance tracking system"
```
1. Open: frontend/src/components/Attendance/CheckIn.jsx (UI)
2. Open: backend/src/controllers/attendanceController.js (Logic)
3. Show: API endpoints
4. Explain: Database table structure
```

---

## 📂 **Complete File Structure Map**

```
Marxen/
├── backend/src/
│   ├── controllers/
│   │   ├── aiController.js          ← AI Mentor logic
│   │   ├── authController.js        ← Login/Register logic
│   │   ├── attendanceController.js  ← Check-in/out logic
│   │   ├── workController.js        ← Work logging logic
│   │   └── adminController.js       ← Admin operations
│   ├── routes/
│   │   ├── ai.js                    ← AI endpoints
│   │   ├── auth.js                  ← Auth endpoints
│   │   ├── attendance.js            ← Attendance endpoints
│   │   ├── work.js                  ← Work endpoints
│   │   └── admin.js                 ← Admin endpoints
│   ├── middleware/
│   │   ├── auth.js                  ← JWT verification
│   │   └── errorHandler.js          ← Error handling
│   ├── config/
│   │   ├── database.js              ← Database setup
│   │   └── env.js                   ← Environment config
│   └── app.js                       ← Express setup
│
├── frontend/src/
│   ├── components/
│   │   ├── AI/AIMentor.jsx          ← AI Chat UI
│   │   ├── Auth/
│   │   │   ├── Login.jsx            ← Login page
│   │   │   └── Register.jsx         ← Register page
│   │   ├── Attendance/
│   │   │   └── CheckIn.jsx          ← Check-in UI
│   │   ├── WorkManagement/
│   │   │   └── WorkLogger.jsx       ← Work logging UI
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.jsx   ← Admin dashboard
│   │   │   └── EmployeeDashboard.jsx ← Employee dashboard
│   │   ├── Voice/
│   │   │   └── VoiceInput.jsx       ← Voice commands
│   │   └── Common/
│   │       ├── Navigation.jsx       ← Top navigation
│   │       └── LanguageSwitcher.jsx ← Language switcher
│   ├── context/
│   │   └── AuthContext.jsx          ← Login state management
│   ├── i18n/
│   │   ├── config.js                ← Translation setup
│   │   └── locales/                 ← Language files
│   ├── services/
│   │   └── api.js                   ← API client
│   ├── App.jsx                      ← Main app component
│   └── main.jsx                     ← App entry point
│
└── backend/
    ├── migrations/
    │   └── 001_init_schema.sql      ← Database tables
    └── server.js                     ← Server entry point
```

---

## ✨ **Pro Tip for Showing Code to Team**

**Use VS Code Extensions:**
1. Install "REST Client" - Test API endpoints directly in VS Code
2. Install "Thunder Client" - API testing tool
3. Use "Peacock" - Color-code VS Code windows (one color per feature)

This way you can:
- Show frontend code in window 1
- Show backend code in window 2
- Test API in window 3
- All color-coded for clarity!

---

**Now you can easily navigate and show your team exactly where each feature's code is located!** 🎯

Click on any file path above in VS Code and it will open immediately. Share this guide with your team! 📚
