# Monorepo

A modern full-stack monorepo built with Next.js 14 and Express, managed with pnpm workspaces.

## 📁 Project Structure

```
.
├── apps/
│   ├── web/                    # Next.js 14 frontend (App Router)
│   │   ├── app/                # Next.js app directory
│   │   ├── public/             # Static assets
│   │   └── .env.example        # Environment variables template
│   └── api/                    # Express backend API
│       ├── src/
│       │   ├── config/         # Configuration files
│       │   ├── middleware/     # Express middleware
│       │   ├── routes/         # API routes
│       │   └── utils/          # Utility functions
│       └── .env.example        # Environment variables template
├── packages/
│   └── shared/                 # Shared types and utilities
│       └── src/
│           ├── types.ts        # Shared TypeScript types
│           ├── client.ts       # API client helper
│           └── index.ts        # Package exports
├── docker-compose.yml          # Local PostgreSQL + pgAdmin
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── tsconfig.base.json          # Shared TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker (optional, for local database)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd monorepo
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
# For web app
cp apps/web/.env.example apps/web/.env

# For API
cp apps/api/.env.example apps/api/.env
```

4. Start the local database (optional):

```bash
docker-compose up -d
```

### Development

Run both apps concurrently:

```bash
pnpm dev
```

This will start:

- **Next.js frontend** at http://localhost:3000
- **Express API** at http://localhost:4000

Run individual apps:

```bash
# Web app only
pnpm --filter web dev

# API only
pnpm --filter api dev

# Shared package (watch mode)
pnpm --filter @repo/shared dev
```

### Building

Build all apps for production:

```bash
pnpm build
```

Build individual apps:

```bash
# Web app
pnpm --filter web build

# API
pnpm --filter api build

# Shared package
pnpm --filter @repo/shared build
```

Production build outputs:

- Web: `apps/web/.next/`
- API: `apps/api/dist/`
- Shared: `packages/shared/dist/`

### Linting & Formatting

```bash
# Run ESLint on all apps
pnpm lint

# Format all files with Prettier
pnpm format

# Check formatting without making changes
pnpm format:check
```

## 🛠️ Technology Stack

### Frontend (apps/web)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Font Optimization**: next/font

### Backend (apps/api)

- **Framework**: Express.js
- **Language**: TypeScript
- **Build Tool**: tsup
- **Dev Runner**: Nodemon
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Compression**: compression

### Shared (packages/shared)

- **Types**: TypeScript with Zod schemas
- **API Client**: Fetch-based client helper

### Development Tools

- **Package Manager**: pnpm (workspaces)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky (pre-commit linting)
- **Database**: PostgreSQL (via Docker)
- **DB Admin**: pgAdmin

## 🗄️ Database Setup

The project includes a `docker-compose.yml` file for local PostgreSQL and pgAdmin:

```bash
# Start database services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
```

**Access Points:**

- PostgreSQL: `localhost:5432`
  - User: `postgres`
  - Password: `postgres`
  - Database: `myapp_dev`
- pgAdmin: http://localhost:5050
  - Email: `admin@admin.com`
  - Password: `admin`

## 🔐 Environment Variables

### Web App (apps/web/.env)

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# JWT
JWT_SECRET=your-jwt-secret-change-this-in-production
```

### API (apps/api/.env)

```env
# Server
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# JWT
JWT_SECRET=your-jwt-secret-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📦 Package Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Run ESLint on all apps
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting without changes

### Web App

- `pnpm --filter web dev` - Start Next.js dev server
- `pnpm --filter web build` - Build Next.js app
- `pnpm --filter web start` - Start production server
- `pnpm --filter web lint` - Run ESLint

### API

- `pnpm --filter api dev` - Start Express with Nodemon
- `pnpm --filter api build` - Build with tsup
- `pnpm --filter api start` - Start production server
- `pnpm --filter api lint` - Run ESLint

### Shared Package

- `pnpm --filter @repo/shared build` - Build shared package
- `pnpm --filter @repo/shared dev` - Build in watch mode

## 🔧 Architecture

### Error Handling (API)

The API includes centralized error handling with:

- Custom `AppError` class for operational errors
- Zod validation error handling
- Development/production error responses
- 404 handler for unknown routes

Example usage:

```typescript
import { AppError } from './middleware/errorHandler';

throw new AppError(400, 'Invalid request');
```

### Request Validation (API)

Zod-based validation middleware:

```typescript
import { z } from 'zod';
import { validate } from './utils/validation';

const schema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

router.post('/signup', validate(schema), handler);
```

### API Client (Shared)

Type-safe API client for frontend:

```typescript
import { ApiClient } from '@repo/shared';

const client = new ApiClient(process.env.NEXT_PUBLIC_API_URL);
const response = await client.get('/health');
```

## 🎨 Tailwind Configuration

The web app includes a custom Tailwind theme with CSS variables for easy theming:

- Primary, secondary, and accent colors
- Dark mode support
- Custom font families (next/font)
- Reusable design tokens

## 🔒 Git Hooks

Husky is configured with pre-commit hooks:

- Runs ESLint on all apps
- Checks Prettier formatting
- Prevents commits with linting/formatting errors

## 📝 License

MIT

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure linting and tests pass
4. Submit a pull request

## 🐛 Troubleshooting

### pnpm install fails

- Ensure you have pnpm >= 8.0.0: `pnpm --version`
- Clear pnpm store: `pnpm store prune`

### Port already in use

- Change ports in `.env` files
- Kill existing processes: `lsof -ti:3000 | xargs kill -9`

### Docker issues

- Ensure Docker is running
- Remove existing containers: `docker-compose down -v`

### Build errors

- Clear build caches:
  ```bash
  rm -rf apps/web/.next
  rm -rf apps/api/dist
  rm -rf packages/shared/dist
  pnpm install
  ```
