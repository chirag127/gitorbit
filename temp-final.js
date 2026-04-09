const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const pages = [
    { url: 'http://localhost:4321', name: 'landing' },
    { url: 'http://localhost:4321/setup', name: 'setup' },
    { url: 'http://localhost:4321/dashboard', name: 'dashboard' },
    { url: 'http://localhost:4321/privacy', name: 'privacy' },
    { url: 'http://localhost:4321/terms', name: 'terms' },
    { url: 'http://localhost:4321/nonexistent', name: '404' },
  ];

  for (const p of pages) {
    console.log(`Testing ${p.name}...`);
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 15000 });
    if (p.name === 'setup' || p.name === 'dashboard') {
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: `C:\\AM\\GitHub\\gitorbit\\test-results\\final-${p.name}.png`, fullPage: true });
    console.log(`  ✅ Saved: final-${p.name}.png`);
  }

  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: 'C:\\AM\\GitHub\\gitorbit\\test-results\\final-mobile.png', fullPage: true });
  console.log('  ✅ Saved: final-mobile.png');

  // Tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('http://localhost:4321', { waitUntil: 'networkidle', timeout: 15000 });
  await page.screenshot({ path: 'C:\\AM\\GitHub\\gitorbit\\test-results\\final-tablet.png', fullPage: true });
  console.log('  ✅ Saved: final-tablet.png');

  await browser.close();
  console.log('\n🎉 All screenshots captured!');
})();
