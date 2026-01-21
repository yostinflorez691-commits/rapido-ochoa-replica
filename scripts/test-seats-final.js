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

  await page.screenshot({ path: path.join(screenshotDir, 'final-01-results.png') });
  console.log('Screenshot: final-01-results.png');

  // Click "Ver sillas" button
  console.log('\nBuscando boton "Ver sillas" visible...');
  const verSillasButtons = page.locator('button:has-text("Ver sillas")');
  const buttonCount = await verSillasButtons.count();

  for (let i = 0; i < buttonCount; i++) {
    const btn = verSillasButtons.nth(i);
    const isVisible = await btn.isVisible();
    if (isVisible) {
      await btn.click();
      console.log('Click realizado en "Ver sillas"');
      break;
    }
  }

  // Wait for seat map to load
  console.log('Esperando mapa de asientos...');
  await page.waitForTimeout(5000);

  await page.screenshot({ path: path.join(screenshotDir, 'final-02-seatmap.png'), fullPage: true });
  console.log('Screenshot: final-02-seatmap.png');

  // Check if seat map loaded (check page content)
  const pageContent = await page.content();
  const hasSeatMap = pageContent.includes('Selecciona tus asientos');
  console.log(`Mapa de asientos cargado: ${hasSeatMap}`);

  if (hasSeatMap) {
    // Find seat button "1" using XPath and click it with Playwright's click
    console.log('\nSeleccionando asiento 1...');

    // Use a more specific selector for seat buttons inside the seat map
    const seat1 = page.locator('button:text-is("1")').first();

    // Force click on seat 1 (handles mobile/desktop duplicates)
    try {
      await seat1.click({ force: true });
      console.log('Asiento 1 seleccionado');
    } catch (e) {
      console.log('Error seleccionando asiento 1, intentando alternativa...');
      // Find all buttons with text "1" and click the first one that's in the visible viewport
      const allSeat1 = page.locator('button:text-is("1")');
      const count = await allSeat1.count();
      for (let i = 0; i < count; i++) {
        try {
          await allSeat1.nth(i).click({ timeout: 2000 });
          console.log(`Asiento 1 (intento ${i+1}) seleccionado`);
          break;
        } catch (e2) {
          continue;
        }
      }
    }
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(screenshotDir, 'final-03-seat1.png'), fullPage: true });
    console.log('Screenshot: final-03-seat1.png');

    // Check if selection summary appeared
    const pageAfterSelect = await page.content();
    const summaryVisible = pageAfterSelect.includes('Asientos seleccionados');
    console.log(`Resumen visible: ${summaryVisible}`);

    // Select seat 2
    console.log('\nSeleccionando asiento 2...');
    const seat2 = page.locator('button:text-is("2")').first();
    try {
      await seat2.click({ force: true });
      console.log('Asiento 2 seleccionado');
    } catch (e) {
      console.log('Error seleccionando asiento 2');
    }
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(screenshotDir, 'final-04-seat2.png'), fullPage: true });
    console.log('Screenshot: final-04-seat2.png');

    // Check summary
    const finalContent = await page.content();
    const hasTotal = finalContent.includes('Total:');
    const hasContinue = finalContent.includes('Continuar');
    console.log(`\nTotal visible: ${hasTotal}, Boton Continuar visible: ${hasContinue}`);
  }

  console.log('\n=== PRUEBA COMPLETADA ===');
  console.log('Navegador abierto para inspeccion (30 seg)...');

  await page.waitForTimeout(30000);
  await browser.close();
})();
