const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // Open both sites side by side
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });

  const pageOrig = await context.newPage();
  const pageRep = await context.newPage();

  console.log('Abriendo ambos sitios para comparar resultados...\n');

  // Go directly to search results on both
  const searchDate = '20-Ene-26';
  const originSlug = 't-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa';
  const destSlug = 't-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa';

  // Original site URL
  const origUrl = `https://viajes.rapidoochoa.com.co/search/${originSlug}/${destSlug}/${searchDate}/p/A1/departures`;

  // Replica site URL
  const repUrl = `http://localhost:3000/search/${originSlug}/${destSlug}/${searchDate}/p/A1/departures`;

  console.log('URL Original:', origUrl);
  console.log('URL Replica:', repUrl);

  await pageOrig.goto(origUrl, { waitUntil: 'networkidle' });
  await pageRep.goto(repUrl, { waitUntil: 'networkidle' });

  // Wait for content to load
  await pageOrig.waitForTimeout(5000);
  await pageRep.waitForTimeout(8000);

  // Take screenshots
  await pageOrig.screenshot({ path: 'screenshots/layout-original-full.png', fullPage: true });
  await pageRep.screenshot({ path: 'screenshots/layout-replica-full.png', fullPage: true });

  // Get page dimensions
  const origDimensions = await pageOrig.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth,
    tripCards: document.querySelectorAll('[class*="trip"], [class*="card"], [class*="result"]').length
  }));

  const repDimensions = await pageRep.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: document.documentElement.clientHeight,
    clientWidth: document.documentElement.clientWidth,
    tripCards: document.querySelectorAll('[class*="trip"], [class*="card"], [class*="result"]').length
  }));

  console.log('\n=== DIMENSIONES ===');
  console.log('Original:', origDimensions);
  console.log('Replica:', repDimensions);

  // Check specific elements on original
  const origElements = await pageOrig.evaluate(() => {
    const results = [];
    // Find trip cards
    const cards = document.querySelectorAll('[class*="departure"], [class*="trip"], [class*="schedule"]');
    cards.forEach((card, i) => {
      if (i < 3) {
        results.push({
          className: card.className,
          height: card.offsetHeight,
          width: card.offsetWidth
        });
      }
    });
    return results;
  });

  console.log('\nElementos en Original:', origElements);

  console.log('\n=== Navegadores abiertos para inspección ===');
  console.log('Compara visualmente ambos sitios.');

})();
