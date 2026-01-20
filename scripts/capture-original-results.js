const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('1. Going to original site...');
  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(3000);

  console.log('2. Selecting origin (Medellín)...');
  await page.click('input[placeholder="Buscar Origen"]');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Buscar Origen"]', 'Medellín');
  await page.waitForTimeout(1500);

  // Click first option
  const originOption = page.locator('text=Medellín').first();
  await originOption.click();
  await page.waitForTimeout(1000);

  console.log('3. Selecting destination (Bogotá)...');
  await page.click('input[placeholder="Buscar Destino"]');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Buscar Destino"]', 'Bogotá');
  await page.waitForTimeout(1500);

  const destOption = page.locator('text=Bogotá').first();
  await destOption.click();
  await page.waitForTimeout(1000);

  console.log('4. Selecting tomorrow...');
  const mananaBtn = page.locator('button:has-text("Mañana")').first();
  await mananaBtn.click();
  await page.waitForTimeout(500);

  console.log('5. Clicking search...');
  const searchBtn = page.locator('button:has-text("Buscar")').first();
  await searchBtn.click();

  console.log('6. Waiting for results page...');
  await page.waitForTimeout(8000);

  console.log('Current URL:', page.url());

  // Full page screenshot
  await page.screenshot({ path: 'screenshots/original-results-full.png', fullPage: true });
  console.log('Full page screenshot saved');

  // Viewport screenshot
  await page.screenshot({ path: 'screenshots/original-results-viewport.png' });
  console.log('Viewport screenshot saved');

  // Scroll down and capture more
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/original-results-scrolled.png' });
  console.log('Scrolled screenshot saved');

  // Capture header detail
  const header = page.locator('header').first();
  if (await header.isVisible()) {
    await header.screenshot({ path: 'screenshots/original-results-header.png' });
    console.log('Header screenshot saved');
  }

  // Try to capture a single trip card
  const tripCard = page.locator('[class*="card"], [class*="trip"], [class*="result"]').first();
  if (await tripCard.isVisible()) {
    await tripCard.screenshot({ path: 'screenshots/original-trip-card.png' });
    console.log('Trip card screenshot saved');
  }

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('\nCapture completed!');
})();
