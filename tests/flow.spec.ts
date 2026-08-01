import { expect, test } from '@playwright/test';

test('story workspace reaches the PDF step', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'Your family stories' })).toBeVisible();
  await page.getByRole('link', { name: /Continue story/ }).first().click();
  await expect(page.getByRole('heading', { name: "Maya's Story" })).toBeVisible();
  await expect(page.getByText('Your story at a glance')).toBeVisible();
  await page.getByRole('button', { name: /Generate PDF/ }).click();
  await expect(page.getByText('Your private PDF is ready to download.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Download/ }).last()).toBeVisible();
});

test('mobile workspace keeps primary actions visible', async ({ page }) => {
  await page.goto('/projects/project_maya');
  await expect(page.getByRole('heading', { name: "Maya's Story" })).toBeVisible();
  await expect(page.getByRole('button', { name: /Generate PDF/ })).toBeVisible();
  if ((page.viewportSize()?.width ?? 1000) < 700) await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
});
