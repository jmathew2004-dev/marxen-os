.PHONY: help install dev start build test clean docker-build docker-up docker-down logs migrate

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Marxen ERP - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Examples:$(NC)"
	@echo "  make dev          - Start both backend and frontend in development mode"
	@echo "  make build        - Build frontend for production"
	@echo "  make docker-up    - Start all services with Docker"
	@echo "  make clean        - Remove node_modules and build artifacts"

install: ## Install dependencies for both backend and frontend
	@echo "$(BLUE)Installing dependencies...$(NC)"
	cd backend && npm install
	cd frontend && npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: ## Start development servers (backend on 5000, frontend on 5173)
	@echo "$(BLUE)Starting development servers...$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:5000$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Run in separate terminals:$(NC)"
	@echo "  Terminal 1: cd backend && npm run dev"
	@echo "  Terminal 2: cd frontend && npm run dev"

start: ## Start production servers
	@echo "$(BLUE)Starting production servers...$(NC)"
	cd backend && npm start
	cd frontend && npm run preview

build: ## Build frontend for production
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)✓ Build complete: frontend/dist$(NC)"

test: ## Run linting (backend syntax check)
	@echo "$(BLUE)Running tests...$(NC)"
	cd backend && npm run lint
	cd frontend && npm run test
	@echo "$(GREEN)✓ Tests passed$(NC)"

migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	cd backend && npm run migrate
	@echo "$(GREEN)✓ Migrations complete$(NC)"

clean: ## Remove node_modules, builds, and logs
	@echo "$(BLUE)Cleaning up...$(NC)"
	rm -rf backend/node_modules frontend/node_modules
	rm -rf frontend/dist
	rm -rf .log *.log
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

# Docker commands
docker-build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-up: ## Start Docker services
	@echo "$(BLUE)Starting Docker services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:5000$(NC)"
	@echo "$(YELLOW)Database: localhost:5432$(NC)"

docker-down: ## Stop Docker services
	@echo "$(BLUE)Stopping Docker services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

docker-restart: ## Restart Docker services
	@echo "$(BLUE)Restarting Docker services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

logs: ## Show Docker logs
	docker-compose logs -f

logs-backend: ## Show backend logs only
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs only
	docker-compose logs -f frontend

logs-db: ## Show database logs only
	docker-compose logs -f postgres

ps: ## Show Docker container status
	@echo "$(BLUE)Docker containers:$(NC)"
	docker-compose ps

shell-backend: ## Open shell in backend container
	docker-compose exec backend /bin/sh

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend /bin/sh

shell-db: ## Open psql shell in database container
	docker-compose exec postgres psql -U postgres -d marxen

# Deployment commands
deploy-docker: docker-build docker-up migrate ## Full Docker deployment
	@echo "$(GREEN)✓ Deployment complete!$(NC)"

deploy-heroku: ## Deploy to Heroku (backend only)
	@echo "$(BLUE)Deploying to Heroku...$(NC)"
	cd backend && heroku create marxen-api 2>/dev/null || true
	cd backend && git push heroku main
	cd backend && heroku run npm run migrate
	@echo "$(GREEN)✓ Backend deployed$(NC)"
	@echo "$(YELLOW)Frontend: Install Vercel CLI and run 'cd frontend && vercel --prod'$(NC)"

# Health checks
health: ## Check API health
	@echo "$(BLUE)Checking API health...$(NC)"
	@curl -s http://localhost:5000/health | jq . || echo "API not responding"

status: ## Check all service status
	@echo "$(BLUE)Marxen Services Status:$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Containers:$(NC)"
	@docker-compose ps 2>/dev/null || echo "Docker compose not running"
	@echo ""
	@echo "$(YELLOW)API Health:$(NC)"
	@curl -s http://localhost:5000/health 2>/dev/null | jq . || echo "Backend not running"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost 2>/dev/null || echo "Frontend not running"

# Development helpers
lint: ## Run linting
	@echo "$(BLUE)Linting code...$(NC)"
	cd backend && npm run lint
	cd frontend && npm run test

check-ports: ## Check if required ports are available
	@echo "$(BLUE)Checking port availability...$(NC)"
	@if lsof -i :5000 >/dev/null 2>&1; then echo "$(YELLOW)⚠ Port 5000 is in use$(NC)"; else echo "$(GREEN)✓ Port 5000 is free$(NC)"; fi
	@if lsof -i :5173 >/dev/null 2>&1; then echo "$(YELLOW)⚠ Port 5173 is in use$(NC)"; else echo "$(GREEN)✓ Port 5173 is free$(NC)"; fi
	@if lsof -i :5432 >/dev/null 2>&1; then echo "$(YELLOW)⚠ Port 5432 is in use$(NC)"; else echo "$(GREEN)✓ Port 5432 is free$(NC)"; fi

# Documentation
docs: ## Open documentation in default browser
	@echo "$(BLUE)Available documentation:$(NC)"
	@echo "  - QUICK_START.md"
	@echo "  - DEPLOYMENT_VERIFICATION.md"
	@echo "  - ARCHITECTURE.md"
	@echo "  - QUICK_REFERENCE.md"
	@echo "  - PRODUCTION_READY.md"

# Database helpers
db-backup: ## Backup database
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	@pg_dump marxen > backups/marxen-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✓ Backup created$(NC)"

db-restore: ## Restore database from backup (requires BACKUP_FILE=path/to/backup.sql)
	@echo "$(BLUE)Restoring database...$(NC)"
	@if [ -z "$(BACKUP_FILE)" ]; then echo "$(YELLOW)Usage: make db-restore BACKUP_FILE=path/to/backup.sql$(NC)"; exit 1; fi
	@psql marxen < $(BACKUP_FILE)
	@echo "$(GREEN)✓ Database restored$(NC)"

db-drop: ## Drop and recreate database (WARNING: Destructive!)
	@echo "$(YELLOW)⚠ This will delete all data!$(NC)"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		dropdb marxen 2>/dev/null || true; \
		createdb marxen; \
		echo "$(GREEN)✓ Database recreated$(NC)"; \
	fi

# Quick setup
quick-setup: install migrate ## Quick setup: install dependencies and run migrations

full-setup: clean install migrate docker-build ## Full setup from scratch

# Helpers
version: ## Show versions
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@echo "Docker: $$(docker --version 2>/dev/null || echo 'Not installed')"
	@echo "PostgreSQL: $$(psql --version 2>/dev/null || echo 'Not installed')"
