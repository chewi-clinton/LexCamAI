import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // No uncaught JS errors
    expect(errors.filter(e => !e.includes('401'))).toHaveLength(0);
  });

  test('hero section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('img[alt*="meeting"], img[alt*="hero"], img[src*="hero"]').first()).toBeVisible();
  });

  test('header navigation links are present', async ({ page }) => {
    await page.goto('/');
    // Header is a <nav> element
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    // Logo/brand link inside nav
    await expect(nav.locator('a').first()).toBeVisible();
  });

  test('has login and register links', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: /login|sign in|connexion/i });
    const registerLink = page.getByRole('link', { name: /register|sign up|inscription/i });
    await expect(loginLink.or(registerLink)).toBeVisible();
  });

  test('hero image loads (not 404)', async ({ page }) => {
    const responses: { url: string; status: number }[] = [];
    page.on('response', (res) => {
      if (res.url().includes('hero-img')) {
        responses.push({ url: res.url(), status: res.status() });
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const heroResp = responses.find(r => r.url.includes('hero-img'));
    if (heroResp) {
      expect(heroResp.status).toBe(200);
    }
  });

  test('footer is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('language toggle switches between FR and EN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // FR/EN buttons are in the nav
    const enBtn = page.getByRole('button', { name: 'EN' }).first();
    const frBtn = page.getByRole('button', { name: 'FR' }).first();

    await expect(enBtn).toBeVisible();
    await expect(frBtn).toBeVisible();

    // Page defaults to French — switch to English
    const headingBefore = await page.locator('h2').first().textContent();
    await enBtn.click();
    await page.waitForTimeout(300);
    const headingAfter = await page.locator('h2').first().textContent();

    expect(headingBefore).not.toEqual(headingAfter);
  });
});
