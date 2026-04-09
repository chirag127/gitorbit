const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();

  // Desktop view
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  console.log('=== LANDING PAGE ===');
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:\\AM\\GitHub\\gitorbit\\test-results\\new-landing.png', fullPage: true });
  console.log('Saved: new-landing.png');

  // Check styles are applied
  const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).background);
  console.log('Body background:', bodyBg.substring(0, 100) + '...');
  
  const navBg = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    return nav ? window.getComputedStyle(nav).backdropFilter : 'no nav found';
  });
  console.log('Nav backdrop-filter:', navBg);

  console.log('\n=== SETUP PAGE ===');
  await page.goto('http://localhost:4321/setup', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:\\AM\\GitHub\\gitorbit\\test-results\\new-setup.png', fullPage: true });
  console.log('Saved: new-setup.png');
  
  const h1 = await page.locator('h1').first();
  console.log('H1 text:', (await h1.textContent()).trim());

  console.log('\n=== DASHBOARD ===');
  await page.goto('http://localhost:4321/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'C:\\AM\\GitHub\\gitorbit\\test-results\\new-dashboard.png', fullPage: true });
  console.log('Saved: new-dashboard.png');

  console.log('\n=== MOBILE LANDING ===');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:\\AM\\GitHub\\gitorbit\\test-results\\new-mobile.png', fullPage: true });
  console.log('Saved: new-mobile.png');

  console.log('\n=== 404 PAGE ===');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:4321/nonexistent', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:\\AM\\GitHub\\gitorbit\\test-results\\new-404.png', fullPage: true });
  console.log('Saved: new-404.png');

  await browser.close();
  console.log('\n✅ ALL SCREENSHOTS SAVED - Check test-results/ folder');
})();
