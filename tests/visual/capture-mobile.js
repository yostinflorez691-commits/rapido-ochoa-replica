const { chromium } = require('playwright');

async function captureMobile() {
  const browser = await chromium.launch({ headless: true });

  // Mobile viewport
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size

  // Capture original mobile
  console.log('Capturing original mobile...');
  await page.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'docs/comparison/original-mobile.png', fullPage: false });

  // Capture replica mobile
  console.log('Capturing replica mobile...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'docs/comparison/replica-mobile.png', fullPage: false });

  console.log('Done!');
  await browser.close();
}

captureMobile().catch(console.error);
