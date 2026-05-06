# Marxen ERP - Quick Reference Card

## 🚀 Quick Start (3 Commands)

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Open browser
http://localhost:5173
```

---

## 📁 File Structure Quick Map

```
Marxen/
├── backend/
│   ├── .env              ← Add CLAUDE_API_KEY here
│   ├── server.js         ← Start point
│   ├── src/
│   │   ├── app.js        ← Express setup
│   │   ├── controllers/  ← Business logic
│   │   ├── routes/       ← API endpoints
│   │   └── config/       ← Database & env
│   └── migrations/       ← Database schema
│
├── frontend/
│   ├── .env              ← API base URL
│   ├── src/
│   │   ├── App.jsx       ← Main component
│   │   ├── components/   ← React components
│   │   ├── services/     ← API calls
│   │   ├── i18n/         ← Translations
│   │   └── styles/       ← CSS
│   └── index.html        ← HTML entry
│
└── SETUP_GUIDE.md        ← Full step-by-step guide
```

---

## 🔧 Common Commands

### Backend Commands
```bash
cd backend

npm install              # Install dependencies
npm run dev            # Start dev server (port 5000)
npm run migrate        # Run database migrations
npm start              # Start production server
```

### Frontend Commands
```bash
cd frontend

npm install            # Install dependencies
npm run dev           # Start dev server (port 5173)
npm run build         # Build for production
npm run preview       # Preview production build
```

### Database Commands
```bash
# Connect to database
psql marxen

# List tables
\dt

# View specific table
SELECT * FROM users;

# Exit
\q
```

---

## 🔐 Default Test Accounts

### Admin Account
```
Email: admin@marxen.com
Password: Admin123!
Role: admin
```

### Employee Accounts (create these)
```
Email: john@marxen.com
Password: John123!
Role: employee

Email: jane@marxen.com
Password: Jane123!
Role: employee
```

---

## 🌍 Languages (i18n)

Switch language in top navigation dropdown:
- **English** - en.json
- **Tamil** - ta.json
- **Telugu** - te.json
- **Hindi** - hi.json

To add new language:
1. Create `frontend/src/i18n/xx.json` (xx = language code)
2. Copy structure from en.json
3. Translate all strings
4. Add to config: `frontend/src/i18n/config.js`

---

## 🔌 API Quick Reference

### Auth
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Attendance
```bash
POST /api/attendance/check-in
POST /api/attendance/check-out
GET /api/attendance/today
GET /api/attendance/history
GET /api/attendance/team-status
```

### Work
```bash
GET /api/work/categories
POST /api/work/log-work
GET /api/work/my-work
GET /api/work/team-work
PUT /api/work/:id
DELETE /api/work/:id
```

### Admin
```bash
POST /api/admin/company/setup
PUT /api/admin/company/:id
POST /api/admin/users
GET /api/admin/users
PUT /api/admin/users/:id
DELETE /api/admin/users/:id
```

### AI
```bash
POST /api/ai/mentor/message
GET /api/ai/mentor/history
GET /api/ai/work/recommend
```

---

## 📊 Database Tables

```
companies          ← Company profiles
users              ← All users (admin, manager, employee)
attendance_records ← Check-in/check-out logs
work_items         ← Work logged by users
work_categories    ← Categories for work
ai_mentor_conversations ← AI chat history
audit_logs         ← All actions logged
```

---

## 🔑 Environment Variables

### Backend (.env)
```
DATABASE_URL             ← PostgreSQL connection
JWT_SECRET              ← Secret key for tokens
CLAUDE_API_KEY          ← Anthropic API key ⭐
PORT                    ← Server port (default 5000)
FRONTEND_URL            ← Frontend URL for CORS
```

### Frontend (.env)
```
VITE_API_BASE_URL       ← Backend API URL
VITE_ENABLE_VOICE       ← Enable voice features
```

---

## 🎯 Test Flow

1. **Register** - Create admin account
2. **Setup Company** - Admin panel → company name/logo
3. **Add Team** - Admin panel → add employees
4. **Check-In** - Employee dashboard → Check In button
5. **Log Work** - Work tab → Add Work button
6. **AI Chat** - AI Mentor tab → send message
7. **Change Language** - Top right dropdown
8. **Check-Out** - Attendance tab → Check Out button

---

## 🐛 Debugging

### Check backend logs
```
Terminal where "npm run dev" is running
Look for error messages and SQL logs
```

### Check frontend errors
```
Browser DevTools → Console (F12)
Network tab → Check API requests
```

### Check database
```bash
psql marxen
SELECT * FROM users;
SELECT * FROM attendance_records;
```

---

## ❌ Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Port 5000 already in use | `lsof -i :5000` then kill process |
| Port 5173 already in use | `lsof -i :5173` then kill process |
| DB connection error | Verify PostgreSQL running: `psql marxen` |
| AI not responding | Check CLAUDE_API_KEY in .env |
| Login fails | Verify email/password, check DB |
| Voice not working | Use Chrome/Edge, allow microphone |
| Language not changing | Clear browser cache (Ctrl+Shift+Del) |

---

## 📚 File Edit Locations

Want to modify something?

| What | Where |
|------|-------|
| Login UI | `frontend/src/components/Auth/Login.jsx` |
| Dashboard | `frontend/src/components/Dashboard/*.jsx` |
| API routes | `backend/src/routes/*.js` |
| Business logic | `backend/src/controllers/*.js` |
| Database schema | `backend/migrations/001_init_schema.sql` |
| Translations | `frontend/src/i18n/*.json` |
| Styling | `frontend/src/styles/` |

---

## 🚢 Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist
```

### Deploy to Vercel (Recommended)
```bash
npm i -g vercel
vercel
# Follow prompts
```

### Deploy Backend to Heroku
```bash
heroku create marxen-api
git push heroku main
heroku config:set CLAUDE_API_KEY=sk-ant-...
```

---

## 💡 Pro Tips

1. **Keep terminals open** - Backend & Frontend both need to run
2. **Check .env files** - Most issues are wrong config
3. **Restart servers** - After changing .env, restart both
4. **Use DevTools** - F12 in browser for debugging
5. **Check logs** - Terminal output tells you everything
6. **Test locally first** - Before deploying

---

## 📞 Getting Help

1. Read SETUP_GUIDE.md (detailed 20-step guide)
2. Check README.md (overview & features)
3. Look at error messages in console/terminal
4. Verify .env configuration
5. Test with curl/Postman if API issue

---

**Start with:** `cd backend && npm run dev` in one terminal, `cd frontend && npm run dev` in another. Open http://localhost:5173. Done! 🎉
