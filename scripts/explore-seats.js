const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });

  // Capture all network requests
  const apiCalls = [];

  const page = await context.newPage();

  // Listen to all requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('search') || url.includes('seat') || url.includes('trip')) {
      apiCalls.push({
        method: request.method(),
        url: url,
        type: 'request'
      });
      console.log(`>> REQUEST: ${request.method()} ${url}`);
    }
  });

  // Listen to all responses
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('search') || url.includes('seat') || url.includes('trip')) {
      let body = null;
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json')) {
          body = await response.json();
        }
      } catch (e) {}

      apiCalls.push({
        method: response.request().method(),
        url: url,
        status: response.status(),
        type: 'response',
        body: body
      });
      console.log(`<< RESPONSE: ${response.status()} ${url}`);
      if (body) {
        console.log('   Body keys:', Object.keys(body));
      }
    }
  });

  // Calculate tomorrow's date for the search
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  // Go directly to search results page
  const searchUrl = `https://viajes.rapidoochoa.com.co/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`;

  console.log('\n=== NAVEGANDO A RESULTADOS ===');
  console.log('URL:', searchUrl);

  await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Screenshot of results
  await page.screenshot({ path: 'screenshots/seats-01-results.png', fullPage: true });
  console.log('\nScreenshot: seats-01-results.png');

  // Find and click on "Ver sillas" button
  console.log('\n=== BUSCANDO BOTON "VER SILLAS" ===');

  const verSillasButtons = await page.locator('button:has-text("Ver sillas"), a:has-text("Ver sillas")').all();
  console.log(`Encontrados ${verSillasButtons.length} botones "Ver sillas"`);

  if (verSillasButtons.length > 0) {
    console.log('\n=== HACIENDO CLICK EN "VER SILLAS" ===');

    // Click first available button
    await verSillasButtons[0].click();

    // Wait for navigation or modal
    await page.waitForTimeout(5000);

    // Screenshot after click
    await page.screenshot({ path: 'screenshots/seats-02-after-click.png', fullPage: true });
    console.log('\nScreenshot: seats-02-after-click.png');

    // Check current URL
    console.log('\nURL actual:', page.url());

    // Wait more for any additional loading
    await page.waitForTimeout(3000);

    // Another screenshot
    await page.screenshot({ path: 'screenshots/seats-03-seat-selection.png', fullPage: true });
    console.log('\nScreenshot: seats-03-seat-selection.png');

    // Look for seat map elements
    console.log('\n=== BUSCANDO ELEMENTOS DEL MAPA DE ASIENTOS ===');

    const seatElements = await page.locator('[class*="seat"], [class*="asiento"], [class*="bus"], svg, canvas').all();
    console.log(`Elementos relacionados con asientos: ${seatElements.length}`);

    // Check for SVG or Canvas (common for seat maps)
    const svgElements = await page.locator('svg').count();
    const canvasElements = await page.locator('canvas').count();
    console.log(`SVG elements: ${svgElements}`);
    console.log(`Canvas elements: ${canvasElements}`);

    // Look for specific seat-related classes
    const pageContent = await page.content();

    // Search for seat-related patterns
    const patterns = [
      /class="[^"]*seat[^"]*"/gi,
      /class="[^"]*asiento[^"]*"/gi,
      /class="[^"]*silla[^"]*"/gi,
      /class="[^"]*bus[^"]*"/gi,
      /data-seat/gi,
      /seat-\d+/gi
    ];

    console.log('\n=== PATRONES ENCONTRADOS EN HTML ===');
    patterns.forEach(pattern => {
      const matches = pageContent.match(pattern);
      if (matches) {
        console.log(`${pattern}: ${matches.length} coincidencias`);
        console.log('  Ejemplos:', matches.slice(0, 3));
      }
    });
  }

  // Print all API calls summary
  console.log('\n\n========================================');
  console.log('=== RESUMEN DE LLAMADAS API ===');
  console.log('========================================\n');

  apiCalls.forEach((call, i) => {
    if (call.type === 'response') {
      console.log(`${i+1}. ${call.method} ${call.url}`);
      console.log(`   Status: ${call.status}`);
      if (call.body) {
        console.log(`   Body keys: ${Object.keys(call.body).join(', ')}`);
      }
      console.log('');
    }
  });

  // Save API calls to file
  const fs = require('fs');
  fs.writeFileSync('screenshots/api-calls-seats.json', JSON.stringify(apiCalls, null, 2));
  console.log('\nAPI calls guardadas en: screenshots/api-calls-seats.json');

  console.log('\n=== EXPLORACION COMPLETADA ===');
  console.log('Revisa las screenshots y el archivo JSON para mas detalles.');
  console.log('El navegador permanecera abierto para inspeccion manual.');

  // Keep browser open for manual inspection
  await page.waitForTimeout(60000);

  await browser.close();
})();
