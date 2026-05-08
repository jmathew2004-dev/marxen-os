# Marxen ERP - Production Deployment Guide

## ✅ Current Status

- ✅ Database migrations completed
- ✅ Backend API fully functional
- ✅ Frontend React build successful
- ✅ Authentication working (JWT)
- ✅ All core features implemented and tested

## 🚀 Local Testing (Already Complete)

### Running Locally
```bash
# Terminal 1: Backend
cd backend
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Frontend  
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Test Credentials
```
Email: admin@marxen.com
Password: Admin123!
Role: admin
```

### API Base
- Backend API: http://localhost:3000/api
- Frontend URL: http://localhost:5173
- Health Check: http://localhost:3000/health

---

## 🌍 Production Deployment Options

### Option 1: Vercel (Frontend) + Heroku (Backend) - RECOMMENDED

#### Step 1: Prepare Backend for Heroku

1. **Create Heroku app:**
```bash
npm install -g heroku
heroku login
cd backend
heroku create marxen-erp-api
```

2. **Set environment variables on Heroku:**
```bash
heroku config:set -a marxen-erp-api \
  DATABASE_URL=postgresql://user:pass@host:5432/marxen \
  JWT_SECRET=your-production-secret-key-change-this \
  CLAUDE_API_KEY=sk-ant-xxxxx \
  FRONTEND_URL=https://your-frontend-url.vercel.app \
  NODE_ENV=production
```

3. **Create Procfile in backend directory:**
```
web: npm start
```

4. **Deploy:**
```bash
git push heroku main
heroku logs -t -a marxen-erp-api
```

#### Step 2: Prepare Frontend for Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Update .env for production:**
```
VITE_API_BASE_URL=https://marxen-erp-api.herokuapp.com/api
VITE_ENABLE_VOICE=true
```

3. **Deploy to Vercel:**
```bash
cd frontend
vercel
```

4. **Add environment variable in Vercel dashboard:**
- Key: `VITE_API_BASE_URL`
- Value: `https://marxen-erp-api.herokuapp.com/api`

---

### Option 2: AWS (EC2 + RDS + S3/CloudFront)

1. **Create EC2 instance:**
   - Ubuntu 22.04 LTS, t2.medium or larger
   - Security Group: Allow ports 22, 80, 443, 3000

2. **Set up database:**
   - Create RDS PostgreSQL instance
   - Use the provided migration script
   - Note the connection string

3. **Deploy Backend:**
```bash
ssh ubuntu@your-ec2-ip
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
git clone your-repo
cd backend
npm install
npm run migrate
npm start
```

4. **Set up Nginx as reverse proxy:**
```nginx
server {
  listen 80;
  server_name api.yourdomain.com;
  location / {
    proxy_pass http://localhost:3000;
  }
}
```

5. **Deploy Frontend:**
   - Build: `npm run build`
   - Upload dist/ to S3
   - Set up CloudFront distribution

---

### Option 3: DigitalOcean App Platform

1. **Prepare code for deployment:**
```bash
# Ensure .env and migrations are ready
npm run migrate
```

2. **Push to GitHub/GitLab**

3. **Connect to DigitalOcean App Platform:**
   - Backend: Node.js, port 3000
   - Frontend: Static site, serve dist/

4. **Set environment variables**

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` to a strong random string
  ```bash
  # Generate random secret
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

- [ ] Set `NODE_ENV=production`

- [ ] Use HTTPS/SSL certificate (Let's Encrypt or AWS Certificate Manager)

- [ ] Configure CORS properly:
  ```javascript
  // In backend src/app.js
  cors({
    origin: 'https://your-production-domain.com',
    credentials: true
  })
  ```

- [ ] Set strong database password

- [ ] Enable PostgreSQL SSL

- [ ] Set up automated backups for database

- [ ] Enable HTTPS redirection

- [ ] Add rate limiting to API

- [ ] Set up monitoring/alerting

---

## 📊 Database Setup for Production

### PostgreSQL on Managed Service (Recommended)

Use one of these:
- **Heroku Postgres** (easiest, included with Heroku)
- **AWS RDS** (most reliable, scalable)
- **DigitalOcean Managed Databases** (good balance)
- **Render Postgres** (PostgreSQL + Redis + Web Services)

### Manual PostgreSQL on VM

```bash
# On your production server
sudo apt-get update
sudo apt-get install postgresql-15 postgresql-contrib-15

# Create database and user
sudo -u postgres psql
CREATE DATABASE marxen;
CREATE USER marxen_user WITH PASSWORD 'strong-password';
GRANT ALL PRIVILEGES ON DATABASE marxen TO marxen_user;

# Run migrations
cd backend && npm run migrate
```

---

## 🌐 DNS & Domain Setup

1. **Point domain to your hosting:**
   - Vercel: Add CNAME record to vercel.com
   - Heroku: Use `heroku domains:add yourdomain.com`
   - AWS: Route53 or your DNS provider

2. **SSL Certificate:**
   - Vercel/Heroku: Automatic
   - AWS: Request certificate in ACM
   - Self-hosted: Let's Encrypt with Certbot

---

## 📈 Monitoring & Logging

### Backend Monitoring

1. **Set up error tracking:**
```bash
# Option A: Sentry
npm install @sentry/node
# Initialize in server.js

# Option B: LogRocket
npm install logrocket
```

2. **Enable logging:**
```bash
# Heroku logs
heroku logs --tail -a marxen-erp-api

# AWS CloudWatch
# Configure in backend code
```

### Frontend Monitoring

1. **Performance monitoring:**
```bash
npm install web-vitals
```

2. **Error tracking:**
```bash
npm install @sentry/react
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend to Heroku
        run: |
          git push https://heroku:${{ secrets.HEROKU_API_KEY }}@git.heroku.com/marxen-erp-api.git main
      
      - name: Deploy Frontend to Vercel
        run: |
          cd frontend
          npm install
          npm run build
          npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📞 Troubleshooting

### Backend won't start
```bash
# Check logs
heroku logs -t -a marxen-erp-api

# Verify environment variables
heroku config -a marxen-erp-api

# Check database connection
npm run migrate
```

### Frontend not connecting to API
```javascript
// Check browser console (F12)
// Verify VITE_API_BASE_URL in frontend/.env
// Check CORS in backend src/app.js
// Ensure backend is running
curl https://your-api-domain.com/health
```

### Database connection issues
```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules
# Database must allow connections from app server
```

---

## 📊 Performance Tips

1. **Frontend:**
   - Use Vercel Edge Network for fast CDN
   - Enable gzip compression
   - Lazy load components with React.lazy()

2. **Backend:**
   - Enable database connection pooling
   - Add caching with Redis
   - Use CDN for static assets
   - Implement rate limiting

3. **Database:**
   - Create indexes for frequent queries
   - Regular VACUUM and ANALYZE
   - Monitor slow queries

---

## 💾 Backup & Recovery

### Automated Backups

```bash
# For Heroku Postgres
heroku addons:create heroku-postgresql:standard-0 \
  --as HEROKU_POSTGRESQL_BACKUP --app marxen-erp-api

# Backup schedule
heroku pgbackups:schedulebackups --at "02:00 UTC" \
  --app marxen-erp-api
```

### Manual Backup

```bash
# PostgreSQL dump
pg_dump marxen > backup-$(date +%Y%m%d).sql

# Restore from dump
psql marxen < backup-20260507.sql
```

---

## 🎯 Post-Deployment Tests

1. **API Tests:**
```bash
# Registration
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}'

# Check-in
curl -X POST https://api.yourdomain.com/api/attendance/check-in \
  -H "Authorization: Bearer YOUR_TOKEN"

# Health check
curl https://api.yourdomain.com/health
```

2. **Frontend Tests:**
- Login with test credentials
- Check-in/Check-out functionality
- Work logging
- AI Mentor chat (if API key configured)
- Language switching
- Responsive design on mobile

3. **Database Tests:**
- Verify all tables created
- Run a query: `SELECT COUNT(*) FROM users;`
- Backup/restore works

---

## 🔄 Continuous Monitoring

After deployment, monitor:

1. **API Response Time:** Should be < 500ms
2. **Database Connections:** Monitor pool usage
3. **Error Rate:** Target < 0.1%
4. **Uptime:** Aim for 99.9%+
5. **User Activity:** Track daily active users

---

## ✅ Final Checklist

- [ ] Database migrated and accessible
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] SSL/HTTPS configured
- [ ] Domain DNS configured
- [ ] Admin account created and tested
- [ ] API endpoints responding
- [ ] Frontend loads without errors
- [ ] Authentication flow works
- [ ] Core features tested (check-in, work logging)
- [ ] Email notifications configured (optional)
- [ ] Backups automated
- [ ] Monitoring enabled
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

## 📞 Support & Resources

- **Documentation:** See README.md and ARCHITECTURE.md
- **Issues:** Check GitHub Issues
- **Logs:** Backend: Heroku Dashboard | Frontend: Vercel Dashboard
- **API Docs:** See QUICK_REFERENCE.md for API endpoints

---

**Deployment Date:** May 7, 2026
**Status:** ✅ Ready for Production
**Version:** 1.0.0
