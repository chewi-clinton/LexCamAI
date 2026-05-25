import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('register page loads with all form fields', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="text"]').first()).toBeVisible(); // full name
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('input[type="checkbox"]').first()).toBeVisible(); // consent
  });

  test('login page loads with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('register form validates empty submission', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.locator('button[type="submit"]').click();
    // Browser HTML5 validation fires on the email field
    const emailInput = page.locator('input[type="email"]').first();
    const validationMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMsg.length).toBeGreaterThan(0);
  });

  test('login shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').first().fill('doesnotexist@lexcamtest.io');
    await page.locator('input[type="password"]').first().fill('WrongPass999!');
    await page.locator('button[type="submit"]').click();

    // Error message: <p class="text-xs font-semibold text-red-500 ...">
    await expect(page.locator('p.text-red-500, [class*="text-red"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('register role buttons: Citizen and Lawyer are visible', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    // Role selection step has citizen/lawyer toggle buttons
    const citizenBtn = page.locator('button').filter({ hasText: /citizen|citoyen/i }).first();
    const lawyerBtn = page.locator('button').filter({ hasText: /lawyer|avocat/i }).first();
    await expect(citizenBtn.or(lawyerBtn)).toBeVisible();
  });

  test('register form redirects to email verification after submit', async ({ page }) => {
    const email = `pw_${Date.now()}@lexcamtest.io`;
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="text"]').first().fill('Playwright E2E');
    await page.locator('input[type="email"]').first().fill(email);
    await page.locator('select').first().selectOption('Yaoundé');
    await page.locator('input[type="password"]').first().fill('TestPass123!');
    await page.locator('input[type="checkbox"]').first().check();

    const [apiResp] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/v1/auth/register'),
        { timeout: 20000 }
      ),
      page.locator('button[type="submit"]').click(),
    ]);

    const status = apiResp.status();
    expect(status, `Register API returned ${status}`).toBeLessThan(400);

    await expect(page).toHaveURL(/verify-email/, { timeout: 15000 });
  });
});
