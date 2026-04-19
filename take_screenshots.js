const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('Capturing local site...');
  try {
    await page.goto('http://localhost:5001', { waitUntil: 'load', timeout: 60000 });
    // Wait for the loader to disappear (exit animation)
    await page.waitForTimeout(8000); 
    await page.screenshot({ path: 'image/local_site.png', fullPage: false });
    console.log('✓ Local site captured.');
  } catch (err) {
    console.log('✗ Local capture failed:', err.message);
  }

  console.log('Capturing live site...');
  try {
    await page.goto('https://69e444e3cd9269f9cb692b1f--dubai-mall-s.netlify.app/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'image/live_site.png', fullPage: false });
    console.log('✓ Live site captured.');
  } catch (err) {
    console.error('✗ Live capture failed:', err.message);
  }

  await browser.close();
})();
