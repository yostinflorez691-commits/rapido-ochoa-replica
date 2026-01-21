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
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait for page to stabilize
  console.log('Esperando que carguen los viajes...');
  await page.waitForTimeout(6000);

  // Screenshot of results
  await page.screenshot({ path: path.join(screenshotDir, 'seats-v2-01-results.png') });
  console.log('Screenshot: seats-v2-01-results.png');

  // Find VISIBLE "Ver sillas" buttons
  console.log('\nBuscando boton "Ver sillas"...');

  const clickedButton = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Ver sillas') && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
    }
    return false;
  });

  if (clickedButton) {
    console.log('Click realizado en "Ver sillas"');

    // Wait for seat map to load
    console.log('Esperando mapa de asientos...');
    await page.waitForTimeout(5000);

    // Screenshot after click
    await page.screenshot({ path: path.join(screenshotDir, 'seats-v2-02-seatmap.png'), fullPage: true });
    console.log('Screenshot: seats-v2-02-seatmap.png');

    // Check for seat map title
    const pageContent = await page.content();
    const hasSeatMapTitle = pageContent.includes('Selecciona tus asientos');
    const hasLoading = pageContent.includes('Cargando asientos');
    const hasError = pageContent.includes('Error al cargar');

    console.log(`Estado: hasSeatMapTitle=${hasSeatMapTitle}, loading=${hasLoading}, error=${hasError}`);

    if (hasSeatMapTitle) {
      console.log('\nMapa de asientos cargado exitosamente!');

      // Try to select available seats
      const selectedSeat = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (/^[0-9]+$/.test(btn.textContent.trim()) && !btn.disabled && btn.className.includes('border-[#4a9c4e]')) {
            btn.click();
            return btn.textContent.trim();
          }
        }
        return null;
      });

      if (selectedSeat) {
        console.log(`Asiento ${selectedSeat} seleccionado`);
        await page.waitForTimeout(1000);

        // Screenshot with seat selected
        await page.screenshot({ path: path.join(screenshotDir, 'seats-v2-03-selected.png'), fullPage: true });
        console.log('Screenshot: seats-v2-03-selected.png');

        // Select another seat
        const anotherSeat = await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (/^[0-9]+$/.test(btn.textContent.trim()) && !btn.disabled && btn.className.includes('border-[#4a9c4e]')) {
              btn.click();
              return btn.textContent.trim();
            }
          }
          return null;
        });

        if (anotherSeat) {
          console.log(`Asiento ${anotherSeat} tambien seleccionado`);
          await page.waitForTimeout(1000);

          // Screenshot with multiple seats
          await page.screenshot({ path: path.join(screenshotDir, 'seats-v2-04-multiple.png'), fullPage: true });
          console.log('Screenshot: seats-v2-04-multiple.png');
        }
      } else {
        console.log('No se encontraron asientos disponibles para seleccionar');
      }
    }
  } else {
    console.log('No se pudo hacer click en "Ver sillas"');
  }

  console.log('\n=== PRUEBA COMPLETADA ===');
  console.log('Navegador abierto para inspeccion (20 seg)...');

  await page.waitForTimeout(20000);
  await browser.close();
})();
