const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });

  // Create two browser contexts for side-by-side comparison
  const contextOriginal = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const contextReplica = await browser.newContext({ viewport: { width: 1200, height: 900 } });

  const pageOriginal = await contextOriginal.newPage();
  const pageReplica = await contextReplica.newPage();

  // Track all API calls on the original site
  const apiCalls = {
    requests: [],
    responses: []
  };

  console.log('='.repeat(70));
  console.log('COMPARANDO SITIOS Y DESCUBRIENDO APIs OCULTAS');
  console.log('='.repeat(70));

  // Intercept all network requests on original site
  pageOriginal.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('graphql') || url.includes('.json') ||
        url.includes('search') || url.includes('places') || url.includes('config')) {
      apiCalls.requests.push({
        method: request.method(),
        url: url,
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });

  pageOriginal.on('response', async response => {
    const url = response.url();
    if ((url.includes('api') || url.includes('graphql') || url.includes('.json') ||
         url.includes('config') || url.includes('settings')) && response.status() === 200) {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json')) {
          const data = await response.json();
          apiCalls.responses.push({
            url: url,
            status: response.status(),
            dataPreview: JSON.stringify(data).substring(0, 500)
          });
        }
      } catch (e) {}
    }
  });

  // Open both sites
  console.log('\n[1] Abriendo sitio ORIGINAL...');
  await pageOriginal.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'networkidle' });

  console.log('[2] Abriendo sitio REPLICA...');
  await pageReplica.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  await Promise.all([
    pageOriginal.waitForTimeout(3000),
    pageReplica.waitForTimeout(3000)
  ]);

  console.log('\n' + '='.repeat(70));
  console.log('APIs DETECTADAS EN LA PÁGINA PRINCIPAL (ORIGINAL):');
  console.log('='.repeat(70));

  // Show discovered API calls
  if (apiCalls.requests.length > 0) {
    apiCalls.requests.forEach((req, i) => {
      console.log(`\n[Request ${i + 1}]`);
      console.log('  Method:', req.method);
      console.log('  URL:', req.url);
      if (req.postData) {
        console.log('  Body:', req.postData.substring(0, 300));
      }
    });
  } else {
    console.log('  No se detectaron llamadas API iniciales');
  }

  if (apiCalls.responses.length > 0) {
    console.log('\n' + '-'.repeat(50));
    console.log('RESPUESTAS JSON:');
    apiCalls.responses.forEach((res, i) => {
      console.log(`\n[Response ${i + 1}]`);
      console.log('  URL:', res.url);
      console.log('  Data:', res.dataPreview);
    });
  }

  // Now interact with the original site to discover more APIs
  console.log('\n' + '='.repeat(70));
  console.log('INTERACTUANDO CON EL SITIO ORIGINAL PARA DESCUBRIR MÁS APIs...');
  console.log('='.repeat(70));

  // Clear previous calls
  apiCalls.requests = [];
  apiCalls.responses = [];

  // Click on origin input
  console.log('\n[3] Haciendo clic en campo de origen...');
  const origInputs = await pageOriginal.locator('input').all();
  if (origInputs.length > 0) {
    await origInputs[0].click();
    await pageOriginal.waitForTimeout(1500);
  }

  // Type to trigger search
  console.log('[4] Escribiendo "Med" para buscar...');
  await pageOriginal.keyboard.type('Med');
  await pageOriginal.waitForTimeout(2000);

  console.log('\n' + '-'.repeat(50));
  console.log('APIs LLAMADAS AL BUSCAR ORIGEN:');
  apiCalls.requests.forEach((req, i) => {
    console.log(`  [${i + 1}] ${req.method} ${req.url}`);
  });

  // Select Medellin
  const medellinOrig = await pageOriginal.locator('text=Medellín').first();
  if (await medellinOrig.isVisible()) {
    console.log('\n[5] Seleccionando Medellín...');
    await medellinOrig.click();
    await pageOriginal.waitForTimeout(1500);
  }

  // Clear and check for destination APIs
  apiCalls.requests = [];

  // Click destination
  console.log('[6] Haciendo clic en destino...');
  if (origInputs.length > 1) {
    await origInputs[1].click();
    await pageOriginal.waitForTimeout(1500);
  }

  console.log('\n' + '-'.repeat(50));
  console.log('APIs LLAMADAS AL SELECCIONAR DESTINO:');
  apiCalls.requests.forEach((req, i) => {
    console.log(`  [${i + 1}] ${req.method} ${req.url}`);
  });

  // Type Bogota
  await pageOriginal.keyboard.type('Bog');
  await pageOriginal.waitForTimeout(2000);

  // Select Bogota
  const bogotaOrig = await pageOriginal.locator('text=Bogotá').first();
  if (await bogotaOrig.isVisible()) {
    console.log('[7] Seleccionando Bogotá...');
    await bogotaOrig.click();
    await pageOriginal.waitForTimeout(1000);
  }

  // Now do the same on replica
  console.log('\n' + '='.repeat(70));
  console.log('REPLICANDO EN NUESTRO SITIO...');
  console.log('='.repeat(70));

  // Interact with replica
  const repOriginInput = await pageReplica.locator('input[placeholder*="Origen"]').first();
  await repOriginInput.click();
  await pageReplica.waitForTimeout(500);
  await repOriginInput.fill('Med');
  await pageReplica.waitForTimeout(1500);

  const repMedellin = await pageReplica.locator('button:has-text("Medellín")').first();
  if (await repMedellin.isVisible()) {
    console.log('[8] Seleccionando Medellín en replica...');
    await repMedellin.click();
    await pageReplica.waitForTimeout(1000);
  }

  const repDestInput = await pageReplica.locator('input[placeholder*="Destino"]').first();
  await repDestInput.click();
  await pageReplica.waitForTimeout(1500);
  await repDestInput.fill('Bog');
  await pageReplica.waitForTimeout(1000);

  const repBogota = await pageReplica.locator('button:has-text("Bogotá")').first();
  if (await repBogota.isVisible()) {
    console.log('[9] Seleccionando Bogotá en replica...');
    await repBogota.click();
    await pageReplica.waitForTimeout(500);
  }

  // Take comparison screenshots
  console.log('\n[10] Tomando screenshots de comparación...');
  await pageOriginal.screenshot({ path: 'screenshots/compare-original-ready.png' });
  await pageReplica.screenshot({ path: 'screenshots/compare-replica-ready.png' });

  // Click search on both
  console.log('\n[11] Ejecutando búsqueda en ambos sitios...');

  // Clear API tracking for search
  apiCalls.requests = [];

  const searchBtnOrig = await pageOriginal.locator('button:has-text("Buscar")').first();
  const searchBtnRep = await pageReplica.locator('button[type="submit"]:visible').first();

  await Promise.all([
    searchBtnOrig.click(),
    searchBtnRep.click()
  ]);

  // Wait for navigation
  await Promise.all([
    pageOriginal.waitForURL(/\/search\//, { timeout: 15000 }).catch(() => {}),
    pageReplica.waitForURL(/\/search\//, { timeout: 15000 }).catch(() => {})
  ]);

  await pageOriginal.waitForTimeout(5000);
  await pageReplica.waitForTimeout(8000);

  console.log('\n' + '-'.repeat(50));
  console.log('APIs LLAMADAS AL BUSCAR:');
  apiCalls.requests.forEach((req, i) => {
    console.log(`  [${i + 1}] ${req.method} ${req.url.substring(0, 100)}`);
  });

  // Take final screenshots
  console.log('\n[12] Tomando screenshots finales...');
  await pageOriginal.screenshot({ path: 'screenshots/compare-original-results.png', fullPage: true });
  await pageReplica.screenshot({ path: 'screenshots/compare-replica-results.png', fullPage: true });

  console.log('\n' + '='.repeat(70));
  console.log('RESUMEN DE APIs DESCUBIERTAS:');
  console.log('='.repeat(70));
  console.log(`
  1. GET /api/v2/places?prefetch=true
     - Obtiene todos los terminales al cargar

  2. GET /api/v2/places?from={slug}&order_by=origin_hits
     - Obtiene destinos disponibles desde un origen

  3. POST /api/v2/search
     - Crea una búsqueda con: origin, destination, date, passengers
     - Retorna: search_id, terminals, lines, config

  4. GET /api/v2/search/{id}?type=bus
     - Obtiene resultados de la búsqueda
     - Retorna: trips (viajes), lines, terminals, state
  `);

  console.log('\n' + '='.repeat(70));
  console.log('COMPARACIÓN COMPLETADA');
  console.log('Navegadores abiertos para inspección manual.');
  console.log('='.repeat(70));

})();
