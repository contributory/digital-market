# Testing Guide

This guide covers the comprehensive testing setup for the monorepo, including unit tests, integration tests, and end-to-end tests.

## Table of Contents

- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Test Database Setup](#test-database-setup)
- [Writing Tests](#writing-tests)
- [CI/CD Testing](#cicd-testing)
- [Best Practices](#best-practices)

## Testing Stack

### API Testing

- **Vitest**: Fast unit test framework
- **Supertest**: HTTP assertion library for API testing
- **Test Database**: PostgreSQL (via Docker)

### Web Testing

- **Vitest**: Unit tests for components and utilities
- **React Testing Library**: Component testing
- **Playwright**: End-to-end browser testing
- **jsdom**: DOM environment for unit tests

## Running Tests

### All Tests

```bash
# Run all tests (unit + E2E)
pnpm test

# Run unit tests only
pnpm test:unit

# Run E2E tests only
pnpm test:e2e
```

### API Tests

```bash
# Run API unit tests
pnpm --filter api test

# Run in watch mode
pnpm --filter api test:watch

# Run with coverage
pnpm --filter api test -- --coverage
```

### Web Tests

```bash
# Run Web unit tests
pnpm --filter web test:unit

# Run in watch mode
pnpm --filter web test:unit:watch

# Run E2E tests
pnpm --filter web test:e2e

# Run E2E tests with UI
pnpm --filter web test:e2e:ui

# Run with coverage
pnpm --filter web test:unit -- --coverage
```

## Unit Testing

### API Unit Tests (Vitest + Supertest)

Location: `apps/api/src/**/__tests__/*.test.ts`

Example API test:

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../index';

describe('Health Routes', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});
```

#### Testing Authenticated Routes

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../index';

describe('Protected Routes', () => {
  let authToken: string;

  beforeAll(async () => {
    // Get auth token
    const response = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    authToken = response.body.token;
  });

  it('should access protected route with token', async () => {
    const response = await request(app)
      .get('/account/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
  });

  it('should reject without token', async () => {
    const response = await request(app).get('/account/profile');

    expect(response.status).toBe(401);
  });
});
```

### Web Unit Tests (Vitest + React Testing Library)

Location: `apps/web/**/__tests__/*.test.tsx`

Example component test:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByText('Click me');
    expect(button).toBeDisabled();
  });
});
```

#### Testing Forms

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../login-form';

describe('LoginForm', () => {
  it('should display validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should submit valid form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

## Integration Testing

Integration tests verify that multiple components work together correctly.

### API Integration Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../index';
import { setupTestDb, teardownTestDb } from '../../test/helpers';

describe('Product Integration Tests', () => {
  beforeEach(async () => {
    await setupTestDb();
  });

  afterEach(async () => {
    await teardownTestDb();
  });

  it('should create and retrieve product', async () => {
    // Create product
    const createResponse = await request(app).post('/products').send({
      name: 'Test Product',
      price: 29.99,
      description: 'A test product',
    });

    expect(createResponse.status).toBe(201);
    const productId = createResponse.body.id;

    // Retrieve product
    const getResponse = await request(app).get(`/products/id/${productId}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.name).toBe('Test Product');
  });
});
```

## End-to-End Testing

E2E tests verify complete user flows using Playwright.

Location: `apps/web/tests/*.spec.ts`

### Authentication Flow Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register and login', async ({ page }) => {
    // Register
    await page.goto('/register');

    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123');

    await page.click('button[type="submit"]');

    await expect(page.getByText('Registration successful!')).toBeVisible();

    // Login
    await page.goto('/login');

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123');

    await page.click('button[type="submit"]');

    await page.waitForURL('/');

    // Verify logged in
    await expect(page.getByText('Test User')).toBeVisible();
  });
});
```

### Checkout Flow Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should complete checkout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    // Add product to cart
    await page.goto('/products');
    await page.click('button:has-text("Add to Cart")').first();

    // Go to cart
    await page.click('a[href="/cart"]');

    await expect(page.getByText('Shopping Cart')).toBeVisible();

    // Proceed to checkout
    await page.click('button:has-text("Checkout")');

    // Fill shipping information
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="postalCode"]', '12345');

    // Complete payment (test mode)
    await page.click('button:has-text("Place Order")');

    await expect(page.getByText('Order Confirmed')).toBeVisible();
  });
});
```

### Admin Management Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Management', () => {
  test('should manage products', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'AdminPassword123');
    await page.click('button[type="submit"]');

    // Navigate to admin panel
    await page.goto('/admin/products');

    // Create new product
    await page.click('button:has-text("Add Product")');

    await page.fill('input[name="name"]', 'New Product');
    await page.fill('input[name="price"]', '49.99');
    await page.fill('textarea[name="description"]', 'A new product');

    await page.click('button[type="submit"]');

    await expect(page.getByText('Product created successfully')).toBeVisible();

    // Verify product appears in list
    await expect(page.getByText('New Product')).toBeVisible();

    // Edit product
    await page.click(`button[aria-label="Edit New Product"]`);
    await page.fill('input[name="price"]', '39.99');
    await page.click('button:has-text("Save")');

    await expect(page.getByText('Product updated successfully')).toBeVisible();
  });
});
```

## Test Database Setup

### Starting Test Database

The test database runs in a separate Docker container to avoid conflicts with development data.

```bash
# Start test database
./scripts/test-db.sh

# Verify it's running
docker ps | grep postgres-test
```

### Stopping Test Database

```bash
# Stop and remove test database
./scripts/test-db-down.sh
```

### Database Configuration

Test database configuration (`.env.test`):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/myapp_test
NODE_ENV=test
LOG_LEVEL=error
```

### Reset Database Between Tests

```typescript
// apps/api/src/test/helpers.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupTestDb() {
  // Clear all tables
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Seed with test data if needed
  await seedTestData();
}

export async function teardownTestDb() {
  await prisma.$disconnect();
}

async function seedTestData() {
  // Add test users, products, etc.
}
```

## Writing Tests

### Best Practices

1. **Use Descriptive Names**: Test names should clearly describe what they test

   ```typescript
   // Good
   it('should return 404 when product not found', async () => {});

   // Bad
   it('test product endpoint', async () => {});
   ```

2. **Follow AAA Pattern**: Arrange, Act, Assert

   ```typescript
   it('should calculate total price', () => {
     // Arrange
     const items = [
       { price: 10, quantity: 2 },
       { price: 5, quantity: 3 },
     ];

     // Act
     const total = calculateTotal(items);

     // Assert
     expect(total).toBe(35);
   });
   ```

3. **Test One Thing**: Each test should verify one behavior

4. **Use Factories**: Create test data with factories

   ```typescript
   function createTestUser(overrides = {}) {
     return {
       name: 'Test User',
       email: `test${Date.now()}@example.com`,
       password: 'Password123',
       ...overrides,
     };
   }
   ```

5. **Clean Up**: Always clean up after tests

   ```typescript
   afterEach(async () => {
     await cleanupTestData();
   });
   ```

### Test Coverage

Generate coverage reports:

```bash
# API coverage
pnpm --filter api test -- --coverage

# Web coverage
pnpm --filter web test:unit -- --coverage
```

Coverage reports are generated in:

- `apps/api/coverage/`
- `apps/web/coverage/`

### What to Test

**Do Test:**

- Business logic
- API endpoints
- Form validation
- Error handling
- User interactions
- Authentication/authorization
- Critical user flows

**Don't Test:**

- Third-party libraries
- Framework internals
- Trivial getters/setters
- Static content

## CI/CD Testing

### GitHub Actions

Tests run automatically on pull requests via GitHub Actions (`.github/workflows/ci.yml`).

Pipeline stages:

1. **Lint & Type Check**: Code quality checks
2. **Unit Tests**: API and Web unit tests
3. **E2E Tests**: Playwright tests
4. **Build**: Production build verification

### Running Tests Locally Like CI

```bash
# Lint
pnpm lint

# Type check
pnpm type-check

# Unit tests
pnpm test:unit

# E2E tests (requires services running)
pnpm test:e2e

# Build
pnpm build
```

### Test Environment Variables in CI

Set these in GitHub Actions secrets:

- `DATABASE_URL`: Test database connection
- `JWT_SECRET`: Test JWT secret
- `NEXTAUTH_SECRET`: Test NextAuth secret

## Debugging Tests

### API Tests

```bash
# Run single test file
pnpm --filter api test src/routes/__tests__/health.test.ts

# Run with debugging
NODE_OPTIONS='--inspect-brk' pnpm --filter api test

# Verbose output
pnpm --filter api test -- --reporter=verbose
```

### Web Tests

```bash
# Run single test file
pnpm --filter web test:unit components/__tests__/button.test.tsx

# Debug mode
pnpm --filter web test:unit -- --inspect-brk

# UI mode (interactive)
pnpm --filter web test:unit -- --ui
```

### Playwright Tests

```bash
# Run in headed mode (see browser)
pnpm --filter web test:e2e -- --headed

# Debug mode (pause on failure)
pnpm --filter web test:e2e -- --debug

# Run specific test
pnpm --filter web test:e2e tests/auth.spec.ts

# UI mode (interactive)
pnpm --filter web test:e2e:ui
```

## Troubleshooting

### Tests Timing Out

Increase timeout in test configuration:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 30000, // 30 seconds
  },
});

// playwright.config.ts
export default defineConfig({
  timeout: 60000, // 60 seconds
});
```

### Database Connection Issues

- Verify test database is running: `docker ps`
- Check DATABASE_URL in `.env.test`
- Ensure port 5433 is not in use

### Flaky Tests

- Add explicit waits for async operations
- Use `waitFor` for assertions
- Avoid time-dependent tests
- Use test fixtures for consistent data

### Port Conflicts

If ports are in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

## Performance

### Running Tests in Parallel

Vitest runs tests in parallel by default. Configure workers:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    maxWorkers: 4, // Run 4 tests concurrently
  },
});
```

### Caching

Tests use cached dependencies in CI. Locally:

```bash
# Clear test cache
pnpm --filter api test -- --clearCache
pnpm --filter web test:unit -- --clearCache
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
