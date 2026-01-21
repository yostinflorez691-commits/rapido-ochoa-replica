const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const screenshotDir = path.join(__dirname, '..', 'screenshots');

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  // === ORIGINAL SITE ===
  console.log('=== CAPTURANDO SITIO ORIGINAL ===');
  const pageOrig = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const origUrl = `https://viajes.rapidoochoa.com.co/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;
  console.log('URL:', origUrl);

  await pageOrig.goto(origUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await pageOrig.waitForTimeout(3000);

  // Click "Ver sillas"
  const origButtons = pageOrig.locator('button:has-text("Ver sillas")');
  for (let i = 0; i < await origButtons.count(); i++) {
    const btn = origButtons.nth(i);
    if (await btn.isVisible()) {
      await btn.click();
      console.log('Click en Ver sillas (original)');
      break;
    }
  }

  await pageOrig.waitForTimeout(5000);
  await pageOrig.screenshot({ path: path.join(screenshotDir, 'compare-orig-seatmap.png'), fullPage: true });
  console.log('Screenshot: compare-orig-seatmap.png');

  // Get the seat map HTML structure
  const origSeatMapHTML = await pageOrig.evaluate(() => {
    const seatMap = document.querySelector('.new-seats-layout') ||
                    document.querySelector('[class*="seats"]') ||
                    document.querySelector('[class*="seat-map"]');
    if (seatMap) {
      return {
        className: seatMap.className,
        innerHTML: seatMap.innerHTML.substring(0, 5000),
        outerHTML: seatMap.outerHTML.substring(0, 2000)
      };
    }
    return null;
  });

  console.log('\nClases del mapa original:', origSeatMapHTML?.className);

  // === REPLICA SITE ===
  console.log('\n=== CAPTURANDO REPLICA ===');
  const pageRep = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const repUrl = `http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;
  console.log('URL:', repUrl);

  await pageRep.goto(repUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await pageRep.waitForTimeout(3000);

  // Click "Ver sillas"
  const repButtons = pageRep.locator('button:has-text("Ver sillas")');
  for (let i = 0; i < await repButtons.count(); i++) {
    const btn = repButtons.nth(i);
    if (await btn.isVisible()) {
      await btn.click();
      console.log('Click en Ver sillas (replica)');
      break;
    }
  }

  await pageRep.waitForTimeout(5000);
  await pageRep.screenshot({ path: path.join(screenshotDir, 'compare-rep-seatmap.png'), fullPage: true });
  console.log('Screenshot: compare-rep-seatmap.png');

  console.log('\n=== COMPARACION COMPLETADA ===');
  console.log('Revisa los screenshots para ver las diferencias');
  console.log('Navegadores abiertos para inspeccion (40 seg)...');

  await pageOrig.waitForTimeout(40000);
  await browser.close();
})();
