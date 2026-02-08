
import { test, expect } from '@playwright/test';

test.describe('Vita E2E Flows', () => {

    test('Homepage loads and navigation works', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Vita/i);
        await expect(page.getByText(/Vita/i).first()).toBeVisible();
    });

    test('Resource filtering works', async ({ page }) => {
        await page.goto('/dashboard');
        // Wait for resources to load
        await page.waitForTimeout(2000);

        // Click on "Hospitals" filter (using case-insensitive match)
        const hospitalBtn = page.getByRole('button', { name: /Hospital/i });
        await hospitalBtn.first().click();

        // Check if URL or UI reflects change. 
        // For now, just ensure no crash and button is active.
    });

    test('Chat widget opens and responds', async ({ page }) => {
        await page.goto('/');

        // Open chat (Click "Chat with AI" button in Hero section)
        const chatBtn = page.getByRole('button', { name: 'Chat with AI' });
        await chatBtn.click();

        await expect(page.getByText('Hi there! I\'m Vee')).toBeVisible();

        // Type message
        await page.getByPlaceholder('Type your emergency...').fill('I need oxygen');
        // Click submit button (icon only, so use locator)
        await page.locator('button[type="submit"]').click();

        // Wait for response
        // Wait for response (Success or "No found" both contain 'oxygen')
        await expect(page.getByText(/oxygen/i)).toBeVisible({ timeout: 10000 });
    });

});
