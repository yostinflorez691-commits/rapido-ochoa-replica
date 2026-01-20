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

  // ========== ORIGINAL SITE ==========
  console.log('=== Capturing ORIGINAL site details ===');
  const pageOrig = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Home page
  await pageOrig.goto('https://viajes.rapidoochoa.com.co');
  await pageOrig.waitForTimeout(3000);
  await pageOrig.screenshot({ path: 'screenshots/detail-orig-home.png' });

  // Capture header specifically
  const headerOrig = pageOrig.locator('header').first();
  if (await headerOrig.isVisible()) {
    await headerOrig.screenshot({ path: 'screenshots/detail-orig-header.png' });
  }

  // Capture search form
  await pageOrig.screenshot({ path: 'screenshots/detail-orig-form.png', clip: { x: 0, y: 0, width: 1400, height: 400 } });

  // Go to results page
  await pageOrig.goto(`https://viajes.rapidoochoa.com.co/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`);
  await pageOrig.waitForTimeout(5000);

  // Capture full results
  await pageOrig.screenshot({ path: 'screenshots/detail-orig-results.png' });

  // Capture first trip card
  await pageOrig.screenshot({ path: 'screenshots/detail-orig-card-area.png', clip: { x: 100, y: 200, width: 1200, height: 150 } });

  // ========== REPLICA SITE ==========
  console.log('=== Capturing REPLICA site details ===');
  const pageRep = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Home page
  await pageRep.goto('http://localhost:3000');
  await pageRep.waitForTimeout(2000);
  await pageRep.screenshot({ path: 'screenshots/detail-rep-home.png' });

  // Capture header
  await pageRep.screenshot({ path: 'screenshots/detail-rep-form.png', clip: { x: 0, y: 0, width: 1400, height: 400 } });

  // Go to results page
  await pageRep.goto(`http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`);
  await pageRep.waitForTimeout(4000);

  // Capture full results
  await pageRep.screenshot({ path: 'screenshots/detail-rep-results.png' });

  // Capture first trip card area
  await pageRep.screenshot({ path: 'screenshots/detail-rep-card-area.png', clip: { x: 100, y: 200, width: 1200, height: 150 } });

  await browser.close();
  console.log('\nDetailed comparison screenshots captured!');
})();
