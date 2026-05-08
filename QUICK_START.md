# Marxen ERP - Quick Start Guide

Welcome to Marxen ERP! This guide will help you get started quickly.

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 13+ (for database)
- **Docker** (optional, for containerized deployment)
- **Anthropic API Key** (for AI features)

## 🚀 Quick Start (Local Development)

### 1. Clone and Setup

```bash
# Navigate to project directory
cd Marxen

# Copy environment file
cp .env.example .env

# Update .env with your database credentials and API keys
nano .env  # Edit with your editor
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb marxen

# Or use psql
psql -U postgres
CREATE DATABASE marxen;
```

### 3. Backend Setup

```bash
cd backend
npm install
npm run migrate    # Run database migrations
npm run dev        # Start development server (with hot reload)
```

Backend will be available at `http://localhost:5000`

### 4. Frontend Setup (new terminal)

```bash
cd frontend
npm install
npm run dev        # Start development server
```

Frontend will be available at `http://localhost:5173`

### 5. Test the Setup

```bash
# In another terminal, test the API:
curl http://localhost:5000/health

# You should see: {"status":"ok","timestamp":"..."}
```

## 🐳 Docker Deployment (All-in-One)

### Option 1: Using docker-compose (Easiest)

```bash
# Make sure you have Docker installed and running
docker --version

# Copy environment file
cp .env.example .env

# Update .env if needed, then run:
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost
# - Backend API: http://localhost:5000
# - Database: localhost:5432
```

### Option 2: Using deploy script

```bash
# Make script executable
chmod +x deploy.sh

# Run with Docker option
./deploy.sh docker
```

## 🌥️ Cloud Deployment

### Heroku (Quickest)

1. **Backend Deployment:**
   ```bash
   cd backend
   heroku create marxen-api
   heroku config:set JWT_SECRET=your-secret-key
   git push heroku main
   heroku run npm run migrate
   ```

2. **Frontend Deployment:**
   ```bash
   cd frontend
   npm install -g vercel
   vercel --prod
   ```

### AWS EC2

1. Launch Ubuntu instance
2. Install Node.js and PostgreSQL
3. Clone repo and run:
   ```bash
   npm install
   npm run migrate
   npm start
   ```

### DigitalOcean App Platform

1. Push code to GitHub
2. Create new app from GitHub repo
3. Set environment variables
4. Deploy!

## 📁 Project Structure

```
Marxen/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, error handling
│   │   ├── config/          # Database, environment
│   │   └── app.js           # Express setup
│   ├── migrations/          # Database schema
│   ├── Dockerfile           # Docker configuration
│   └── package.json
│
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   ├── context/         # Auth state
│   │   ├── i18n/           # Translations
│   │   └── App.jsx          # Main component
│   ├── dist/                # Production build
│   ├── Dockerfile           # Docker configuration
│   └── package.json
│
├── docker-compose.yml        # Multi-service orchestration
├── deploy.sh                 # Deployment script
├── .env.example              # Environment template
└── .github/workflows/        # CI/CD pipelines
```

## 🔐 Environment Variables

### Backend (.env or docker-compose)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/marxen
DB_USER=postgres
DB_PASSWORD=change-me
DB_NAME=marxen

# Server
NODE_ENV=development|production
PORT=5000

# Authentication
JWT_SECRET=your-very-long-secret-key
JWT_EXPIRES_IN=7d

# AI Integration
CLAUDE_API_KEY=sk-...

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_VOICE=true
```

## 📚 Available Scripts

### Backend

```bash
npm start       # Start production server
npm run dev     # Start development server (with nodemon)
npm run migrate # Run database migrations
```

### Frontend

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## ✅ Verify Installation

After starting all services, test these endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Login (create account first via UI)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@marxen.com","password":"password"}'

# Attendance check-in
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"companyId":"company-uuid"}'
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d marxen -c "SELECT 1"

# Check .env DATABASE_URL
cat .env | grep DATABASE_URL

# Verify migrations ran
npm run migrate
```

### API Not Responding
```bash
# Check backend is running
curl http://localhost:5000/health

# Check logs (in same terminal):
# Should see request logs

# Verify port 5000 is not in use:
lsof -i :5000
```

### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# Check dist folder
ls -la dist/
```

### Docker Issues
```bash
# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart all services
docker-compose down
docker-compose up --build

# Clean up
docker system prune -a
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/today` - Get today's status

### Work Management
- `POST /api/work/log-work` - Log work item
- `GET /api/work/my-work` - Get user's work items

### Admin
- `POST /api/admin/company/setup` - Setup company
- `POST /api/admin/users` - Add team member

See `QUICK_REFERENCE.md` for complete API documentation.

## 🚀 Deployment Checklist

- [ ] Database configured and migrated
- [ ] Environment variables set
- [ ] Backend builds and runs successfully
- [ ] Frontend builds without errors
- [ ] API health check passes
- [ ] User registration and login work
- [ ] SSL/HTTPS configured (production)
- [ ] Database backups enabled
- [ ] Error monitoring setup (optional)
- [ ] Domain configured (production)

## 📞 Support

- Check **ARCHITECTURE.md** for system design
- Check **DEPLOYMENT_GUIDE.md** for advanced deployment
- Check **QUICK_REFERENCE.md** for API endpoints
- Review logs: `docker-compose logs -f`

## 🎓 Next Steps

1. **Local Development:**
   - Start with `npm run dev` for both backend and frontend
   - Make changes and see hot reload in action
   - Test with Postman or curl

2. **Add Features:**
   - Create new components in `frontend/src/components`
   - Add new routes in `backend/src/routes`
   - Update database schema in migrations

3. **Deploy to Production:**
   - Follow **DEPLOYMENT_GUIDE.md**
   - Use `docker-compose` for simplest setup
   - Or use `./deploy.sh docker` command

4. **Monitor & Maintain:**
   - Check logs regularly: `docker-compose logs -f`
   - Backup database: `pg_dump marxen > backup.sql`
   - Update dependencies: `npm update`

## 📝 Notes

- All passwords in examples should be changed for production
- JWT_SECRET should be a long, random string (32+ characters)
- Use environment-specific .env files (.env.production, etc.)
- Enable HTTPS in production
- Set proper CORS origins

---

**Ready to start? Run `./deploy.sh` or `docker-compose up --build`! 🚀**
