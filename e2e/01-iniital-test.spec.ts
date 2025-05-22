import { test, expect } from '@playwright/test';

test('homepage has title and loads', async ({ page }) => {
  await page.goto('http://127.0.0.1:5500/src/index.html');
  await expect(page).toHaveTitle(/Robot Challenge Visualizer/i);
});
