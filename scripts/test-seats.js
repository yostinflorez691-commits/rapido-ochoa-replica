const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

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
  await page.waitForTimeout(8000);

  // Screenshot of results
  await page.screenshot({ path: 'screenshots/test-seats-01-results.png' });
  console.log('Screenshot: test-seats-01-results.png');

  // Find VISIBLE "Ver sillas" buttons (desktop version - hidden md:block)
  console.log('\nBuscando botones "Ver sillas" visibles...');

  // Use evaluate to find visible buttons
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
    await page.waitForTimeout(8000);

    // Screenshot after click
    await page.screenshot({ path: 'screenshots/test-seats-02-seatmap.png', fullPage: true });
    console.log('Screenshot: test-seats-02-seatmap.png');

    // Check for seat buttons or loading/error
    const pageContent = await page.content();
    const hasLoading = pageContent.includes('Cargando asientos');
    const hasError = pageContent.includes('Error');
    const hasSeatMap = pageContent.includes('Selecciona tus asientos');

    console.log(`Estado: loading=${hasLoading}, error=${hasError}, seatMap=${hasSeatMap}`);

    // Try to select seats
    const selectedSeat = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        // Look for numbered seat buttons that are not disabled
        if (/^[0-9]+$/.test(btn.textContent.trim()) && !btn.disabled) {
          btn.click();
          return btn.textContent.trim();
        }
      }
      return null;
    });

    if (selectedSeat) {
      console.log(`Asiento ${selectedSeat} seleccionado`);
      await page.waitForTimeout(1000);

      await page.screenshot({ path: 'screenshots/test-seats-03-selected.png', fullPage: true });
      console.log('Screenshot: test-seats-03-selected.png');

      // Select another seat
      const anotherSeat = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (/^[0-9]+$/.test(btn.textContent.trim()) && !btn.disabled) {
            btn.click();
            return btn.textContent.trim();
          }
        }
        return null;
      });

      if (anotherSeat) {
        console.log(`Asiento ${anotherSeat} seleccionado`);
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'screenshots/test-seats-04-multiple.png', fullPage: true });
        console.log('Screenshot: test-seats-04-multiple.png');
      }
    } else {
      console.log('No se encontraron asientos para seleccionar');
    }
  } else {
    console.log('No se pudo hacer click en "Ver sillas"');
  }

  console.log('\n=== PRUEBA COMPLETADA ===');
  console.log('Navegador abierto para inspeccion (30 seg)...');

  await page.waitForTimeout(30000);
  await browser.close();
})();
