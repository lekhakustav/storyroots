import { expect, test } from '@playwright/test';

test('visitor can start StoryRoots with only an email', async ({ page }) => {
  await page.route('**/api/storyroots-interest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, notificationSent: true, developmentFallback: false }),
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Keep every voice close.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'I want to try', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'I want to try', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Try StoryRoots' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Where can we reach you?' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();

  await page.getByLabel('Email').fill('anisha@example.com');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You’re on the list.' })).toBeVisible();
});

test('email step stays clear and usable on a phone screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'I want to try', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Where can we reach you?' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Enter a valid email.', { exact: true })).toBeVisible();
});

test('scrolling reveals the StoryRoots story and temporarily docks the action right', async ({ page }) => {
  await page.goto('/');
  const actionDock = page.locator('.cinematic-action-dock');
  const action = page.getByRole('button', { name: 'I want to try', exact: true });

  await expect(action).toBeVisible();
  const settledBox = await action.boundingBox();
  expect(settledBox).not.toBeNull();
  expect(Math.abs((settledBox!.x + settledBox!.width / 2) - (await page.evaluate(() => innerWidth / 2)))).toBeLessThan(4);

  const scrollDistance = await page.evaluate(() => (document.documentElement.scrollHeight - innerHeight) * 0.34);
  await page.evaluate((distance) => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, distance);
    let step = 0;
    const timer = window.setInterval(() => {
      window.scrollBy(0, step % 2 === 0 ? 1 : -1);
      step += 1;
      if (step === 10) window.clearInterval(timer);
    }, 60);
  }, scrollDistance);

  await expect(actionDock).toHaveAttribute('data-scroll-state', 'moving');
  await page.waitForTimeout(420);

  const movingBox = await action.boundingBox();
  expect(movingBox).not.toBeNull();
  expect(movingBox!.x + movingBox!.width / 2).toBeGreaterThan(settledBox!.x + settledBox!.width / 2 + 20);

  await expect(page.getByRole('heading', { name: 'We guide every conversation.' })).toBeVisible();
  await expect(actionDock).toHaveAttribute('data-scroll-state', 'settled');
  await page.waitForTimeout(650);
  const returnedBox = await action.boundingBox();
  expect(returnedBox).not.toBeNull();
  expect(Math.abs((returnedBox!.x + returnedBox!.width / 2) - (await page.evaluate(() => innerWidth / 2)))).toBeLessThan(4);
});

test('background and keepsake formats stay inside the compact scroll story', async ({ page }) => {
  await page.goto('/');

  const background = page.locator('.cinematic-image img');
  await expect(background).toBeVisible();
  await expect.poll(() => background.evaluate((image) => {
    const element = image as HTMLImageElement;
    return element.complete && element.naturalWidth > 0;
  })).toBe(true);
  expect(await background.getAttribute('src')).toContain('/_next/static/media/');

  const storyViewportRatio = await page.evaluate(() => {
    const story = document.querySelector('.cinematic-scroll-story');
    return story ? story.getBoundingClientRect().height / window.innerHeight : 0;
  });
  expect(storyViewportRatio).toBeLessThanOrEqual(3.7);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByRole('heading', { name: 'Made to hold. Made to hear.' })).toBeVisible();

  for (const format of ['Hardcover novel', 'Short storybook', 'Diary-style keepsake', 'Audiobook']) {
    await expect(page.getByText(format, { exact: true })).toBeVisible();
  }
});
