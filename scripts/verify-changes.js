const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktopViewport = { width: 1280, height: 900 };
  const mobileViewport = { width: 375, height: 812 };

  console.log('Verificando cambios de prioridad alta...');

  // Desktop - Home
  console.log('[1/4] Desktop - Home page...');
  const desktopPage = await browser.newPage({ viewport: desktopViewport });
  await desktopPage.goto('http://localhost:3000', { timeout: 30000 });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({ path: 'screenshots/verify-desktop-home.png' });
  console.log('  OK');

  // Desktop - Click on origin to see dropdown
  console.log('[2/4] Desktop - Origin dropdown...');
  try {
    await desktopPage.click('input[placeholder="Buscar Origen"]');
    await desktopPage.waitForTimeout(1500);
    await desktopPage.screenshot({ path: 'screenshots/verify-desktop-dropdown.png' });
    console.log('  OK');
  } catch (e) {
    console.log('  Skip');
  }
  await desktopPage.close();

  // Mobile - Home
  console.log('[3/4] Mobile - Home page...');
  const mobilePage = await browser.newPage({ viewport: mobileViewport });
  await mobilePage.goto('http://localhost:3000', { timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: 'screenshots/verify-mobile-home.png', fullPage: true });
  console.log('  OK');
  await mobilePage.close();

  // Date for results
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;
  const resultsPath = `/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;

  // Desktop - Results
  console.log('[4/4] Desktop - Results page...');
  const resultsPage = await browser.newPage({ viewport: desktopViewport });
  await resultsPage.goto('http://localhost:3000' + resultsPath, { timeout: 30000 });
  await resultsPage.waitForTimeout(12000);
  await resultsPage.screenshot({ path: 'screenshots/verify-desktop-results.png', fullPage: true });
  console.log('  OK');
  await resultsPage.close();

  await browser.close();
  console.log('\nVerificacion completada!');
  console.log('Screenshots guardados en: screenshots/');
})();
