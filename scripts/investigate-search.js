const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // Enable request interception to see API calls
  const page = await context.newPage();

  // Log all requests
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('api') || request.method() === 'POST' || request.url().includes('viaje') || request.url().includes('bus') || request.url().includes('search')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData(),
        headers: request.headers()
      });
      console.log('REQUEST:', request.method(), request.url());
      if (request.postData()) {
        console.log('POST DATA:', request.postData());
      }
    }
  });

  // Log all responses
  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('viaje') || response.url().includes('bus') || response.url().includes('search')) {
      console.log('RESPONSE:', response.status(), response.url());
    }
  });

  // Log navigation
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('NAVIGATED TO:', frame.url());
    }
  });

  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(3000);

  console.log('\n=== Starting search flow ===\n');

  // Click on origin and select Medellín
  await page.click('input[placeholder="Buscar Origen"]');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Buscar Origen"]', 'Medellín');
  await page.waitForTimeout(1500);

  // Click first result
  const originOption = page.locator('text=Medellín').first();
  await originOption.click();
  await page.waitForTimeout(1000);

  // Click on destination and select Bogotá
  await page.click('input[placeholder="Buscar Destino"]');
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Buscar Destino"]', 'Bogotá');
  await page.waitForTimeout(1500);

  // Click first result
  const destOption = page.locator('text=Bogotá').first();
  await destOption.click();
  await page.waitForTimeout(1000);

  // Click on "Mañana" button
  const mananaButton = page.locator('button:has-text("Mañana")').first();
  await mananaButton.click();
  await page.waitForTimeout(500);

  console.log('\n=== Clicking Buscar button ===\n');

  // Take screenshot before clicking
  await page.screenshot({ path: 'screenshots/before-search.png' });

  // Click search button
  const searchButton = page.locator('button:has-text("Buscar")').first();
  await searchButton.click();

  // Wait for navigation or response
  await page.waitForTimeout(5000);

  // Take screenshot after clicking
  await page.screenshot({ path: 'screenshots/after-search.png' });

  console.log('\n=== Final URL ===');
  console.log(page.url());

  console.log('\n=== All captured requests ===');
  requests.forEach((req, i) => {
    console.log(`\n[${i + 1}] ${req.method} ${req.url}`);
    if (req.postData) {
      console.log('Data:', req.postData);
    }
  });

  await page.waitForTimeout(3000);
  await browser.close();
})();
