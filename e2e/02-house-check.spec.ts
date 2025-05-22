import { test, expect } from '@playwright/test';

const roads: string[] = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  'Marketplace-Farm',
  'Marketplace-Post Office',
  'Marketplace-Shop',
  'Marketplace-Town Hall',
  'Shop-Town Hall',
];

test('should render all houses (places) in the village map', async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/src/index.html');
    const places = Array.from(new Set(roads.flatMap(r => r.split('-'))));
  const ids = places.map(place => place.replace(/'/g, '').replace(/\s/g, ''));
  for (const id of ids) {
    await expect(page.locator(`#${id}.place`)).toBeVisible();
  }
});