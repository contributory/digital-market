# NextAuth Implementation Guide

This document describes the NextAuth authentication flow implementation for this monorepo.

## Overview

The authentication system uses:

- **Backend**: Express.js with JWT tokens (access + refresh)
- **Frontend**: Next.js 14+ with NextAuth v5 (beta)
- **Storage**: Secure HTTP-only cookies (tokens never exposed to client JS)
- **Flow**: Credentials-based login with role-based access control

## Architecture

### Backend (Express API)

Located in `apps/api/src/`:

#### Auth Routes (`/auth/*`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user (requires authentication)

#### Key Files

- `controllers/authController.ts` - Auth business logic
- `middleware/auth.ts` - Authentication middleware
- `models/userStore.ts` - In-memory user store (replace with database)
- `utils/jwt.ts` - JWT token generation and verification
- `utils/password.ts` - Password hashing with bcrypt

### Frontend (Next.js)

Located in `apps/web/`:

#### NextAuth Configuration

- `lib/auth.ts` - NextAuth configuration with Credentials provider
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route handlers
- `app/api/auth/refresh/route.ts` - Token refresh endpoint

#### Pages

- `app/login/page.tsx` - Login form with React Hook Form
- `app/register/page.tsx` - Registration form with validation
- `app/account/page.tsx` - Protected customer account page
- `app/checkout/page.tsx` - Protected checkout page
- `app/admin/page.tsx` - Protected admin-only page

#### Middleware

- `middleware.ts` - Route protection and role-based access control

#### Components & Utilities

- `components/SessionProvider.tsx` - NextAuth session provider wrapper
- `lib/apiClient.ts` - API client with automatic token injection
- `lib/useAuthApiClient.ts` - Hook for using API client with session

### Shared Package

Located in `packages/shared/src/`:

- `authTypes.ts` - Shared auth types and Zod schemas
- `types.ts` - Common API response types

## Features

### 1. User Registration

- Email/password registration with validation
- Password requirements: min 8 chars, uppercase, lowercase, and number
- Client-side validation using React Hook Form + Zod
- Server-side validation on backend

### 2. User Login

- Credentials-based authentication
- Returns access token (15 min) and refresh token (7 days)
- Tokens stored in NextAuth JWT session
- Secure HTTP-only cookies

### 3. Protected Routes

The following routes require authentication:

- `/account` - Customer account dashboard
- `/checkout` - Checkout page
- `/admin` - Admin-only dashboard (requires ADMIN role)

Unauthenticated users are redirected to `/login` with callback URL.

### 4. Role-Based Access Control

Two roles supported:

- `CUSTOMER` - Default role for new users
- `ADMIN` - Admin users with elevated permissions

### 5. Token Refresh

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Automatic token refresh via NextAuth callbacks
- Manual refresh endpoint at `/api/auth/refresh`

### 6. Session Management

- Server-side session retrieval via `auth()` in Server Components
- Client-side session via `useSession()` hook
- Session includes user profile, role, and tokens

### 7. API Client with Token Injection

The `apiClient` automatically injects access tokens into requests:

```typescript
import { apiClient } from '@/lib/apiClient';
import { useAuthApiClient } from '@/lib/useAuthApiClient';

// In client components
const MyComponent = () => {
  const client = useAuthApiClient();

  const fetchData = async () => {
    const response = await client.get('/some-endpoint');
  };
};
```

## Security Features

1. **Tokens in HTTP-Only Cookies**: Access and refresh tokens never exposed to client JavaScript
2. **Password Hashing**: Bcrypt with 10 salt rounds
3. **JWT Signing**: All tokens signed with secret key
4. **CORS Protection**: CORS configured for specific origin
5. **Helmet.js**: Security headers enabled
6. **Input Validation**: Zod schemas on both client and server

## Testing

Integration tests are located in `apps/web/tests/auth.spec.ts`.

Run tests:

```bash
cd apps/web
pnpm test
```

Tests cover:

- User registration with validation
- Login with valid/invalid credentials
- Protected route redirects
- Sign out functionality
- Token security (no leaks to client)

## Environment Variables

### Backend (`apps/api/.env`)

```env
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000
JWT_SECRET=your-jwt-secret-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (`apps/web/.env.local`)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Development

### Starting the Apps

```bash
# Start both apps
pnpm dev

# Or individually
cd apps/api && pnpm dev
cd apps/web && pnpm dev
```

### Building

```bash
# Build all apps
pnpm build

# Build shared package
cd packages/shared && pnpm build
```

## Future Enhancements

1. **Database Integration**: Replace in-memory user store with PostgreSQL/Prisma
2. **Email Verification**: Add email verification flow
3. **Password Reset**: Implement forgot password functionality
4. **OAuth Providers**: Add Google, GitHub OAuth providers
5. **Rate Limiting**: Add rate limiting for auth endpoints
6. **Refresh Token Rotation**: Implement refresh token rotation for enhanced security
7. **Session Revocation**: Add ability to revoke sessions/tokens

## Acceptance Criteria ✅

- [x] Users can register, login, and remain authenticated across page reloads
- [x] Tokens refreshed transparently via NextAuth callbacks
- [x] Protected routes redirect unauthenticated users
- [x] Admin routes allow access based on roles
- [x] Session object contains user profile, role, and JWT
- [x] Tests demonstrate working login/logout + guard logic
- [x] Tokens not leaked to client JS (stored in HTTP-only cookies)
