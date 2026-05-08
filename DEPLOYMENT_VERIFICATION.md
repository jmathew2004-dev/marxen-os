# 🚀 Marxen ERP - Deployment & Verification Guide

## Pre-Deployment Checklist

### Code Quality ✅
- [x] All JavaScript files have valid syntax
- [x] Backend Express app properly configured
- [x] Frontend Vite build succeeds
- [x] No unresolved imports or dependencies
- [x] Environment variables properly defined
- [x] Database migrations ready

### Infrastructure ✅
- [x] Docker configuration ready (Dockerfile + docker-compose.yml)
- [x] Database schema complete (7 tables with proper indexes)
- [x] Health check endpoints configured
- [x] CORS and security headers configured
- [x] Environment templates (.env.example, .env.production)

### Documentation ✅
- [x] README.md - Project overview
- [x] QUICK_START.md - Getting started guide
- [x] ARCHITECTURE.md - System design
- [x] DEPLOYMENT_GUIDE.md - Detailed deployment
- [x] PRODUCTION_READY.md - Production checklist
- [x] QUICK_REFERENCE.md - API reference
- [x] This file - Verification guide

### CI/CD ✅
- [x] GitHub Actions workflow (.github/workflows/test.yml)
- [x] Automated build testing
- [x] Docker build verification
- [x] Deployment scripts (deploy.sh)

---

## 🔍 Verification Steps

### 1. Local Development Verification

```bash
# Terminal 1: Database setup
createdb marxen
cd backend
npm install
npm run migrate

# Terminal 2: Start backend
cd backend
npm run dev
# Should see: "🚀 Server running on port 5000"

# Terminal 3: Start frontend
cd frontend
npm install
npm run dev
# Should see: "Local: http://localhost:5173"

# Terminal 4: Test API
curl http://localhost:5000/health
# Expected response: {"status":"ok","timestamp":"..."}
```

### 2. Frontend Build Verification

```bash
cd frontend
npm run build
# Should complete with ✓

# Check build output
ls -la dist/
# Should contain: index.html, assets/
```

### 3. Database Verification

```bash
# Connect to database
psql -U postgres marxen

# Check tables
\dt

# Should show 7 tables:
# - companies
# - users
# - work_categories
# - work_items
# - attendance_records
# - ai_mentor_conversations
# - audit_logs
```

### 4. Docker Verification

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check running containers
docker ps
# Should show: postgres, backend, frontend

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Test health endpoint
curl http://localhost:5000/health
curl http://localhost/  # Frontend

# Stop services
docker-compose down
```

### 5. API Endpoint Verification

```bash
# Health check
curl http://localhost:5000/health

# User registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@example.com",
    "password":"Password123!",
    "firstName":"Admin",
    "lastName":"User"
  }'
# Expected: {"id":"...", "token":"...", ...}

# User login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@example.com",
    "password":"Password123!"
  }'
# Expected: {"id":"...", "token":"...", ...}
```

---

## 📦 Deployment Methods

### Method 1: Docker Compose (Recommended)

**Pros:** Simplest, all-in-one, production-ready
**Cons:** Requires Docker

```bash
# Copy environment
cp .env.example .env

# Edit .env with production values:
nano .env

# Build and start
docker-compose up --build

# Access:
# Frontend: http://localhost
# Backend: http://localhost:5000
# Database: localhost:5432
```

**Commands:**
```bash
docker-compose up -d              # Start in background
docker-compose down               # Stop all services
docker-compose logs -f backend    # View logs
docker-compose exec backend bash  # Execute in container
```

### Method 2: Heroku (Cloud Deployment)

**Pros:** No server management, automatic scaling
**Cons:** Requires Heroku account, costs for additional resources

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create backend app
cd backend
heroku create marxen-api
git push heroku main
heroku run npm run migrate

# Create frontend app (using Vercel)
cd ../frontend
npm install -g vercel
vercel --prod
```

### Method 3: AWS EC2

**Pros:** Full control, scalable, cost-effective
**Cons:** More setup required

```bash
# 1. Launch Ubuntu 22.04 LTS instance
# 2. Connect via SSH
# 3. Install dependencies:
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm postgresql postgresql-contrib nginx -y

# 4. Clone repository
git clone <your-repo>
cd Marxen

# 5. Setup database
sudo -u postgres createdb marxen

# 6. Setup backend
cd backend
npm install
npm run migrate
npm start

# 7. Setup frontend
cd ../frontend
npm install
npm run build

# 8. Configure nginx as reverse proxy
sudo nano /etc/nginx/sites-available/default
# Forward port 80 to backend and frontend

# 9. Start nginx
sudo systemctl start nginx
```

### Method 4: DigitalOcean App Platform

**Pros:** Simple, GitHub integration, good pricing
**Cons:** Less control than EC2

```bash
# 1. Push to GitHub
git add .
git commit -m "Deploy"
git push

# 2. Go to DigitalOcean App Platform
# 3. Create new app from GitHub repo
# 4. Add environment variables from .env.production
# 5. Deploy!
```

### Method 5: Manual VPS (Linode, Vultr)

```bash
# Similar to AWS EC2, but:
ssh root@your-vps-ip
apt update && apt install -y nodejs npm postgresql nginx

# Then follow AWS EC2 steps above
```

---

## 🔐 Production Configuration

### Essential Security Steps

1. **Change JWT Secret**
   ```bash
   # Generate strong secret
   openssl rand -base64 32
   
   # Update .env.production
   JWT_SECRET=<generated-secret>
   ```

2. **Enable HTTPS/SSL**
   ```bash
   # Option 1: Let's Encrypt (free)
   sudo apt install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d yourdomain.com
   
   # Option 2: AWS Certificate Manager (if on AWS)
   # Option 3: DigiCert (commercial)
   ```

3. **Configure CORS**
   ```javascript
   // backend/src/app.js
   cors({
     origin: 'https://yourdomain.com',
     credentials: true
   })
   ```

4. **Database Security**
   ```sql
   -- Change default password
   ALTER USER postgres WITH PASSWORD 'strong-password';
   
   -- Create limited user for app
   CREATE USER marxen WITH PASSWORD 'app-password';
   GRANT ALL PRIVILEGES ON DATABASE marxen TO marxen;
   ```

5. **Environment Variables**
   - Never commit .env to git
   - Use .env.production on production server
   - Rotate credentials regularly
   - Use secret management (AWS Secrets Manager, etc.)

6. **Rate Limiting**
   ```bash
   # Install express-rate-limit
   npm install express-rate-limit
   
   # Apply to API routes
   ```

7. **Monitoring & Logging**
   - Set up error tracking (Sentry, Rollbar)
   - Enable database backups
   - Configure log rotation
   - Set up uptime monitoring

---

## 📊 Performance Optimization

### Before Production

```bash
# 1. Frontend optimization
cd frontend
npm run build
# Check size: ~93KB gzipped ✓

# 2. Database indexing
# Already configured in migrations

# 3. Backend compression
npm install compression
# Already in dependencies

# 4. Enable gzip in nginx
# Configure in nginx.conf
```

### Monitoring in Production

```bash
# Monitor error logs
docker-compose logs -f backend

# Check database performance
psql marxen -c "SELECT * FROM pg_stat_statements;"

# Monitor server resources
# CPU, Memory, Disk, Network
```

---

## 🚨 Troubleshooting

### Frontend Not Loading

```bash
# Check build output
ls -la frontend/dist/

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify API_BASE_URL
cat frontend/.env | grep VITE_API_BASE_URL
```

### Backend API Not Responding

```bash
# Check if service is running
docker ps | grep backend
ps aux | grep node

# Check logs
docker-compose logs backend
npm run dev  # for local testing

# Check database connection
psql -U postgres marxen -c "SELECT 1;"
```

### Database Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql
docker ps | grep postgres

# Restore from backup
psql marxen < backup.sql

# Check table sizes
psql marxen -c "
  SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(relid) DESC;
"
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5000
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

---

## 📈 Scaling Considerations

For production with many users:

1. **Database**
   - Use managed PostgreSQL (AWS RDS, Azure Database)
   - Enable read replicas for scaling
   - Regular backups and point-in-time recovery

2. **Backend API**
   - Run multiple instances with load balancer
   - Use PM2 for process management
   - Implement caching (Redis)
   - Add CDN for static assets

3. **Frontend**
   - Serve from CDN (CloudFront, Cloudflare)
   - Enable compression and caching
   - Minify assets (Vite does this)

4. **Monitoring**
   - Application Performance Monitoring (APM)
   - Error tracking (Sentry)
   - Log aggregation (ELK Stack)
   - Uptime monitoring

---

## 🔄 Update & Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update to latest major version
npm install express@latest

# Rebuild and test
npm test
npm run build
```

### Deployment Updates

```bash
# 1. Update code
git pull origin main

# 2. Rebuild Docker images
docker-compose build --no-cache

# 3. Test new images
docker-compose up --build

# 4. Run migrations if schema changed
docker-compose exec backend npm run migrate

# 5. Verify deployment
curl http://localhost:5000/health
```

### Backup Strategy

```bash
# PostgreSQL backup
pg_dump marxen > backup-$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump marxen > /backups/marxen-$(date +\%Y\%m\%d).sql

# S3 backup
aws s3 cp backup-20260508.sql s3://my-backups/

# Restore from backup
psql marxen < backup-20260508.sql
```

---

## ✅ Post-Deployment

### First 24 Hours

- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify database backups
- [ ] Test user workflows
- [ ] Monitor server resources

### First Week

- [ ] Collect user feedback
- [ ] Optimize based on usage
- [ ] Set up alerting for errors
- [ ] Create operational runbooks
- [ ] Document recovery procedures

### Ongoing

- [ ] Daily backup verification
- [ ] Weekly performance review
- [ ] Monthly security updates
- [ ] Quarterly capacity planning
- [ ] Regular disaster recovery drills

---

## 📞 Support & Resources

- **Docker Docs:** https://docs.docker.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs
- **Express.js Docs:** https://expressjs.com
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev

---

## 🎯 Quick Deploy Commands

```bash
# Docker deployment (all-in-one)
docker-compose up --build

# Heroku deployment
cd backend && heroku create && git push heroku main
cd ../frontend && vercel --prod

# Local development
npm run dev  # in both backend and frontend terminals

# Manual production server
cd backend && npm start
cd frontend && npm run build && npx serve dist
```

---

**Your Marxen ERP is ready for production! 🚀**

Choose your deployment method from the options above and follow the specific instructions.
For questions, refer to the other documentation files or check the logs.
