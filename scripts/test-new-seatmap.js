const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const screenshotDir = path.join(__dirname, '..', 'screenshots');

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const formattedDate = `${String(tomorrow.getDate()).padStart(2, '0')}-${months[tomorrow.getMonth()]}-${String(tomorrow.getFullYear()).slice(-2)}`;

  const url = `http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;

  console.log('Navegando a la replica...');
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Click "Ver sillas"
  console.log('Abriendo mapa de asientos...');
  const buttons = page.locator('button:has-text("Ver sillas")');
  for (let i = 0; i < await buttons.count(); i++) {
    const btn = buttons.nth(i);
    if (await btn.isVisible()) {
      await btn.click();
      break;
    }
  }

  await page.waitForTimeout(5000);

  // Screenshot of new seat map
  await page.screenshot({ path: path.join(screenshotDir, 'new-seatmap-design.png'), fullPage: true });
  console.log('Screenshot: new-seatmap-design.png');

  // Select some seats
  console.log('Seleccionando asientos...');

  // Click on seat 3
  const seat3 = page.locator('button:text-is("3")').first();
  if (await seat3.isVisible()) {
    await seat3.click({ force: true });
    console.log('Asiento 3 seleccionado');
  }
  await page.waitForTimeout(500);

  // Click on seat 7
  const seat7 = page.locator('button:text-is("7")').first();
  if (await seat7.isVisible()) {
    await seat7.click({ force: true });
    console.log('Asiento 7 seleccionado');
  }
  await page.waitForTimeout(500);

  // Screenshot with seats selected
  await page.screenshot({ path: path.join(screenshotDir, 'new-seatmap-selected.png'), fullPage: true });
  console.log('Screenshot: new-seatmap-selected.png');

  console.log('\nNavegador abierto para inspeccion (30 seg)...');
  await page.waitForTimeout(30000);
  await browser.close();
})();
