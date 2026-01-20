const { chromium } = require('playwright');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1440, height: 900 });

  // Capture replica
  console.log('Capturing replica...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'docs/comparison/replica-v3.png', fullPage: false });

  // Click on origin input to show autocomplete
  console.log('Capturing autocomplete...');
  await page.click('input[placeholder="Buscar Origen"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/comparison/replica-autocomplete.png', fullPage: false });

  console.log('Screenshots saved!');
  await browser.close();
}

captureScreenshots().catch(console.error);
