const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();

  // Desktop - Original
  let page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(3000);
  await page.click('input[placeholder="Buscar Origen"]');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Buscar Origen"]', 'Med');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/dropdown-original-desktop.png' });

  // Desktop - Replica
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.click('input[placeholder="Buscar Origen"]');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Buscar Origen"]', 'Med');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/dropdown-replica-desktop.png' });

  // Mobile - Original
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(3000);

  // Click on origin field to open modal
  const originInput = page.locator('input[placeholder="Buscar Origen"]').first();
  await originInput.click();
  await page.waitForTimeout(1000);
  await page.fill('input[placeholder="Buscar Origen"]', 'Med');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/dropdown-original-mobile.png' });

  // Mobile - Replica
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Click on origin button to open modal
  const originButton = page.locator('button:has-text("Buscar Origen")').first();
  await originButton.click();
  await page.waitForTimeout(1000);
  await page.fill('input[placeholder="Buscar Origen"]', 'Med');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/dropdown-replica-mobile.png' });

  await browser.close();
  console.log('Screenshots captured successfully');
})();
