# Marxen ERP - Attendance & Work Management System

A modern, bilingual (English, Tamil, Telugu, Hindi) ERP system for office team management with AI-powered recommendations, voice integration, and multi-tenant architecture.

## Features

- 👥 **Attendance Tracking** - Check-in/check-out with voice support
- 💼 **Work Management** - Log and track work items by category
- 🤖 **AI Mentor** - Claude-powered assistant for productivity tips
- 🎤 **Voice Commands** - Browser-based voice input for quick actions
- 🌍 **Multilingual** - Full support for English, Tamil, Telugu, and Hindi
- 👨‍💼 **Dual Dashboards** - Separate admin and employee interfaces
- 🔐 **Secure** - JWT authentication with encrypted data storage

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React 18 + Vite
- **Database**: PostgreSQL
- **AI**: Anthropic Claude API
- **Voice**: Browser Web Speech API
- **i18n**: i18next

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 13+
- Anthropic API Key (for AI features)

## Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb marxen

# Or use psql
psql -U postgres
CREATE DATABASE marxen;
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Update .env with your database credentials and API keys
nano .env

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

Server will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

App will be available at `http://localhost:5173`

## Project Structure

```
Marxen/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── models/        # Database models
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & error handling
│   │   └── utils/         # Utilities
│   ├── migrations/        # Database migrations
│   └── server.js         # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── services/      # API calls
    │   ├── context/       # Global state
    │   ├── i18n/          # Translations
    │   └── styles/        # CSS files
    └── index.html        # HTML entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/today` - Today's status
- `GET /api/attendance/history` - Attendance history

### Work Items
- `GET /api/work/categories` - Get work categories
- `POST /api/work/log-work` - Log work item
- `GET /api/work/my-work` - Get user's work items
- `PUT /api/work/:id` - Update work item
- `DELETE /api/work/:id` - Delete work item

### AI Mentor
- `POST /api/ai/mentor/message` - Send message to AI
- `GET /api/ai/mentor/history` - Get conversation history
- `GET /api/ai/work/recommend` - Get work recommendations

### Admin
- `POST /api/admin/company/setup` - Create company
- `POST /api/admin/users` - Add team member
- `GET /api/admin/users` - List team members
- `PUT /api/admin/users/:id` - Update team member
- `DELETE /api/admin/users/:id` - Remove team member

## Usage

### For Admin Users
1. Register/Login with admin credentials
2. Go to Admin Panel
3. Setup company profile (name, logo, description)
4. Add team members with email and role
5. View team attendance and productivity reports

### For Employees
1. Register/Login
2. Check in/out (standard or voice)
3. Log work items with category and time spent
4. Chat with AI Mentor for productivity tips
5. Switch language as needed

### Voice Check-in
1. Click "Voice Check In"
2. Click "Start Recording"
3. Say "I'm checking in" (or any message)
4. Click "Stop Recording"
5. System will process and check you in

### Bilingual Support
1. Use language switcher in top navigation
2. Choose from English, Tamil, Telugu, or Hindi
3. All UI text updates instantly
4. Preference saved in browser

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/marxen
JWT_SECRET=your-secret-key
CLAUDE_API_KEY=your-anthropic-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_VOICE=true
```

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Frontend build
cd frontend && npm run build

# Output in frontend/dist
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check connection string in .env
- Run migrations: `npm run migrate`

### AI Mentor Not Working
- Verify CLAUDE_API_KEY in backend .env
- Check API key has proper permissions
- View backend logs for errors

### Voice Not Working
- Ensure HTTPS or localhost (browser requirement)
- Check microphone permissions in browser
- Try different browser (Chrome/Edge recommended)

### Language Not Changing
- Clear browser cache
- Check localStorage for language preference
- Verify translation files exist

## Production Deployment

### Docker Setup
```bash
docker-compose up --build
```

### Environment Setup
- Use strong JWT_SECRET
- Set secure database password
- Use production Anthropic API key
- Set FRONTEND_URL to your domain

### Database Backup
```bash
pg_dump marxen > backup.sql

# Restore
psql marxen < backup.sql
```

## Contributing

This is a team project. Please:
1. Create feature branches
2. Test thoroughly before committing
3. Update translations for new UI strings
4. Document API changes

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check existing issues in repo
- Review API documentation
- Check translation files for language support
