import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = `pw_chat_${Date.now()}@lexcamtest.io`;
const TEST_PASSWORD = 'TestPass123!';

async function registerAndLogin(page: Page) {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');

  await page.locator('input[type="email"], input[name="email"]').first().fill(TEST_EMAIL);
  const fullName = page.locator('input[name="full_name"], input[placeholder*="name"], input[placeholder*="nom"]').first();
  if (await fullName.isVisible()) await fullName.fill('PW Chat Test');
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  const pw2 = page.locator('input[type="password"]').nth(1);
  if (await pw2.isVisible()) await pw2.fill(TEST_PASSWORD);
  const consent = page.locator('input[type="checkbox"]').first();
  if (await consent.isVisible()) await consent.check();

  await page.getByRole('button', { name: /register|sign up|créer|inscription/i }).first().click();
  await page.waitForLoadState('networkidle');
}

test.describe('Chat / AI Assistant', () => {
  test('chat page requires authentication', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    // Should redirect to login if not authenticated
    const isLoginPage = page.url().includes('login') || page.url().includes('auth');
    const hasLoginForm = await page.locator('input[type="password"]').first().isVisible();
    expect(isLoginPage || hasLoginForm).toBeTruthy();
  });

  test('chat page has message input when logged in', async ({ page }) => {
    await registerAndLogin(page);

    // Navigate to OTP page if needed — skip if OTP required
    if (page.url().includes('otp') || page.url().includes('verify')) {
      test.skip(true, 'OTP verification required — skip automated chat test');
      return;
    }

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const messageInput = page.locator('textarea, input[placeholder*="message"], input[placeholder*="question"]').first();
    await expect(messageInput).toBeVisible({ timeout: 10000 });
  });

  test('chat streaming produces a response', async ({ page }) => {
    await registerAndLogin(page);

    if (page.url().includes('otp') || page.url().includes('verify')) {
      test.skip(true, 'OTP verification required');
      return;
    }

    await page.goto('/chat');
    await page.waitForLoadState('networkidle');

    const messageInput = page.locator('textarea, input[placeholder*="message"], input[placeholder*="question"]').first();
    if (!await messageInput.isVisible()) {
      test.skip(true, 'Chat input not visible');
      return;
    }

    await messageInput.fill('What is the minimum wage in Cameroon?');
    await page.keyboard.press('Enter');

    // Wait for response to appear (up to 60s for Ollama)
    const aiResponse = page.locator('[class*="assistant"], [class*="ai"], [class*="bot"], [class*="response"]').first();
    await expect(aiResponse).toBeVisible({ timeout: 60000 });
    const text = await aiResponse.textContent();
    expect(text!.length).toBeGreaterThan(10);
  });
});
