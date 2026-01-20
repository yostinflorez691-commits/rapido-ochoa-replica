const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const viewport = { width: 1280, height: 900 };

  // Replica only
  console.log('Capturing replica...');
  const page = await browser.newPage({ viewport });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/final-home.png' });

  // Results page
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  await page.goto(`http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/final-results.png' });

  await browser.close();
  console.log('Screenshots saved!');
})();
