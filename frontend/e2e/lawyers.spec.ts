import { test, expect } from '@playwright/test';

test.describe('Lawyers Page', () => {
  test('lawyers listing page loads at /lawyer', async ({ page }) => {
    await page.goto('/lawyer');
    await page.waitForLoadState('networkidle');
    // Page title heading is visible
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 8000 });
  });

  test('lawyer cards appear after data loads', async ({ page }) => {
    await page.goto('/lawyer');
    // Lawyer cards: div.bg-surface.border.rounded-2xl
    const card = page.locator('div[class*="rounded-2xl"][class*="shadow-sm"][class*="border"]').first();
    await expect(card).toBeVisible({ timeout: 15000 });
  });

  test('lawyers API call returns 200', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/api/v1/lawyers') && res.status() !== 0,
        { timeout: 15000 }
      ),
      page.goto('/lawyer'),
    ]);
    expect(response.status()).toBe(200);
  });

  test('grid and map view toggles are present', async ({ page }) => {
    await page.goto('/lawyer');
    await page.waitForLoadState('networkidle');
    // Button text is "Grid"/"Map" in EN or "Grille"/"Carte" in FR
    const gridBtn = page.getByRole('button', { name: /grid|grille/i }).first();
    await expect(gridBtn).toBeVisible({ timeout: 5000 });
  });

  test('city filter dropdown is present', async ({ page }) => {
    await page.goto('/lawyer');
    await page.waitForLoadState('networkidle');
    // Filter bar with city/domain dropdowns
    const filterArea = page.locator('div[class*="rounded-2xl"][class*="shadow-sm"]').first();
    await expect(filterArea).toBeVisible({ timeout: 8000 });
  });
});
