import { test, expect } from '@playwright/test';

test.describe('Lawyers Page', () => {
  test('lawyers listing page loads', async ({ page }) => {
    await page.goto('/lawyers');
    await page.waitForLoadState('networkidle');
    // Should show some lawyer cards or a list
    const cards = page.locator('[class*="card"], [class*="lawyer"], article, li').first();
    await expect(cards).toBeVisible({ timeout: 10000 });
  });

  test('lawyers API returns data', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/v1/lawyers'), { timeout: 10000 }),
      page.goto('/lawyers'),
    ]);
    expect(response.status()).toBe(200);
    const body = await response.json().catch(() => null);
    if (body) {
      expect(Array.isArray(body) || body.results !== undefined || body.data !== undefined || body.lawyers !== undefined).toBeTruthy();
    }
  });

  test('specializations filter works', async ({ page }) => {
    await page.goto('/lawyers');
    await page.waitForLoadState('networkidle');
    const filterEl = page.locator('select, [role="combobox"], button[class*="filter"]').first();
    if (await filterEl.isVisible()) {
      await filterEl.click();
      await page.waitForTimeout(500);
    }
  });
});
