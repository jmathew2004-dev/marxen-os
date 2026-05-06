# Marxen ERP - Complete Step-by-Step Setup Guide

## Prerequisites
- Node.js 16+ (download from https://nodejs.org)
- PostgreSQL 13+ (download from https://www.postgresql.org/download)
- Anthropic API Key (get from https://console.anthropic.com)

---

## STEP 1: Get Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up or login to your Anthropic account
3. Navigate to "API Keys" section
4. Click "Create Key"
5. Copy the API key (looks like: `sk-ant-...`)
6. Save it somewhere safe - **you'll need this later**

---

## STEP 2: Setup PostgreSQL Database

### On Mac (using Homebrew):
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb marxen

# Verify connection
psql marxen
```

Type `\q` to exit PostgreSQL prompt.

### On Windows:
1. Download installer from https://www.postgresql.org/download/windows
2. Run installer, set password (remember this!)
3. Open "pgAdmin" (included with PostgreSQL)
4. Right-click "Databases" → "Create" → "Database"
5. Name it: `marxen`
6. Click "Save"

### On Linux (Ubuntu/Debian):
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb marxen

# Verify
sudo -u postgres psql -l
```

---

## STEP 3: Configure Backend

### 3.1 Navigate to backend folder
```bash
cd /Users/judahmathew/Marxen/backend
```

### 3.2 Edit the `.env` file
Open `backend/.env` in a text editor and update:

```
# Database Configuration (keep as is if default)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marxen
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=marxen

# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=dev-secret-key-marxen-change-in-production
JWT_EXPIRES_IN=7d

# CLAUDE API - PASTE YOUR API KEY HERE ⭐
CLAUDE_API_KEY=sk-ant-YOUR-API-KEY-HERE

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `sk-ant-YOUR-API-KEY-HERE` with your actual Anthropic API key

### 3.3 Verify node_modules are installed
```bash
# Check if node_modules exists
ls -la | grep node_modules

# If not, install:
npm install
```

### 3.4 Run database migrations
```bash
npm run migrate
```

You should see: "Database migration completed"

---

## STEP 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
Environment: development
Database: localhost:5432/marxen
```

**Keep this terminal open!** The backend is now running.

---

## STEP 5: Configure Frontend

### 5.1 Open new terminal and navigate to frontend
```bash
cd /Users/judahmathew/Marxen/frontend
```

### 5.2 Check .env file
Open `frontend/.env` and verify:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_VOICE=true
```

### 5.3 Verify node_modules are installed
```bash
ls -la | grep node_modules

# If not, install:
npm install
```

---

## STEP 6: Start Frontend Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Keep this terminal open too!** The frontend is now running.

---

## STEP 7: Test the Application

### 7.1 Open Browser
Go to: http://localhost:5173

You should see the Marxen login page.

### 7.2 Register as Admin
1. Click "Register" tab
2. Fill in:
   - First Name: `Admin`
   - Last Name: `User`
   - Email: `admin@marxen.com`
   - Password: `Admin123!`
   - Company Name: `MyCompany`
3. Click "Register"
4. You'll be logged in automatically

---

## STEP 8: Setup Company Profile

### 8.1 Go to Admin Panel
1. Click "Admin" in top navigation
2. You're in "Company Setup" tab

### 8.2 Fill Company Details
- Company Name: `My Awesome Company`
- Description: `A great team building amazing products`
- Logo URL: (optional, leave blank for now)
3. Click "Submit"

You should see: "✅ Company setup successful"

---

## STEP 9: Add Team Members

### 9.1 Click "Team Management" tab
You'll see "Add Member" form

### 9.2 Add First Team Member
1. Email: `john@marxen.com`
2. First Name: `John`
3. Last Name: `Doe`
4. Role: `employee`
5. Click "Add Member"

You should see: "✅ Team member added"

### 9.3 Add More Members
Repeat with:
- `jane@marxen.com` - Jane Smith
- `mike@marxen.com` - Mike Johnson

---

## STEP 10: Login as Employee

### 10.1 Logout as Admin
1. Click your name in top right
2. Click "Logout"

### 10.2 Login as Employee
1. Email: `john@marxen.com`
2. Password: `[temporary password shown in admin panel]`

**Note:** If you don't have the temporary password, register directly:
1. Click "Register"
2. Fill as John:
   - First Name: John
   - Last Name: Doe
   - Email: john@marxen.com
   - Password: John123!
   - Company Name: MyCompany (same as admin created)

---

## STEP 11: Test Check-In

### 11.1 Click "Attendance" Tab
You see two buttons:
- "Check In" (standard)
- "Voice Check In" (voice-based)

### 11.2 Standard Check-In
1. Click "Check In" button
2. You should see: "✅ Check In success"
3. You're now checked in for today

### 11.3 Check-Out
1. Click "Check Out" button
2. You should see: "✅ Check Out success"
3. Duration is automatically calculated

---

## STEP 12: Log Work

### 12.1 Click "Work" Tab
You see "Add Work" form

### 12.2 Log Work Item
1. Title: `Developed new API endpoint`
2. Work Category: (click dropdown, if empty, that's ok for now)
3. Description: `Built REST API for user management`
4. Time Spent: `120` (minutes)
5. Priority: `High`
6. Status: `Completed`
7. Click "Log Work"

You should see: "✅ Work logged successfully"

### 12.3 View Work History
Below the form, you'll see your logged work items.

---

## STEP 13: Test AI Mentor

### 13.1 Click "AI Mentor" Tab
You see:
- Recommendations section (AI suggestions)
- Message box (chat interface)

### 13.2 Chat with AI
1. Type in message box: `What should I work on next?`
2. Click "Send"
3. AI will respond with suggestions based on your work history

**Note:** Only works if CLAUDE_API_KEY is valid in backend .env

---

## STEP 14: Test Voice Check-In

### 14.1 Go to Attendance Tab
1. Click "Voice Check In" button
2. Click "Start Recording"

### 14.2 Speak
Say: `"I'm checking in"`

### 14.3 Stop Recording
1. Click "Stop Recording"
2. You'll see transcription appear
3. System checks you in automatically

**Requirements:**
- Microphone access enabled
- HTTPS or localhost (browser requirement)
- Chrome/Edge browsers work best

---

## STEP 15: Test Bilingual Support

### 15.1 Find Language Switcher
Top right of navigation bar, before your name.

### 15.2 Change Language
1. Click dropdown
2. Select: Tamil / Telugu / Hindi
3. ALL UI text changes instantly!

Try all 4 languages:
- English 🇬🇧
- Tamil 🇮🇳
- Telugu 🇮🇳
- Hindi 🇮🇳

---

## STEP 16: Back to Admin - View Team Status

### 16.1 Logout from Employee
Click your name → "Logout"

### 16.2 Login as Admin
1. Email: `admin@marxen.com`
2. Password: (whatever you set during registration)

### 16.3 View Team Attendance
1. Click "Admin"
2. Click "Team Management"
3. You see all team members listed
4. Can add/edit/remove members

---

## STEP 17: Troubleshooting

### Issue: Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# If port is used, kill the process or change PORT in .env
```

### Issue: Frontend won't start
```bash
# Check if port 5173 is in use
lsof -i :5173

# If port is used, kill the process
```

### Issue: Database connection error
```bash
# Check PostgreSQL is running
psql marxen

# If error, start PostgreSQL
brew services start postgresql  # Mac
sudo systemctl start postgresql  # Linux
```

### Issue: AI Mentor not responding
1. Check CLAUDE_API_KEY in backend .env
2. Verify key is valid (starts with sk-ant-)
3. Check backend logs for errors
4. Restart backend server

### Issue: Voice not working
1. Allow microphone access in browser
2. Use Chrome or Edge browser
3. Must be on localhost or HTTPS
4. Check browser console for errors

---

## STEP 18: Common Tasks

### Add New Work Category
**Currently:** No admin UI for this. You can:

Option 1: Use API directly
```bash
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SaaS Development",
    "description": "Building SaaS features"
  }'
```

Option 2: Contact us - we can add category management UI

### Change User Password
Not implemented yet. Users must:
1. Register again with new email
2. Or manually update in database

### Export Attendance Report
Not implemented yet. You can query database:
```bash
psql marxen
SELECT * FROM attendance_records WHERE DATE(check_in_time) = TODAY;
```

### Clear Data / Reset
```bash
# Drop and recreate database
dropdb marxen
createdb marxen

# Rerun migrations
cd backend
npm run migrate
```

---

## STEP 19: Next Steps / Feature Requests

### Want to add features?
Edit these files:

**New API Endpoint:**
1. Backend: `backend/src/controllers/` (add function)
2. Backend: `backend/src/routes/` (add route)
3. Frontend: `frontend/src/services/api.js` (add call)

**New UI Component:**
1. Create file in `frontend/src/components/`
2. Add translations to `frontend/src/i18n/*.json`
3. Import in main component

**New Database Table:**
1. Edit `backend/migrations/001_init_schema.sql`
2. Run: `npm run migrate` in backend

---

## STEP 20: Production Deployment

### Before going live:

**Security:**
1. Change JWT_SECRET in backend .env
2. Use strong database password
3. Use production Anthropic API key
4. Set NODE_ENV=production

**Environment:**
1. Use HTTPS (not HTTP)
2. Use managed database (AWS RDS, etc.)
3. Deploy backend to AWS/Heroku/DigitalOcean
4. Deploy frontend to Vercel/Netlify
5. Update FRONTEND_URL in backend .env

**Example (Heroku):**
```bash
cd backend
heroku create marxen-api
git push heroku main
heroku config:set CLAUDE_API_KEY=sk-ant-...
```

---

## Final Checklist

✅ PostgreSQL installed and running
✅ Backend server running on :5000
✅ Frontend running on :5173
✅ Can register/login
✅ Can check-in and check-out
✅ Can log work items
✅ Can chat with AI Mentor
✅ Bilingual UI works
✅ Voice check-in works

---

## Support & Help

**If something doesn't work:**

1. Check error message in browser console (F12)
2. Check backend logs (terminal where npm run dev was run)
3. Verify .env files are correctly configured
4. Try restarting both servers
5. Clear browser cache (Ctrl+Shift+Delete)
6. Check network tab in DevTools (F12)

---

**🎉 Congratulations! Your Marxen ERP system is ready to use!**

Start with step 1 and follow through. Each step builds on the previous one.

Have fun! 🚀
