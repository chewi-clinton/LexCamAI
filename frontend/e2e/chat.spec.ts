import { test, expect } from '@playwright/test';

test.describe('Chat / AI Assistant', () => {
  test('chat page loads without redirect', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    // Chat page is accessible to all users (no forced redirect)
    await expect(page).toHaveURL(/\/chat/);
  });

  test('chat page has message textarea', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 10000 });
  });

  test('chat page has send button', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    // Send button is next to the textarea
    const sendBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(sendBtn).toBeVisible({ timeout: 5000 });
  });

  test('chat sidebar shows new consultation button', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    // The sidebar has a "New Consult" or "Nouvelle Consultation" button
    const newBtn = page.locator('button').filter({ hasText: /consult|consultation/i }).first();
    await expect(newBtn).toBeVisible({ timeout: 8000 });
  });

  test('typing a message populates the textarea', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
    const textarea = page.locator('textarea').first();
    await textarea.fill('What is the minimum wage in Cameroon?');
    await expect(textarea).toHaveValue('What is the minimum wage in Cameroon?');
  });

  test('chat ?q= param auto-sends a question and shows user bubble', async ({ page }) => {
    const q = encodeURIComponent('What are worker rights in Cameroon?');
    await page.goto(`/chat?q=${q}`);
    // Use domcontentloaded — networkidle hangs when SSE stream is open
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500); // let the auto-send dispatch
    // User message bubble: bg-primary rounded-2xl
    const userMsg = page.locator('div[class*="bg-primary"][class*="rounded-2xl"]').first();
    await expect(userMsg).toBeVisible({ timeout: 15000 });
  });

  // Streaming response requires an OTP-verified account — run manually with env vars
  test.skip('chat streaming produces an AI response (requires verified account)', async () => {
    // To enable: set LEXCAM_EMAIL and LEXCAM_PASSWORD env vars for a verified account
  });
});
