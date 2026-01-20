const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Capturando página de resultados...');

  await page.goto('http://localhost:3000/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/20-Ene-26/p/A1/departures', {
    waitUntil: 'networkidle'
  });

  // Wait for results to load
  await page.waitForTimeout(10000);

  // Take screenshot of viewport
  await page.screenshot({ path: 'screenshots/error-check-viewport.png' });
  console.log('Screenshot viewport guardado');

  // Take full page screenshot
  await page.screenshot({ path: 'screenshots/error-check-fullpage.png', fullPage: true });
  console.log('Screenshot fullpage guardado');

  // Check for any console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console Error:', msg.text());
    }
  });

  // Check page dimensions
  const dimensions = await page.evaluate(() => {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      bodyWidth: document.body.scrollWidth,
      bodyHeight: document.body.scrollHeight
    };
  });

  console.log('\nDimensiones de la página:', dimensions);

  // Check if there's horizontal scroll (indicates layout issues)
  if (dimensions.documentWidth > dimensions.windowWidth) {
    console.log('⚠️ HAY SCROLL HORIZONTAL - El contenido es más ancho que la ventana');
  }

  // Check trip cards
  const tripCards = await page.evaluate(() => {
    const cards = document.querySelectorAll('.rounded-xl, [class*="card"], [class*="trip"]');
    return {
      count: cards.length,
      firstCardWidth: cards[0]?.offsetWidth || 0,
      firstCardHeight: cards[0]?.offsetHeight || 0
    };
  });

  console.log('Tarjetas de viaje:', tripCards);

  console.log('\nNavegador abierto - revisa visualmente');

})();
