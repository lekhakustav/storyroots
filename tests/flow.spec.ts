import { expect, test } from '@playwright/test';

test('visitor can start StoryRoots with only an email', async ({ page }) => {
  await page.route('**/api/storyroots-interest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, notificationSent: true, developmentFallback: false, storageConnected: true }),
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Keep every voice close.' })).toBeVisible();
  await expect(page.getByText('Connecting you to your roots, one voice and story at a time.', { exact: true })).toBeVisible();
  const audiobook = page.getByRole('button', { name: 'Play audio', exact: true });
  await expect(audiobook).toBeVisible();
  await audiobook.click();
  await expect(page.locator('.cinematic-audio-float')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Playing audio', { exact: true })).toBeVisible();
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

test('existing email gets a clear already-saved message', async ({ page }) => {
  await page.route('**/api/storyroots-interest', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, alreadyRegistered: true, storageConnected: true }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'I want to try', exact: true }).click();
  await page.getByLabel('Email').fill('already@example.com');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'That email is already saved.' })).toBeVisible();
  await expect(page.getByText('We already have this address for StoryRoots.', { exact: true })).toBeVisible();
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

test('one strong scroll reveals the story while the action stays centered', async ({ page }) => {
  await page.goto('/');
  const actionDock = page.locator('.cinematic-action-dock');
  const action = page.getByRole('button', { name: 'I want to try', exact: true });

  await expect(action).toBeVisible();
  const settledBox = await action.boundingBox();
  expect(settledBox).not.toBeNull();
  expect(Math.abs((settledBox!.x + settledBox!.width / 2) - (await page.evaluate(() => innerWidth / 2)))).toBeLessThan(4);

  await page.mouse.wheel(0, 1600);

  await expect(actionDock).toHaveAttribute('data-scroll-state', 'moving');

  const movingBox = await action.boundingBox();
  expect(movingBox).not.toBeNull();
  expect(Math.abs((movingBox!.x + movingBox!.width / 2) - (await page.evaluate(() => innerWidth / 2)))).toBeLessThan(4);

  await expect(page.getByRole('heading', { name: 'Their lives, kept in their own words.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Made to hold. Made to hear.' })).not.toBeVisible();
  await expect(page.getByText('Keep their voice, language, and everyday stories close.', { exact: true })).toBeVisible();
  await expect(page.getByText('Turn many conversations into one book for generations.', { exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: 'StoryRoots phone preview showing Chapter 03: Marriage to Dad' })).toBeVisible();
  await expect(page.getByText('Marriage to Dad', { exact: true })).toBeVisible();
  await expect(actionDock).toHaveAttribute('data-scroll-state', 'settled');
  await page.waitForTimeout(650);
  const returnedBox = await action.boundingBox();
  expect(returnedBox).not.toBeNull();
  expect(Math.abs((returnedBox!.x + returnedBox!.width / 2) - (await page.evaluate(() => innerWidth / 2)))).toBeLessThan(4);
});

test('two transparent story cards appear before the unchanged keepsake ending', async ({ page }) => {
  await page.goto('/');

  const scrollRange = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await page.evaluate((distance) => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, distance);
  }, scrollRange * 0.34);
  await expect(page.getByRole('heading', { name: 'Their lives, kept in their own words.' })).toBeVisible();
  await expect(page.locator('.cinematic-story-card')).toBeVisible();
  await expect(page.locator('.cinematic-story-points li')).toHaveCount(2);
  const stablePhone = page.getByRole('img', { name: 'StoryRoots phone preview showing Chapter 03: Marriage to Dad' });
  const firstPhoneBox = await stablePhone.boundingBox();
  expect(firstPhoneBox).not.toBeNull();

  await page.evaluate((distance) => window.scrollTo(0, distance), scrollRange * 0.62);
  await expect(page.getByRole('heading', { name: 'Preserve more than a memory.' })).toBeVisible();
  await expect(page.getByText('Keep a living link to their roots.', { exact: true })).toBeVisible();
  await expect(stablePhone).toBeVisible();
  const secondPhoneBox = await stablePhone.boundingBox();
  expect(secondPhoneBox).not.toBeNull();
  expect(Math.abs(secondPhoneBox!.x - firstPhoneBox!.x)).toBeLessThan(3);
  expect(Math.abs(secondPhoneBox!.y - firstPhoneBox!.y)).toBeLessThan(3);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByRole('heading', { name: 'Made to hold. Made to hear.' })).toBeVisible();
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
  expect(storyViewportRatio).toBeGreaterThanOrEqual(7.1);
  expect(storyViewportRatio).toBeLessThanOrEqual(7.3);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.getByRole('heading', { name: 'Made to hold. Made to hear.' })).toBeVisible();

  for (const format of ['Autobiography', 'Story', 'Comic', 'Diary']) {
    await expect(page.getByRole('button', { name: format, exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Autobiography', exact: true }).click();
  await expect(page.locator('.cinematic-format-preview-art.is-autobiography')).toBeVisible();
  await expect(page.locator('.cinematic-format-preview-copy').getByText('A life in their own words', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Comic', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Comic', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.cinematic-format-preview-art.is-comic')).toBeVisible();
  await expect(page.locator('.cinematic-format-preview-copy').getByText('Their life, frame by frame', { exact: true })).toBeVisible();
  await expect(page.locator('.cinematic-format-preview-art.is-comic').getByText('Home', { exact: true })).toHaveCount(0);
});
