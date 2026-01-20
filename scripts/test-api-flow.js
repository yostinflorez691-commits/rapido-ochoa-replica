const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('='.repeat(60));
  console.log('TESTING REPLICA SITE WITH REAL API DATA');
  console.log('='.repeat(60));

  // Open replica site
  console.log('\n[1] Opening replica site...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Take screenshot of home page
  await page.screenshot({ path: 'screenshots/replica-home-api.png', fullPage: false });
  console.log('    Screenshot saved: replica-home-api.png');

  // Click on origin input
  console.log('\n[2] Searching for origin...');
  const originInput = await page.locator('input[placeholder*="Origen"]').first();
  await originInput.click();
  await page.waitForTimeout(500);

  // Type "Med" to search for Medellin
  await originInput.fill('Med');
  await page.waitForTimeout(1500);

  // Take screenshot of dropdown
  await page.screenshot({ path: 'screenshots/replica-origin-dropdown.png', fullPage: false });
  console.log('    Screenshot saved: replica-origin-dropdown.png');

  // Select first result (should be Medellin from real API)
  const originResult = await page.locator('button:has-text("Medellín")').first();
  if (await originResult.isVisible()) {
    await originResult.click();
    console.log('    Selected: Medellín Terminal Norte');
    await page.waitForTimeout(1000);
  }

  // Click on destination input
  console.log('\n[3] Searching for destination...');
  const destInput = await page.locator('input[placeholder*="Destino"]').first();
  await destInput.click();
  await page.waitForTimeout(1500);

  // Take screenshot of destinations (should show API data based on origin)
  await page.screenshot({ path: 'screenshots/replica-destination-dropdown.png', fullPage: false });
  console.log('    Screenshot saved: replica-destination-dropdown.png');

  // Type "Bog" to filter
  await destInput.fill('Bog');
  await page.waitForTimeout(1000);

  // Select Bogota
  const destResult = await page.locator('button:has-text("Bogotá")').first();
  if (await destResult.isVisible()) {
    await destResult.click();
    console.log('    Selected: Bogotá Terminal Salitre');
    await page.waitForTimeout(500);
  }

  // Take screenshot before search
  await page.screenshot({ path: 'screenshots/replica-before-search.png', fullPage: false });
  console.log('\n    Screenshot saved: replica-before-search.png');

  // Click search button
  console.log('\n[4] Clicking search button...');
  const searchBtn = await page.locator('button[type="submit"]:visible').first();
  await searchBtn.click();

  // Wait for navigation and results
  console.log('    Waiting for results...');
  await page.waitForURL(/\/search\//, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(5000);

  // Take screenshot of results
  await page.screenshot({ path: 'screenshots/replica-results-api.png', fullPage: false });
  console.log('    Screenshot saved: replica-results-api.png');

  // Wait for loading to complete
  await page.waitForTimeout(10000);

  // Take final screenshot after all results load
  await page.screenshot({ path: 'screenshots/replica-results-final.png', fullPage: true });
  console.log('    Screenshot saved: replica-results-final.png');

  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETED - Check screenshots folder');
  console.log('='.repeat(60));

  // Keep browser open for manual inspection
  console.log('\nBrowser left open for inspection. Press Ctrl+C to close.');

})();
