import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123');

    await page.click('button[type="submit"]');

    await expect(page.getByText('Registration successful!')).toBeVisible({
      timeout: 5000,
    });

    await page.waitForURL('/login', { timeout: 5000 });
  });

  test('should display validation errors for invalid registration', async ({
    page,
  }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'T');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'weak');

    await page.click('button[type="submit"]');

    await expect(
      page.getByText('Name must be at least 2 characters')
    ).toBeVisible();
    await expect(page.getByText('Invalid email address')).toBeVisible();
    await expect(
      page.getByText(/Password must be at least 8 characters/)
    ).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'Password123';

    await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password,
      }),
    });

    await page.goto('/login');

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    await page.click('button[type="submit"]');

    await page.waitForURL('/', { timeout: 5000 });
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    await expect(page.getByText('Invalid email or password')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should protect /account route and redirect to login', async ({
    page,
  }) => {
    await page.goto('/account');

    await page.waitForURL(/\/login/, { timeout: 5000 });

    const url = new URL(page.url());
    expect(url.searchParams.get('callbackUrl')).toBe('/account');
  });

  test('should access protected route after login', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'Password123';

    await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password,
      }),
    });

    await page.goto('/login?callbackUrl=/account');

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    await page.click('button[type="submit"]');

    await page.waitForURL('/account', { timeout: 5000 });

    await expect(page.getByText('Account Dashboard')).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'Password123';

    await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password,
      }),
    });

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/', { timeout: 5000 });

    await page.goto('/account');
    await page.waitForURL('/account', { timeout: 5000 });

    await page.click('button:has-text("Sign out")');

    await page.waitForURL('/login', { timeout: 5000 });

    await page.goto('/account');
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test('should not leak tokens to client JS', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'Password123';

    await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password,
      }),
    });

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/', { timeout: 5000 });

    const hasAccessToken = await page.evaluate(() => {
      return (
        document.body.innerHTML.includes('accessToken') ||
        document.body.innerHTML.includes('refreshToken')
      );
    });

    expect(hasAccessToken).toBe(false);

    const localStorage = await page.evaluate(() =>
      JSON.stringify(localStorage)
    );
    expect(localStorage).not.toContain('accessToken');
    expect(localStorage).not.toContain('refreshToken');
  });
});
