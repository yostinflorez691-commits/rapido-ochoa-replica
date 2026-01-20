const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Go to original site
  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(3000);

  // Click on origin input to open dropdown
  await page.click('input[placeholder="Buscar Origen"]');
  await page.waitForTimeout(1000);

  // Type something to trigger suggestions
  await page.fill('input[placeholder="Buscar Origen"]', 'Med');
  await page.waitForTimeout(1500);

  // Screenshot with dropdown open
  await page.screenshot({ path: 'screenshots/original-dropdown-desktop.png' });

  // Mobile version
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(3000);

  // Click on origin input
  await page.click('input[placeholder="Buscar Origen"]');
  await page.waitForTimeout(1000);
  await page.fill('input[placeholder="Buscar Origen"]', 'Med');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'screenshots/original-dropdown-mobile.png' });

  await browser.close();
})();
