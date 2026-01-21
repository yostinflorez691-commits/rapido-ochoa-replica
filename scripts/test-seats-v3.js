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
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  const searchUrl = `http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;

  console.log('Navegando a:', searchUrl);
  await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for page to stabilize
  console.log('Esperando que carguen los viajes...');
  await page.waitForTimeout(3000);

  // Screenshot of results
  await page.screenshot({ path: path.join(screenshotDir, 'seats-v3-01-results.png') });
  console.log('Screenshot: seats-v3-01-results.png');

  // Click "Ver sillas" button using Playwright locator (get visible one)
  console.log('\nBuscando boton "Ver sillas" visible...');
  const verSillasButtons = page.locator('button:has-text("Ver sillas")');
  const buttonCount = await verSillasButtons.count();
  console.log(`Encontrados ${buttonCount} botones "Ver sillas"`);

  // Find the visible one
  let clickedButton = false;
  for (let i = 0; i < buttonCount; i++) {
    const btn = verSillasButtons.nth(i);
    const isVisible = await btn.isVisible();
    if (isVisible) {
      await btn.click();
      clickedButton = true;
      console.log(`Click realizado en boton ${i + 1}`);
      break;
    }
  }

  if (!clickedButton) {
    console.log('No se encontro boton visible, usando force click');
    await verSillasButtons.first().click({ force: true });
  }

  // Wait for seat map to load
  console.log('Esperando mapa de asientos...');
  await page.waitForTimeout(5000);

  // Screenshot after seat map loads
  await page.screenshot({ path: path.join(screenshotDir, 'seats-v3-02-seatmap.png'), fullPage: true });
  console.log('Screenshot: seats-v3-02-seatmap.png');

  console.log('\nMapa de asientos cargado exitosamente!');

  // Find and click available seat buttons using page.evaluate
  console.log('\nBuscando asientos disponibles...');

  // Click seat 1
  const seat1Clicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.trim() === '1' && !btn.disabled) {
        btn.click();
        return true;
      }
    }
    return false;
  });

  if (seat1Clicked) {
    console.log('Asiento 1 seleccionado');
    await page.waitForTimeout(800);

    // Screenshot with seat selected
    await page.screenshot({ path: path.join(screenshotDir, 'seats-v3-03-selected.png'), fullPage: true });
    console.log('Screenshot: seats-v3-03-selected.png');

    // Click seat 2
    const seat2Clicked = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.trim() === '2' && !btn.disabled) {
          btn.click();
          return true;
        }
      }
      return false;
    });

    if (seat2Clicked) {
      console.log('Asiento 2 tambien seleccionado');
      await page.waitForTimeout(800);

      // Screenshot with multiple seats
      await page.screenshot({ path: path.join(screenshotDir, 'seats-v3-04-multiple.png'), fullPage: true });
      console.log('Screenshot: seats-v3-04-multiple.png');
    }

    // Check if selection summary appeared
    const summaryVisible = await page.locator('text=Asientos seleccionados').isVisible();
    const totalVisible = await page.locator('text=Total:').isVisible();
    const continueVisible = await page.locator('button:has-text("Continuar")').isVisible();

    console.log(`\nResumen de seleccion: asientos=${summaryVisible}, total=${totalVisible}, continuar=${continueVisible}`);
  } else {
    console.log('No se encontro asiento 1 disponible');
  }

  console.log('\n=== PRUEBA COMPLETADA ===');
  console.log('Navegador abierto para inspeccion (25 seg)...');

  await page.waitForTimeout(25000);
  await browser.close();
})();
