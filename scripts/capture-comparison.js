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

  // Capture original
  console.log('Capturing original site...');
  const page1 = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page1.goto(`https://viajes.rapidoochoa.com.co/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`);
  await page1.waitForTimeout(5000);
  await page1.screenshot({ path: 'screenshots/comparison-original.png' });

  // Capture replica
  console.log('Capturing replica site...');
  const page2 = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page2.goto(`http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`);
  await page2.waitForTimeout(5000);
  await page2.screenshot({ path: 'screenshots/comparison-replica.png' });

  await browser.close();
  console.log('Comparison screenshots saved!');
})();
