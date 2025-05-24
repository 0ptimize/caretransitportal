import { test, expect } from '@playwright/test';

test.describe('Admin Portal Link', () => {
  test('should not result in 404 when clicking Admin Portal link', async ({ page }) => {
    // Start at the home page
    await page.goto('https://caretransitportal-ii5mojxds-jaysons-projects-daf93732.vercel.app/');

    // Find the Admin Portal link
    const adminLink = page.getByRole('link', { name: /admin portal/i });
    await expect(adminLink).toBeVisible();

    // Get the href attribute
    const href = await adminLink.getAttribute('href');
    console.log('Admin Portal link href:', href);

    // Make a direct request to the href URL
    const response = await page.goto(href || '');
    console.log('Response status:', response?.status());
    console.log('Response URL:', response?.url());

    // Verify we're not getting a 404
    expect(response?.status()).not.toBe(404);

    // If we're redirected to signin, verify it's a valid page
    if (response?.url().includes('/auth/signin')) {
      const signinPage = await page.getByRole('heading', { name: /sign in to your account/i });
      await expect(signinPage).toBeVisible();
    }
  });
}); 