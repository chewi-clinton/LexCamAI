import { test, expect } from '@playwright/test';

const TEST_EMAIL = `pw_${Date.now()}@lexcamtest.io`;
const TEST_PASSWORD = 'TestPass123!';

test.describe('Authentication', () => {
  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('register form shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    const submitBtn = page.getByRole('button', { name: /register|sign up|créer|inscription/i }).first();
    await submitBtn.click();
    // Should show some validation (HTML5 or custom)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const validationMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMsg.length).toBeGreaterThan(0);
  });

  test('login shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"], input[name="email"]').first().fill('wrong@email.com');
    await page.locator('input[type="password"]').first().fill('wrongpassword');
    await page.getByRole('button', { name: /login|sign in|connexion/i }).first().click();

    // Expect an error message to appear
    await expect(
      page.getByText(/invalid|incorrect|error|wrong|failed|unauthorized/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('register then redirects after success', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Fill form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInputs = page.locator('input[type="password"]');
    const fullNameInput = page.locator('input[name="full_name"], input[placeholder*="name"], input[placeholder*="nom"]').first();

    await emailInput.fill(TEST_EMAIL);
    if (await fullNameInput.isVisible()) {
      await fullNameInput.fill('Playwright Test');
    }
    await passwordInputs.first().fill(TEST_PASSWORD);
    if (await passwordInputs.nth(1).isVisible()) {
      await passwordInputs.nth(1).fill(TEST_PASSWORD);
    }

    // Accept consent if present
    const consentCheckbox = page.locator('input[type="checkbox"]').first();
    if (await consentCheckbox.isVisible()) {
      await consentCheckbox.check();
    }

    await page.getByRole('button', { name: /register|sign up|créer|inscription/i }).first().click();

    // Should redirect or show OTP/success page
    await expect(page).not.toHaveURL('/register', { timeout: 15000 });
  });
});
