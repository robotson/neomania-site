import { test, expect } from '@playwright/test';

test('verify critical styles and css validity', async ({ page }) => {
    const messages = [];
    page.on('console', msg => messages.push(msg.text()));
    page.on('pageerror', err => messages.push(`ERROR: ${err.message}`));

    await page.goto('/', { waitUntil: 'load' });

    // 1. Verify CSS applied (fix for broken selector)
    const wordmark = page.locator('.animated-wordmark');
    await expect(wordmark).toBeVisible();

    // 2. Check Computed Styles
    const computed = await wordmark.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
            fontFamily: style.fontFamily,
            willChange: style.willChange,
            transform: style.transform,
            backfaceVisibility: style.backfaceVisibility
        };
    });

    console.log('COMPUTED STYLES:', computed);

    // 3. Verify Font Family (should be Roboto Flex)
    expect(computed.fontFamily).toContain('Roboto Flex');

    // 4. Verify will-change override for Safari
    // Note: Playwright WebKit might report differently than real Safari, 
    // but my JS logic checks `navigator.userAgent`.
    // WebKit UA: ... AppleWebKit/605 ... Safari ...
    const isSafari = await page.evaluate(() => {
        const ua = navigator.userAgent;
        return ua.includes("Safari") && !ua.includes("Chrome");
    });

    if (isSafari) {
        // My JS sets this to 'transform'
        expect(computed.willChange).toBe('transform');
    }

    // 5. Verify no console errors (CSS syntax errors often trigger warnings if they break rules)
    const errors = messages.filter(m => m.includes('Error') || m.includes('Syntax'));
    expect(errors).toHaveLength(0);
});
