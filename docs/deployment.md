# 🚀 Deployment Guide

> Panduan deploy aplikasi Hexa Framework ke production

## Table of Contents

- [Persiapan](#persiapan)
- [Environment Variables](#environment-variables)
- [Build Production](#build-production)
- [Deployment Methods](#deployment-methods)
  - [Docker](#docker)
  - [PM2](#pm2)
  - [Systemd](#systemd)
- [Cloud Platforms](#cloud-platforms)
  - [Heroku](#heroku)
  - [DigitalOcean](#digitalocean)
  - [AWS EC2](#aws-ec2)
  - [Railway](#railway)
  - [Render](#render)
- [Database](#database)
- [Monitoring](#monitoring)
- [Security](#security)

---

## Persiapan

### Checklist Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Error logging setup
- [ ] Health check endpoint available
- [ ] SSL/TLS certificates ready
- [ ] Backup strategy defined

### Recommended Structure

```
my-api/
├── src/              # Source code
├── dist/             # Compiled code (production)
├── prisma/           # Database schema & migrations
├── .env.example      # Example environment variables
├── .env.production   # Production env (NOT in git)
├── Dockerfile        # Docker configuration
├── docker-compose.yml
├── ecosystem.config.js  # PM2 configuration
└── package.json
```

---

## Environment Variables

### `.env.production`

```bash
# App
NODE_ENV=production
PORT=3000
APP_URL=https://api.yourapp.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=error
LOG_FILE_PATH=/var/log/api/

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload (optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket
AWS_REGION=ap-southeast-1
```

### Security Best Practices

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Never commit .env files
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

---

## Build Production

### 1. Install Dependencies

```bash
# Production dependencies only
npm ci --only=production
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Run Database Migrations

```bash
npx prisma migrate deploy
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Application

```bash
npm start
```

---

## Deployment Methods

### Docker

Recommended untuk consistency across environments.

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start app
CMD ["node", "dist/index.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

#### Build dan Run

```bash
# Build image
docker build -t my-api:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

### PM2

Process manager untuk Node.js applications.

#### Install PM2

```bash
npm install -g pm2
```

#### ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'my-api',
    script: './dist/index.js',
    instances: 'max',  // Cluster mode
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
  }]
};
```

#### Commands

```bash
# Start application
pm2 start ecosystem.config.js --env production

# View status
pm2 status

# View logs
pm2 logs my-api

# Restart
pm2 restart my-api

# Stop
pm2 stop my-api

# Delete from PM2
pm2 delete my-api

# Startup script (autostart on reboot)
pm2 startup
pm2 save
```

#### Zero-Downtime Reload

```bash
# Reload without downtime
pm2 reload my-api

# Or with ecosystem file
pm2 reload ecosystem.config.js --env production
```

---

### Systemd

Linux service untuk autostart.

#### /etc/systemd/system/my-api.service

```ini
[Unit]
Description=My API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/my-api
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/var/www/my-api/.env.production
ExecStart=/usr/bin/node /var/www/my-api/dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=my-api

[Install]
WantedBy=multi-user.target
```

#### Commands

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start service
sudo systemctl start my-api

# Enable autostart
sudo systemctl enable my-api

# Check status
sudo systemctl status my-api

# View logs
sudo journalctl -u my-api -f

# Restart
sudo systemctl restart my-api
```

---

## Cloud Platforms

### Heroku

#### 1. Install Heroku CLI

```bash
npm install -g heroku
heroku login
```

#### 2. Create App

```bash
heroku create my-api
```

#### 3. Add PostgreSQL

```bash
heroku addons:create heroku-postgresql:mini
```

#### 4. Configure Environment

```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
```

#### 5. Procfile

```
web: npm start
release: npx prisma migrate deploy
```

#### 6. Deploy

```bash
git push heroku master
```

#### 7. View Logs

```bash
heroku logs --tail
```

---

### DigitalOcean

#### 1. Create Droplet

- OS: Ubuntu 22.04
- Size: $6/month (1GB RAM)
- Add SSH key

#### 2. Setup Server

```bash
# SSH to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx
```

#### 3. Setup PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE mydb;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE mydb TO myuser;
\q
```

#### 4. Deploy Application

```bash
# Create app directory
mkdir -p /var/www/my-api
cd /var/www/my-api

# Clone repository
git clone https://github.com/your-username/my-api.git .

# Install dependencies
npm ci --only=production

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 5. Configure Nginx

```nginx
# /etc/nginx/sites-available/my-api
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/my-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 6. Setup SSL with Let's Encrypt

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d api.yourdomain.com

# Auto-renewal (already setup by certbot)
certbot renew --dry-run
```

---

### AWS EC2

#### 1. Launch EC2 Instance

- AMI: Ubuntu Server 22.04
- Instance Type: t2.micro (free tier)
- Security Group: Allow ports 22, 80, 443

#### 2. Connect and Setup

Same as DigitalOcean setup above.

#### 3. RDS for Database (Optional)

```bash
# Create RDS PostgreSQL instance
# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:pass@your-rds-endpoint:5432/db
```

---

### Railway

Easiest deployment option.

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### 2. Initialize Project

```bash
railway init
```

#### 3. Add PostgreSQL

```bash
railway add --plugin postgresql
```

#### 4. Deploy

```bash
railway up
```

#### 5. Configure Environment

```bash
railway variables set JWT_SECRET=your-secret
```

---

### Render

#### 1. Connect Repository

- Go to render.com
- Connect GitHub repository

#### 2. Configure Service

```yaml
# render.yaml
services:
  - type: web
    name: my-api
    env: node
    buildCommand: npm install && npm run build && npx prisma generate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: my-api-db
          property: connectionString

databases:
  - name: my-api-db
    databaseName: mydb
    user: myuser
```

#### 3. Deploy

Push to GitHub, Render auto-deploys.

---

## Database

### Migration Strategy

#### Production Migrations

```bash
# NEVER use migrate dev in production
# Use migrate deploy instead
npx prisma migrate deploy
```

#### Backup Before Migration

```bash
# PostgreSQL backup
pg_dump -U username -d database > backup.sql

# Restore if needed
psql -U username -d database < backup.sql
```

### Connection Pooling

```typescript
// src/configs/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});

// Connection pool configuration in DATABASE_URL
// postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=30
```

---

## Monitoring

### Health Check Endpoint

```typescript
// src/transports/api/routers/health.ts
import { Router } from 'express';
import { prisma } from '@/configs/database';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

export default router;
```

### PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Web dashboard
pm2 web
```

### Application Performance Monitoring (APM)

```bash
# Install New Relic
npm install newrelic

# Or Datadog
npm install dd-trace --save
```

---

## Security

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### Helmet

```typescript
import helmet from 'helmet';

app.use(helmet());
```

### CORS

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
```

### Environment Security

```bash
# Never commit secrets
git-secrets --install

# Use secrets manager
# AWS Secrets Manager, HashiCorp Vault, etc.
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/my-api
            git pull
            npm ci --only=production
            npm run build
            npx prisma migrate deploy
            pm2 reload ecosystem.config.js --env production
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Out of Memory

```bash
# Increase Node.js memory
node --max-old-space-size=4096 dist/index.js

# Or in PM2
max_memory_restart: '500M'
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Check connection
psql -U username -d database

# View connections
SELECT * FROM pg_stat_activity;
```

---

## Summary Checklist

- [ ] Build passes locally
- [ ] Tests passing
- [ ] Environment variables configured
- [ ] Database migrations deployed
- [ ] SSL certificates installed
- [ ] Health check working
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] CI/CD pipeline working
- [ ] Documentation updated

---

Next: [Best Practices](./best-practices.md)
