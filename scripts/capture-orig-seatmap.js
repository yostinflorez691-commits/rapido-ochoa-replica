const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  const screenshotDir = path.join(__dirname, '..', 'screenshots');

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const formattedDate = `${String(tomorrow.getDate()).padStart(2, '0')}-${months[tomorrow.getMonth()]}-${String(tomorrow.getFullYear()).slice(-2)}`;

  const url = `https://viajes.rapidoochoa.com.co/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;

  console.log('Navegando al sitio original...');
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Click "Ver sillas"
  console.log('Buscando boton Ver sillas...');
  const buttons = page.locator('button:has-text("Ver sillas")');
  for (let i = 0; i < await buttons.count(); i++) {
    const btn = buttons.nth(i);
    if (await btn.isVisible()) {
      await btn.click();
      console.log('Click en Ver sillas');
      break;
    }
  }

  // Wait longer for seat map to load
  console.log('Esperando que cargue el mapa de asientos...');
  await page.waitForTimeout(8000);

  // Scroll to see seat map
  await page.evaluate(() => {
    const seatMap = document.querySelector('.new-seats-layout');
    if (seatMap) {
      seatMap.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: path.join(screenshotDir, 'orig-seatmap-detail.png'), fullPage: true });
  console.log('Screenshot: orig-seatmap-detail.png');

  // Get HTML structure of seat map
  const seatMapInfo = await page.evaluate(() => {
    const seatLayout = document.querySelector('.new-seats-layout');
    if (!seatLayout) return { found: false };

    // Get CSS styles
    const computedStyle = window.getComputedStyle(seatLayout);

    // Get structure
    const vehicle = document.querySelector('.vehicle-container');
    const seatsLayout = document.querySelector('.seats-layout');

    // Get a sample seat
    const seatButtons = document.querySelectorAll('.seats-layout button');
    let sampleSeat = null;
    if (seatButtons.length > 0) {
      const btn = seatButtons[0];
      sampleSeat = {
        className: btn.className,
        style: window.getComputedStyle(btn),
        innerHTML: btn.innerHTML,
        width: btn.offsetWidth,
        height: btn.offsetHeight
      };
    }

    return {
      found: true,
      layoutClass: seatLayout.className,
      vehicleClass: vehicle?.className,
      seatsClass: seatsLayout?.className,
      totalSeats: seatButtons.length,
      sampleSeat: sampleSeat ? {
        className: sampleSeat.className,
        width: sampleSeat.width,
        height: sampleSeat.height,
        bgColor: sampleSeat.style.backgroundColor,
        borderColor: sampleSeat.style.borderColor,
        borderRadius: sampleSeat.style.borderRadius
      } : null
    };
  });

  console.log('\n=== ESTRUCTURA DEL MAPA ORIGINAL ===');
  console.log(JSON.stringify(seatMapInfo, null, 2));

  // Take a closer screenshot of just the seat map area
  const seatMapElement = await page.$('.new-seats-layout');
  if (seatMapElement) {
    await seatMapElement.screenshot({ path: path.join(screenshotDir, 'orig-seatmap-only.png') });
    console.log('\nScreenshot del mapa solo: orig-seatmap-only.png');
  }

  console.log('\nNavegador abierto para inspeccion (30 seg)...');
  await page.waitForTimeout(30000);
  await browser.close();
})();
