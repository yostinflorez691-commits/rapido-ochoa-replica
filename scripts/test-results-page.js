const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Get tomorrow's date in the correct format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  const searchUrl = `http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;

  console.log('Navigating to search results URL:');
  console.log(searchUrl);

  await page.goto(searchUrl);
  await page.waitForTimeout(3000); // Wait for loading animation

  console.log('\nWaiting for results to load...');
  await page.waitForSelector('text=Viajes recomendados', { timeout: 15000 });

  console.log('\nSearch results page loaded successfully!');

  // Screenshot of results
  await page.screenshot({ path: 'screenshots/search-results-page.png' });
  console.log('Screenshot saved: screenshots/search-results-page.png');

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('\nTest completed!');
})();
