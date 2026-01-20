const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  // Capture replica full page
  console.log('Capturing replica full page...');
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(`http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'screenshots/final-replica-full.png', fullPage: true });
  console.log('Full page screenshot saved!');

  // Also capture home page
  console.log('Capturing home page...');
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/final-home.png' });
  console.log('Home page screenshot saved!');

  await browser.close();
  console.log('\nAll final screenshots captured!');
})();
