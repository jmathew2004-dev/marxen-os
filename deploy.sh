#!/bin/bash

# Marxen ERP - Comprehensive Deployment Script
# Supports Docker, Heroku, AWS, and manual deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

check_requirements() {
    print_header "Checking Requirements"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js $(node --version)"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm --version)"
    
    if [ "$DEPLOY_METHOD" = "docker" ] && ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Install Docker or use a different deployment method."
        exit 1
    fi
    
    if [ "$DEPLOY_METHOD" = "docker" ]; then
        print_success "Docker $(docker --version)"
    fi
    
    if [ "$DEPLOY_METHOD" = "heroku" ] && ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI is not installed. Install it or use a different deployment method."
        exit 1
    fi
}

build_backend() {
    print_header "Building Backend"
    cd backend
    
    if [ ! -f package-lock.json ]; then
        print_info "Installing dependencies..."
        npm install
    else
        print_info "Dependencies already installed, skipping npm install"
    fi
    
    # Verify syntax
    print_info "Verifying JavaScript syntax..."
    node -c server.js
    print_success "Backend syntax check passed"
    
    cd ..
}

build_frontend() {
    print_header "Building Frontend"
    cd frontend
    
    if [ ! -f package-lock.json ]; then
        print_info "Installing dependencies..."
        npm install
    else
        print_info "Dependencies already installed, skipping npm install"
    fi
    
    print_info "Building with Vite..."
    npm run build
    print_success "Frontend build complete"
    
    cd ..
}

deploy_docker() {
    print_header "Deploying with Docker Compose"
    
    if [ ! -f docker-compose.yml ]; then
        print_error "docker-compose.yml not found"
        exit 1
    fi
    
    print_info "Building Docker images..."
    docker-compose build
    
    print_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_info "Waiting for services to be ready..."
    sleep 10
    
    # Check health
    print_info "Checking backend health..."
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        print_success "Database is ready"
    else
        print_error "Database failed to start"
        docker-compose logs postgres
        exit 1
    fi
    
    print_info "Running database migrations..."
    docker-compose exec -T backend npm run migrate
    
    print_success "Docker deployment complete!"
    echo ""
    echo -e "${GREEN}Services are running:${NC}"
    echo "  Frontend: http://localhost"
    echo "  Backend API: http://localhost:5000"
    echo "  Database: localhost:5432"
}

deploy_heroku() {
    print_header "Deploying to Heroku"
    
    print_info "Checking Heroku authentication..."
    heroku auth:whoami || {
        print_error "Not logged in to Heroku. Run 'heroku login' first"
        exit 1
    }
    
    # Backend deployment
    print_info "Deploying backend to Heroku..."
    cd backend
    
    if ! git remote | grep -q heroku; then
        print_info "Creating Heroku app..."
        heroku create marxen-api --no-remote || true
        git remote add heroku https://git.heroku.com/marxen-api.git || true
    fi
    
    print_info "Setting environment variables..."
    heroku config:set \
        NODE_ENV=production \
        JWT_SECRET="$(openssl rand -base64 32)" \
        CLAUDE_API_KEY="${CLAUDE_API_KEY}" \
        --app marxen-api
    
    print_info "Deploying..."
    git push heroku main || {
        print_error "Heroku deployment failed. Check your git setup."
        exit 1
    }
    
    print_info "Running migrations..."
    heroku run npm run migrate --app marxen-api
    
    print_success "Backend deployed to Heroku!"
    cd ..
    
    # Frontend deployment (Vercel)
    print_header "Frontend Deployment"
    print_info "Install Vercel CLI: npm install -g vercel"
    print_info "Then deploy: cd frontend && vercel --prod"
}

deploy_manual() {
    print_header "Manual Deployment Instructions"
    
    echo -e "${YELLOW}For local/manual deployment:${NC}"
    echo ""
    echo "Backend:"
    echo "  1. cd backend"
    echo "  2. npm install"
    echo "  3. npm run migrate"
    echo "  4. npm start"
    echo ""
    echo "Frontend:"
    echo "  1. cd frontend"
    echo "  2. npm install"
    echo "  3. npm run build"
    echo "  4. npm run preview"
    echo ""
}

show_menu() {
    print_header "Marxen ERP Deployment"
    echo ""
    echo "Choose deployment method:"
    echo "  1) Docker Compose (Recommended - All-in-one)"
    echo "  2) Heroku (Quick cloud deployment)"
    echo "  3) Manual (Run locally)"
    echo "  4) Build Only (Verify builds without deploying)"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            DEPLOY_METHOD="docker"
            ;;
        2)
            DEPLOY_METHOD="heroku"
            ;;
        3)
            DEPLOY_METHOD="manual"
            ;;
        4)
            DEPLOY_METHOD="build"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

main() {
    print_header "Marxen ERP - Deployment Script"
    
    if [ -z "$1" ]; then
        show_menu
    else
        DEPLOY_METHOD=$1
    fi
    
    print_info "Deployment method: $DEPLOY_METHOD"
    echo ""
    
    # Check requirements
    check_requirements
    
    # Build projects
    build_backend
    build_frontend
    
    # Deploy based on method
    case $DEPLOY_METHOD in
        docker)
            deploy_docker
            ;;
        heroku)
            deploy_heroku
            ;;
        manual)
            deploy_manual
            ;;
        build)
            print_success "Build verification complete! No deployment performed."
            ;;
        *)
            print_error "Unknown deployment method: $DEPLOY_METHOD"
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment script completed successfully!"
}

# Run main function
main "$@"
