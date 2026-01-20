const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  // Same viewport for both
  const viewport = { width: 1280, height: 900 };

  // ========== ORIGINAL ==========
  console.log('Opening original site...');
  const pageOrig = await browser.newPage({ viewport });
  await pageOrig.goto('https://viajes.rapidoochoa.com.co');
  await pageOrig.waitForTimeout(3000);

  // Screenshot home
  await pageOrig.screenshot({ path: 'screenshots/visual-orig-home.png' });

  // Interact to show dropdown
  await pageOrig.click('input[placeholder="Buscar Origen"]');
  await pageOrig.fill('input[placeholder="Buscar Origen"]', 'Med');
  await pageOrig.waitForTimeout(1500);
  await pageOrig.screenshot({ path: 'screenshots/visual-orig-dropdown.png' });

  // Go to results
  await pageOrig.goto(`https://viajes.rapidoochoa.com.co/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`);
  await pageOrig.waitForTimeout(6000);
  await pageOrig.screenshot({ path: 'screenshots/visual-orig-results.png' });

  // ========== REPLICA ==========
  console.log('Opening replica site...');
  const pageRep = await browser.newPage({ viewport });
  await pageRep.goto('http://localhost:3000');
  await pageRep.waitForTimeout(2000);

  // Screenshot home
  await pageRep.screenshot({ path: 'screenshots/visual-rep-home.png' });

  // Interact to show dropdown
  await pageRep.click('input[placeholder="Buscar Origen"]');
  await pageRep.fill('input[placeholder="Buscar Origen"]', 'Med');
  await pageRep.waitForTimeout(1500);
  await pageRep.screenshot({ path: 'screenshots/visual-rep-dropdown.png' });

  // Go to results
  await pageRep.goto(`http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`);
  await pageRep.waitForTimeout(4000);
  await pageRep.screenshot({ path: 'screenshots/visual-rep-results.png' });

  console.log('\n=== Screenshots captured! ===');
  console.log('Compare the following pairs:');
  console.log('1. visual-orig-home.png vs visual-rep-home.png');
  console.log('2. visual-orig-dropdown.png vs visual-rep-dropdown.png');
  console.log('3. visual-orig-results.png vs visual-rep-results.png');

  // Keep both pages open for manual inspection
  console.log('\nBoth sites are open for manual comparison.');
  console.log('Close the browser manually when done.');

  await new Promise(() => {});
})();
