# 🚀 Marxen ERP - Production Deployment Guide

**Status:** ✅ Ready for Production  
**Version:** 1.0.0  
**Date:** May 8, 2026

---

## 📋 What's Been Prepared

### ✅ Code Structure
- Well-organized backend (Express.js + PostgreSQL)
- Modern frontend (React 18 + Vite)
- Proper separation of concerns
- Environment-based configuration
- Error handling and logging

### ✅ Infrastructure
- **Docker Support:**
  - Dockerfile for backend (Node.js + Alpine)
  - Dockerfile for frontend (React + serve)
  - docker-compose.yml with PostgreSQL, Backend, Frontend
  - Health checks on all services
  - Automatic restart policies

- **CI/CD Pipeline:**
  - GitHub Actions workflow
  - Automated testing on push
  - Docker build verification

- **Scripts & Tools:**
  - `deploy.sh` - Deployment script (Docker, Heroku, Manual)
  - `Makefile` - Convenient development commands
  - Environment templates (.env.example, .env.production)

### ✅ Documentation
- `README.md` - Project overview
- `QUICK_START.md` - Getting started in 5 minutes
- `DEPLOYMENT_VERIFICATION.md` - Verification and troubleshooting
- `QUICK_REFERENCE.md` - API endpoints and commands
- `ARCHITECTURE.md` - System design
- `PRODUCTION_READY.md` - Checklist

---

## 🎯 Choose Your Deployment Path

### Option 1: Docker Compose (Fastest ⚡ - Recommended)

**Perfect for:** Quick deployment, local testing, small to medium teams

**Time:** ~5 minutes setup + build time

```bash
# 1. Clone and setup
git clone <your-repo>
cd Marxen

# 2. Copy environment
cp .env.example .env

# 3. Edit configuration (if needed)
nano .env
# Modify:
# - DB_PASSWORD
# - JWT_SECRET
# - CLAUDE_API_KEY

# 4. Deploy
docker-compose up --build

# 5. Access
# Frontend: http://localhost
# Backend: http://localhost:5000
# Database: localhost:5432
```

**Advantages:**
- All services in one command
- Automatic database migration
- Hot reload support
- Easy to scale

**Disadvantages:**
- Requires Docker installation
- Limited to single server

---

### Option 2: Heroku (Cloud ☁️ - Simple)

**Perfect for:** Quick cloud deployment, free tier available

**Time:** ~10 minutes

#### Backend Deployment:
```bash
# 1. Install Heroku CLI
brew install heroku

# 2. Login
heroku login

# 3. Create app
cd backend
heroku create marxen-api

# 4. Set environment variables
heroku config:set \
  JWT_SECRET=$(openssl rand -base64 32) \
  CLAUDE_API_KEY=your-key \
  FRONTEND_URL=https://your-frontend.com

# 5. Create database
heroku addons:create heroku-postgresql:hobby-dev

# 6. Deploy
git push heroku main

# 7. Run migrations
heroku run npm run migrate

# 8. Check logs
heroku logs --tail
```

**Your API URL:** `https://marxen-api.herokuapp.com`

#### Frontend Deployment:
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Configure for Heroku backend
cd frontend
echo "VITE_API_BASE_URL=https://marxen-api.herokuapp.com/api" > .env.production

# 3. Deploy
vercel --prod

# 4. Follow prompts
# Your frontend URL: https://marxen-?.vercel.app
```

**Advantages:**
- One-click deployment
- Automatic scaling
- Free SSL/HTTPS
- GitHub integration available

**Disadvantages:**
- Paid after free tier
- Limited customization
- Slower than dedicated servers

---

### Option 3: AWS EC2 (Control 🎛️ - Production)

**Perfect for:** Production at scale, maximum control

**Time:** ~30 minutes setup

```bash
# 1. Launch EC2 Instance
# - AMI: Ubuntu 22.04 LTS
# - Type: t3.medium or larger
# - Storage: 30GB
# - Security Group: Allow 80, 443, 22

# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Update system
sudo apt update && sudo apt upgrade -y

# 4. Install dependencies
sudo apt install -y \
  nodejs npm postgresql postgresql-contrib \
  nginx git certbot python3-certbot-nginx

# 5. Clone repository
git clone <your-repo>
cd Marxen

# 6. Setup database
sudo -u postgres createdb marxen

# 7. Setup backend
cd backend
npm install
npm run migrate

# 8. Create systemd service for backend
sudo nano /etc/systemd/system/marxen-backend.service
```

**Service file content:**
```ini
[Unit]
Description=Marxen ERP Backend
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Marxen/backend
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Continue setup:**
```bash
# Enable service
sudo systemctl enable marxen-backend
sudo systemctl start marxen-backend

# Setup frontend
cd ../frontend
npm install
npm run build

# Configure nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx config:**
```nginx
upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80 default_server;
    server_name _;

    # Frontend
    location / {
        root /home/ubuntu/Marxen/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable SSL with Let's Encrypt
sudo certbot certonly --nginx -d yourdomain.com

# Restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status marxen-backend
```

**Advantages:**
- Full control
- Cost-effective for large scale
- No vendor lock-in
- Custom configurations

**Disadvantages:**
- More setup required
- You manage updates and security
- Requires server knowledge

---

### Option 4: DigitalOcean App Platform (Easy 🚀)

**Perfect for:** GitHub integration, easy updates

**Time:** ~5 minutes

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Visit https://cloud.digitalocean.com/apps

# 3. Click "Create App"

# 4. Select GitHub repository (Marxen)

# 5. Configure:
   # Service 1 - Backend
   - Name: marxen-backend
   - Source: backend/
   - Environment: Node.js 18
   
   # Service 2 - Frontend  
   - Name: marxen-frontend
   - Source: frontend/
   - Build: npm run build
   - Run: npx serve dist
   
   # Database
   - Add PostgreSQL managed database

# 6. Set environment variables:
   JWT_SECRET=...
   CLAUDE_API_KEY=...
   DATABASE_URL=...

# 7. Click Deploy

# Your URLs:
# - Backend: https://marxen-api-xxxxx.ondigitalocean.app
# - Frontend: https://marxen-web-xxxxx.ondigitalocean.app
```

---

## ⚙️ Configuration Before Deployment

### 1. Environment Variables

**Critical for Production:**

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Create .env.production
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Required values:**
```env
JWT_SECRET=<your-32-char-random-string>
CLAUDE_API_KEY=sk-ant-...
DB_PASSWORD=<secure-password>
FRONTEND_URL=https://yourdomain.com
```

### 2. Database Configuration

**Create backup strategy:**
```bash
# Daily automated backup
0 2 * * * pg_dump marxen > /backups/marxen-$(date +\%Y\%m\%d).sql

# S3 backup (optional)
0 3 * * * aws s3 cp /backups/marxen-*.sql s3://my-backups/
```

### 3. SSL/HTTPS

**Let's Encrypt (Free):**
```bash
# On EC2/VPS
sudo certbot certonly --nginx -d yourdomain.com

# On Heroku (automatic)
heroku certs:add server.crt server.key

# On AWS (use Certificate Manager)
```

### 4. Security Hardening

**Essential steps:**
```bash
# 1. Change default database password
ALTER USER postgres WITH PASSWORD 'change-me';

# 2. Enable HTTPS everywhere
# Update FRONTEND_URL and CORS origin

# 3. Set strong JWT_SECRET
# Already required above

# 4. Enable database SSL
# Set in connection string

# 5. Rate limiting
npm install express-rate-limit

# 6. CORS configuration
cors({
  origin: 'https://yourdomain.com',
  credentials: true
})

# 7. Security headers
npm install helmet  # Already installed
```

---

## 🔍 Pre-Deployment Checklist

- [ ] Code committed to git
- [ ] All dependencies installed
- [ ] Frontend builds successfully: `npm run build`
- [ ] Backend syntax valid: `npm run lint`
- [ ] Environment variables configured
- [ ] Database migrations tested locally
- [ ] .env.production file created with production values
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] CLAUDE_API_KEY is set (or feature disabled)
- [ ] FRONTEND_URL matches your domain
- [ ] Database backups planned
- [ ] SSL/HTTPS configured
- [ ] Monitoring setup (optional but recommended)

---

## 🚀 Quick Deploy Commands

### Docker (One Command)
```bash
docker-compose up --build
# Done! 🎉
```

### Heroku (5 commands)
```bash
heroku create marxen-api
git push heroku main
heroku run npm run migrate
cd ../frontend && vercel --prod
# Done! 🎉
```

### AWS/VPS (Bash script)
```bash
./deploy.sh  # Follow prompts
# or
./deploy.sh docker
```

---

## 📊 Post-Deployment

### First Hour
- [ ] Check backend API: `curl https://yourdomain.com/api/health`
- [ ] Verify frontend loads
- [ ] Test user registration
- [ ] Monitor error logs

### First Day
- [ ] Create first admin account
- [ ] Test complete user workflow
- [ ] Check database backups
- [ ] Monitor performance metrics

### First Week
- [ ] Onboard team members
- [ ] Gather user feedback
- [ ] Optimize based on usage
- [ ] Set up monitoring alerts
- [ ] Document runbooks

---

## 🆘 If Something Goes Wrong

### Backend not responding
```bash
# Check logs
docker-compose logs backend
heroku logs --tail
journalctl -u marxen-backend -n 100

# Restart service
docker-compose restart backend
sudo systemctl restart marxen-backend
```

### Database connection error
```bash
# Test connection
psql -U postgres marxen -c "SELECT 1;"
docker-compose exec postgres pg_isready

# Check environment variables
cat .env | grep DATABASE
echo $DATABASE_URL
```

### Frontend not loading
```bash
# Check build
ls -la frontend/dist/
npm run build

# Check nginx
sudo nginx -t
sudo systemctl restart nginx

# Check logs
docker-compose logs frontend
sudo tail -f /var/log/nginx/error.log
```

### 404 on API calls
```bash
# Check CORS origin
cat backend/src/app.js | grep cors

# Check API_BASE_URL in frontend
cat frontend/.env | grep VITE_API_BASE_URL

# Test API directly
curl https://yourdomain.com/api/health
```

---

## 📈 Monitoring & Maintenance

### Essential Monitoring
```bash
# CPU & Memory
top
docker stats

# Disk space
df -h

# Database performance
psql marxen -c "SELECT * FROM pg_stat_statements LIMIT 10;"

# Error logs
tail -f /var/log/nodejs-app.log
```

### Regular Tasks
- Daily: Check backups
- Weekly: Review error logs
- Monthly: Update dependencies
- Quarterly: Capacity planning

---

## 🎓 Next Steps

1. **Choose deployment method** - Pick from options above
2. **Prepare environment** - Copy and edit .env.production
3. **Run deployment** - Follow method-specific instructions
4. **Verify deployment** - Run post-deployment checks
5. **Monitor performance** - Set up logging and alerts
6. **Onboard users** - Create admin account and add team members

---

## 📞 Help & Support

- **Documentation:** Check README.md, QUICK_START.md, QUICK_REFERENCE.md
- **Docker Issues:** https://docs.docker.com
- **PostgreSQL Issues:** https://www.postgresql.org/docs
- **Node.js Issues:** https://nodejs.org/docs
- **Email:** devops@marxen.com (if available)

---

## 🎯 Success Criteria

After deployment, you should be able to:

✅ Access frontend at your domain  
✅ Login with admin account  
✅ Check in/out from mobile or desktop  
✅ View attendance reports  
✅ Log work items  
✅ Chat with AI Mentor  
✅ Switch languages (English, Tamil, Telugu, Hindi)  
✅ See multiple users on admin dashboard  

---

**Marxen ERP is ready for production! 🚀**

Choose your deployment method and get started. The system is fully tested and production-ready.

Good luck! 🎉
