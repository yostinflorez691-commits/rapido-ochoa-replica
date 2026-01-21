const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });

  const page = await context.newPage();

  // Capture API responses
  const apiResponses = [];

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('one-api') && url.includes('trip')) {
      try {
        const json = await response.json();
        apiResponses.push({ url, data: json });
        console.log('API Response:', url);
      } catch (e) {}
    }
  });

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  const searchUrl = `https://viajes.rapidoochoa.com.co/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;

  console.log('Navegando a:', searchUrl);
  await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Click on first "Ver sillas" button
  console.log('\nBuscando boton Ver sillas...');
  const verSillasBtn = page.locator('button:has-text("Ver sillas")').first();

  if (await verSillasBtn.isVisible()) {
    console.log('Haciendo click en Ver sillas...');
    await verSillasBtn.click();

    // Wait for seat map to load
    await page.waitForTimeout(5000);

    // Scroll to see seat map
    await page.evaluate(() => {
      const seatSection = document.querySelector('.new-seats-layout') ||
                          document.querySelector('[class*="seat"]') ||
                          document.querySelector('.trip-details');
      if (seatSection) {
        seatSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    await page.waitForTimeout(2000);

    // Screenshot of expanded card with seat map
    await page.screenshot({ path: 'screenshots/seats-expanded-view.png', fullPage: true });
    console.log('Screenshot: seats-expanded-view.png');

    // Get seat map HTML structure
    const seatMapHTML = await page.evaluate(() => {
      const seatLayout = document.querySelector('.new-seats-layout') ||
                         document.querySelector('.new-seats-layout-diagram') ||
                         document.querySelector('[class*="seats"]');
      return seatLayout ? seatLayout.outerHTML.substring(0, 5000) : 'No seat layout found';
    });

    console.log('\n=== ESTRUCTURA HTML DEL MAPA DE ASIENTOS ===');
    console.log(seatMapHTML.substring(0, 2000));

    // Look for seat elements
    const seatInfo = await page.evaluate(() => {
      const seats = document.querySelectorAll('[class*="seat"], [class*="silla"], [data-seat]');
      const info = [];
      seats.forEach((seat, i) => {
        if (i < 10) {
          info.push({
            class: seat.className,
            text: seat.textContent?.trim().substring(0, 50),
            dataAttrs: Array.from(seat.attributes).filter(a => a.name.startsWith('data-')).map(a => `${a.name}=${a.value}`)
          });
        }
      });
      return info;
    });

    console.log('\n=== ELEMENTOS DE ASIENTOS ENCONTRADOS ===');
    console.log(JSON.stringify(seatInfo, null, 2));

    // Check for SVG bus diagram
    const svgInfo = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      return Array.from(svgs).map(svg => ({
        id: svg.id,
        class: svg.className?.baseVal || svg.className,
        width: svg.getAttribute('width'),
        height: svg.getAttribute('height'),
        childCount: svg.children.length
      }));
    });

    console.log('\n=== ELEMENTOS SVG ===');
    console.log(JSON.stringify(svgInfo, null, 2));
  }

  // Save API responses
  if (apiResponses.length > 0) {
    // Find the one with bus/seats data
    const seatResponse = apiResponses.find(r => r.data?.bus || r.data?.seats);
    if (seatResponse) {
      fs.writeFileSync('screenshots/seat-api-response.json', JSON.stringify(seatResponse.data, null, 2));
      console.log('\n=== API RESPONSE GUARDADA ===');
      console.log('Archivo: screenshots/seat-api-response.json');

      // Show structure
      if (seatResponse.data.bus) {
        console.log('\nEstructura del bus:');
        console.log('- Pisos:', seatResponse.data.bus.length);
        if (seatResponse.data.bus[0]) {
          console.log('- Filas por piso:', seatResponse.data.bus[0].length);
          if (seatResponse.data.bus[0][0]) {
            console.log('- Asientos por fila:', seatResponse.data.bus[0][0].length);
            console.log('- Ejemplo asiento:', JSON.stringify(seatResponse.data.bus[0][0][0]));
          }
        }
      }
    }
  }

  console.log('\n=== EXPLORACION COMPLETADA ===');
  console.log('Navegador abierto para inspeccion manual (30 seg)...');

  await page.waitForTimeout(30000);
  await browser.close();
})();
