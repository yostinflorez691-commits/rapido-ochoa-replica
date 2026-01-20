const { chromium } = require('playwright');

async function captureSideBySide() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1440, height: 800 });

  // Capture original
  console.log('Capturing original...');
  await page.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'docs/comparison/side-original.png', fullPage: false });

  // Capture replica
  console.log('Capturing replica...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'docs/comparison/side-replica.png', fullPage: false });

  console.log('Done!');
  await browser.close();
}

captureSideBySide().catch(console.error);
