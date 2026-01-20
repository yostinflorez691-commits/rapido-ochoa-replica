const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const desktopViewport = { width: 1280, height: 900 };
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

  console.log('='.repeat(50));
  console.log('COMPARACION COMPLETA - Original vs Replica');
  console.log('Fecha de busqueda: ' + formattedDate);
  console.log('='.repeat(50));

  // =============================================
  // SITIO ORIGINAL - DESKTOP
  // =============================================
  console.log('\n[1/12] Original - Desktop - Home...');
  const origDesktop = await browser.newPage({ viewport: desktopViewport });
  try {
    await origDesktop.goto('https://viajes.rapidoochoa.com.co', { timeout: 30000 });
    await origDesktop.waitForTimeout(3000);
    await origDesktop.screenshot({ path: 'screenshots/compare/01-orig-desktop-home.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Error: ' + e.message);
  }

  // Click en origen para ver dropdown
  console.log('[2/12] Original - Desktop - Dropdown origen...');
  try {
    await origDesktop.click('text=Origen', { timeout: 3000 });
    await origDesktop.waitForTimeout(2000);
    await origDesktop.screenshot({ path: 'screenshots/compare/02-orig-desktop-dropdown.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Skip (no dropdown)');
  }

  // Resultados - usar domcontentloaded en lugar de networkidle
  console.log('[3/12] Original - Desktop - Resultados...');
  try {
    await origDesktop.goto('https://viajes.rapidoochoa.com.co' + resultsPath, { timeout: 45000, waitUntil: 'domcontentloaded' });
    await origDesktop.waitForTimeout(10000); // Esperar carga de viajes
    await origDesktop.screenshot({ path: 'screenshots/compare/03-orig-desktop-results.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Error: ' + e.message);
  }
  await origDesktop.close();

  // =============================================
  // SITIO ORIGINAL - MOBILE
  // =============================================
  console.log('[4/12] Original - Mobile - Home...');
  const origMobile = await browser.newPage({ viewport: mobileViewport });
  try {
    await origMobile.goto('https://viajes.rapidoochoa.com.co', { timeout: 30000 });
    await origMobile.waitForTimeout(3000);
    await origMobile.screenshot({ path: 'screenshots/compare/04-orig-mobile-home.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Error: ' + e.message);
  }

  console.log('[5/12] Original - Mobile - Resultados...');
  try {
    await origMobile.goto('https://viajes.rapidoochoa.com.co' + resultsPath, { timeout: 45000, waitUntil: 'domcontentloaded' });
    await origMobile.waitForTimeout(10000);
    await origMobile.screenshot({ path: 'screenshots/compare/05-orig-mobile-results.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Error: ' + e.message);
  }
  await origMobile.close();

  // =============================================
  // REPLICA - DESKTOP
  // =============================================
  console.log('[6/12] Replica - Desktop - Home...');
  const repDesktop = await browser.newPage({ viewport: desktopViewport });
  try {
    await repDesktop.goto('http://localhost:3000', { timeout: 30000 });
    await repDesktop.waitForTimeout(2000);
    await repDesktop.screenshot({ path: 'screenshots/compare/06-rep-desktop-home.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Error: ' + e.message);
  }

  // Click en origen para ver dropdown
  console.log('[7/12] Replica - Desktop - Dropdown origen...');
  try {
    await repDesktop.click('text=Origen', { timeout: 3000 });
    await repDesktop.waitForTimeout(2000);
    await repDesktop.screenshot({ path: 'screenshots/compare/07-rep-desktop-dropdown.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Skip (no dropdown): ' + e.message);
  }

  // Resultados
  console.log('[8/12] Replica - Desktop - Resultados...');
  try {
    await repDesktop.goto('http://localhost:3000' + resultsPath, { timeout: 30000 });
    await repDesktop.waitForTimeout(15000); // Esperar carga de API
    await repDesktop.screenshot({ path: 'screenshots/compare/08-rep-desktop-results.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Error: ' + e.message);
  }
  await repDesktop.close();

  // =============================================
  // REPLICA - MOBILE
  // =============================================
  console.log('[9/12] Replica - Mobile - Home...');
  const repMobile = await browser.newPage({ viewport: mobileViewport });
  try {
    await repMobile.goto('http://localhost:3000', { timeout: 30000 });
    await repMobile.waitForTimeout(2000);
    await repMobile.screenshot({ path: 'screenshots/compare/09-rep-mobile-home.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Error: ' + e.message);
  }

  console.log('[10/12] Replica - Mobile - Resultados...');
  try {
    await repMobile.goto('http://localhost:3000' + resultsPath, { timeout: 30000 });
    await repMobile.waitForTimeout(15000);
    await repMobile.screenshot({ path: 'screenshots/compare/10-rep-mobile-results.png', fullPage: true });
    console.log('  OK');
  } catch (e) {
    console.log('  Error: ' + e.message);
  }
  await repMobile.close();

  await browser.close();

  console.log('\n' + '='.repeat(50));
  console.log('Screenshots guardados en: screenshots/compare/');
  console.log('='.repeat(50));
})();
