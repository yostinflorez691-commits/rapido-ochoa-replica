const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Go to replica site
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Click on origin input to open dropdown
  await page.click('input[placeholder="Buscar Origen"]');
  await page.waitForTimeout(500);

  // Type something to trigger suggestions
  await page.fill('input[placeholder="Buscar Origen"]', 'Med');
  await page.waitForTimeout(1000);

  // Screenshot with dropdown open
  await page.screenshot({ path: 'screenshots/replica-dropdown-desktop.png' });

  // Mobile version
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Click on origin to open modal
  const originButton = page.locator('button:has-text("Buscar Origen")').first();
  await originButton.click();
  await page.waitForTimeout(1000);

  // Type in the modal
  await page.fill('input[placeholder="Buscar Origen"]', 'Med');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'screenshots/replica-dropdown-mobile.png' });

  await browser.close();
})();
