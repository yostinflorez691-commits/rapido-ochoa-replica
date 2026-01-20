const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Mobile viewport
  const mobileViewport = { width: 375, height: 812 };

  // Date for search
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  const resultsPath = `/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;

  console.log('Verificando version movil actualizada...');

  const page = await browser.newPage({ viewport: mobileViewport });

  // Results page mobile
  console.log('Capturando resultados movil...');
  await page.goto('http://localhost:3000' + resultsPath, { timeout: 30000 });
  await page.waitForTimeout(12000);
  await page.screenshot({ path: 'screenshots/verify-mobile-results.png', fullPage: true });
  console.log('OK - screenshots/verify-mobile-results.png');

  await browser.close();
  console.log('Verificacion completada!');
})();
