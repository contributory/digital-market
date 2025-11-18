# Deployment Guide

This guide covers deploying the monorepo to production, including environment configuration, build processes, database migrations, and hosting recommendations.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Building for Production](#building-for-production)
- [Database Setup](#database-setup)
- [Stripe Webhook Configuration](#stripe-webhook-configuration)
- [Hosting Options](#hosting-options)
- [Running in Production](#running-in-production)
- [Monitoring and Logging](#monitoring-and-logging)
- [CI/CD Pipeline](#cicd-pipeline)

## Prerequisites

Before deploying, ensure you have:

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database (production instance)
- Stripe account with API keys
- Domain name (for production deployment)

## Environment Variables

### API Environment Variables

Create a `.env` file in `apps/api/` with the following variables:

```env
# Server
NODE_ENV=production
PORT=4000
API_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# JWT
JWT_SECRET=your-secure-jwt-secret-256-bits-minimum
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/api/app.log

# Monitoring (Optional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Web Environment Variables

Create a `.env.production` file in `apps/web/` with:

```env
# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Database (for Prisma, if used)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secure-nextauth-secret-256-bits-minimum

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# JWT (must match API)
JWT_SECRET=your-secure-jwt-secret-256-bits-minimum
```

### Required Environment Variables Reference

| Variable                | Required | Description                              |
| ----------------------- | -------- | ---------------------------------------- |
| `NODE_ENV`              | Yes      | Set to `production`                      |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string             |
| `JWT_SECRET`            | Yes      | Secret for JWT signing (min 256 bits)    |
| `NEXTAUTH_SECRET`       | Yes      | Secret for NextAuth (min 256 bits)       |
| `NEXTAUTH_URL`          | Yes      | Full URL of your app                     |
| `STRIPE_SECRET_KEY`     | Yes      | Stripe secret key (live mode)            |
| `STRIPE_WEBHOOK_SECRET` | Yes      | Stripe webhook signing secret            |
| `CORS_ORIGIN`           | Yes      | Allowed origin for CORS                  |
| `SENTRY_DSN`            | No       | Sentry error tracking DSN                |
| `LOG_LEVEL`             | No       | Logging level (debug, info, warn, error) |
| `LOG_FILE`              | No       | Path to log file                         |

## Building for Production

### Step 1: Install Dependencies

```bash
pnpm install --frozen-lockfile
```

### Step 2: Build All Packages

The build process should happen in order: shared packages first, then apps.

```bash
pnpm build
```

This command:

1. Builds `packages/shared` (TypeScript types and utilities)
2. Builds `apps/web` (Next.js with standalone output)
3. Builds `apps/api` (Express with tsup bundler)

### Build Artifacts

After building, you'll have:

- **Web App**: `apps/web/.next/standalone/` - Self-contained Next.js server
- **Web Static**: `apps/web/.next/static/` - Static assets
- **Web Public**: `apps/web/public/` - Public assets
- **API**: `apps/api/dist/` - Bundled Express server
- **Shared**: `packages/shared/dist/` - Shared types (consumed by apps)

### Next.js Standalone Output

The web app uses Next.js standalone output mode for optimized production deployments. The standalone build includes:

- Minimal dependencies (only what's needed)
- Self-contained server
- Optimized for Docker containers

To copy the complete standalone build:

```bash
# Copy standalone server
cp -r apps/web/.next/standalone ./deploy/

# Copy static assets
cp -r apps/web/.next/static ./deploy/.next/static

# Copy public assets
cp -r apps/web/public ./deploy/public
```

### Express API Bundle

The API is bundled into a single JavaScript file with all dependencies:

```bash
# The bundled API is at:
apps/api/dist/index.js

# With source maps at:
apps/api/dist/index.js.map
```

## Database Setup

### Using Prisma

If you're using Prisma for database migrations:

#### Step 1: Install Prisma CLI

```bash
pnpm add -D prisma
pnpm add @prisma/client
```

#### Step 2: Initialize Prisma

```bash
cd apps/api
pnpx prisma init
```

#### Step 3: Create Migration

```bash
pnpx prisma migrate dev --name init
```

#### Step 4: Generate Client

```bash
pnpx prisma generate
```

#### Step 5: Deploy to Production

```bash
# Run migrations on production database
DATABASE_URL="postgresql://user:password@host:5432/dbname" \
  pnpx prisma migrate deploy

# Generate Prisma Client for production
pnpx prisma generate
```

### Migration Strategy

For production deployments:

1. **Test migrations** on staging environment first
2. **Backup database** before running migrations
3. **Run migrations** before deploying new code
4. **Rollback plan** - Keep previous version ready

```bash
# Example deployment script
#!/bin/bash
set -e

echo "Backing up database..."
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

echo "Running migrations..."
pnpx prisma migrate deploy

echo "Deploying application..."
pm2 restart all
```

## Stripe Webhook Configuration

### Step 1: Create Webhook Endpoint

In your Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://api.yourdomain.com/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Step 2: Get Webhook Secret

After creating the endpoint:

1. Click on the webhook
2. Click **Reveal** under "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to your `.env` as `STRIPE_WEBHOOK_SECRET`

### Step 3: Implement Webhook Handler

Create a webhook handler in your API:

```typescript
// apps/api/src/routes/webhooks.ts
import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']!;

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful checkout
          break;
        case 'payment_intent.succeeded':
          // Handle successful payment
          break;
        // ... handle other events
      }

      res.json({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
```

### Testing Webhooks Locally

Use Stripe CLI for local testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:4000/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

## Hosting Options

### Option 1: Vercel (Next.js) + Railway (API)

**Best for**: Quick deployment with managed infrastructure

#### Vercel (Web App)

1. **Install Vercel CLI**:

   ```bash
   pnpm add -g vercel
   ```

2. **Deploy**:

   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Configure Environment Variables** in Vercel Dashboard

4. **Set Build Configuration**:
   - Build Command: `cd ../.. && pnpm build --filter web`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install`

#### Railway (API)

1. **Create New Project** on Railway

2. **Connect GitHub Repository**

3. **Configure Build**:
   - Root Directory: `apps/api`
   - Build Command: `cd ../.. && pnpm install && pnpm build --filter api`
   - Start Command: `pnpm --filter api start`

4. **Add PostgreSQL Database**: Click "New" → "Database" → "PostgreSQL"

5. **Set Environment Variables** in Railway dashboard

### Option 2: Render (Monorepo)

**Best for**: Unified deployment platform

1. **Create Web Service**:
   - Build Command: `pnpm install && pnpm build --filter web`
   - Start Command: `cd apps/web/.next/standalone && node server.js`

2. **Create API Service**:
   - Build Command: `pnpm install && pnpm build --filter api`
   - Start Command: `pnpm --filter api start`

3. **Create PostgreSQL Database**

4. **Configure Environment Variables** for each service

### Option 3: Docker + VPS (Self-Hosted)

**Best for**: Full control and custom infrastructure

#### Step 1: Create Dockerfiles

**API Dockerfile** (`apps/api/Dockerfile`):

```dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules
RUN pnpm build --filter api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=dependencies /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
```

**Web Dockerfile** (`apps/web/Dockerfile`):

```dockerfile
FROM node:18-alpine AS base
RUN corepack enable && corepack prepare pnpm@8 --activate

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
RUN pnpm build --filter web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

#### Step 2: Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - '4000:4000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - api
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Step 3: Deploy to VPS

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Running in Production

### Using pnpm

```bash
# Build everything
pnpm build

# Start all services
pnpm start
```

This runs both services concurrently:

- API on configured PORT (default: 4000)
- Web on port 3000

### Using PM2 (Process Manager)

For better process management:

```bash
# Install PM2
pnpm add -g pm2

# Create ecosystem file
pm2 ecosystem
```

Edit `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'api',
      cwd: './apps/api',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      instances: 2,
      exec_mode: 'cluster',
    },
    {
      name: 'web',
      cwd: './apps/web/.next/standalone',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 2,
      exec_mode: 'cluster',
    },
  ],
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

## Monitoring and Logging

### Winston Logger

The API uses Winston for structured logging. Logs include:

- Request/response logging
- Error tracking with stack traces
- Performance metrics
- Custom application events

**Log Levels**:

- `error`: Error events
- `warn`: Warning events
- `info`: Informational messages
- `debug`: Detailed debugging information

**Configuration**:

```env
# Set log level
LOG_LEVEL=info

# Optional: Log to file
LOG_FILE=/var/log/api/app.log
```

### Sentry Integration

Sentry provides error tracking and performance monitoring:

1. **Create Sentry Project**: Go to sentry.io and create a new project

2. **Get DSN**: Copy your project DSN

3. **Configure Environment**:

   ```env
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

4. **Sentry Features**:
   - Automatic error capture
   - Stack traces
   - Release tracking
   - Performance monitoring
   - User feedback

### Health Checks

The API includes a health check endpoint:

```bash
curl https://api.yourdomain.com/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

Use this endpoint for:

- Load balancer health checks
- Monitoring systems (Datadog, New Relic)
- Uptime monitoring (UptimeRobot, Pingdom)

## CI/CD Pipeline

### GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. **Lints and type-checks** all code
2. **Runs unit tests** for API and Web
3. **Runs E2E tests** with Playwright
4. **Builds production artifacts**
5. **Caches dependencies** for faster builds

### Pipeline Stages

1. **Lint & Type Check**: Validates code quality
2. **Unit Tests**: Tests individual components and functions
3. **E2E Tests**: Tests complete user flows
4. **Build**: Ensures production build succeeds

### Running Locally

```bash
# Lint
pnpm lint

# Type check
pnpm type-check

# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:e2e
```

## Performance Optimization

### Next.js Optimizations

- **Standalone output**: Minimal bundle size
- **Image optimization**: Automatic image optimization
- **Code splitting**: Automatic route-based splitting
- **Static generation**: Pre-render pages when possible

### API Optimizations

- **Compression**: Gzip compression enabled
- **Helmet**: Security headers
- **CORS**: Optimized CORS configuration
- **Clustering**: Use PM2 cluster mode

### Database Optimizations

- **Connection pooling**: Configure connection pool size
- **Indexes**: Add indexes for frequently queried fields
- **Query optimization**: Use EXPLAIN to analyze slow queries

## Troubleshooting

### Build Failures

```bash
# Clear all build caches
rm -rf apps/web/.next
rm -rf apps/api/dist
rm -rf packages/shared/dist
rm -rf node_modules
pnpm install
pnpm build
```

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check database is accessible from server
- Verify SSL settings if required
- Check connection limits

### Environment Variable Issues

- Ensure all required variables are set
- Check variable names match exactly
- Verify secrets are not exposed in logs

### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

## Security Checklist

- [ ] All secrets use strong random values (256+ bits)
- [ ] Environment variables not committed to Git
- [ ] HTTPS enabled for all production domains
- [ ] CORS configured to allow only your domain
- [ ] Rate limiting enabled on API endpoints
- [ ] Database backups automated
- [ ] Webhook signatures verified
- [ ] Sentry configured for error tracking
- [ ] Security headers enabled (via Helmet)
- [ ] Dependencies updated regularly

## Support

For issues or questions:

- Check existing documentation
- Review GitHub Issues
- Contact development team

## Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Sentry Documentation](https://docs.sentry.io/)
