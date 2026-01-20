const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const apiData = {
    requests: [],
    responses: []
  };

  // Interceptar requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('one-api')) {
      apiData.requests.push({
        method: request.method(),
        url: url,
        headers: request.headers(),
        postData: request.postData()
      });
    }
  });

  // Interceptar responses
  page.on('response', async response => {
    const url = response.url();
    if ((url.includes('api') || url.includes('one-api')) && response.status() === 200) {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json')) {
          const data = await response.json();
          apiData.responses.push({
            url: url,
            status: response.status(),
            data: data
          });
        }
      } catch (e) {}
    }
  });

  console.log('='.repeat(60));
  console.log('CAPTURANDO LLAMADAS API DEL SITIO ORIGINAL');
  console.log('='.repeat(60));

  // Cargar página principal
  console.log('\n[1] Cargando página principal...');
  await page.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Buscar origen
  console.log('[2] Escribiendo en búsqueda de origen...');
  const inputs = await page.locator('input').all();
  if (inputs.length > 0) {
    await inputs[0].click();
    await page.waitForTimeout(500);
    await inputs[0].fill('Med');
    await page.waitForTimeout(2000);
  }

  // Seleccionar Medellín si aparece
  const medellin = await page.locator('text=Medellín').first();
  if (await medellin.isVisible()) {
    await medellin.click();
    await page.waitForTimeout(1000);
  }

  // Buscar destino
  console.log('[3] Escribiendo en búsqueda de destino...');
  if (inputs.length > 1) {
    await inputs[1].click();
    await page.waitForTimeout(500);
    await inputs[1].fill('Bog');
    await page.waitForTimeout(2000);
  }

  // Seleccionar Bogotá
  const bogota = await page.locator('text=Bogotá').first();
  if (await bogota.isVisible()) {
    await bogota.click();
    await page.waitForTimeout(1000);
  }

  // Click en buscar
  console.log('[4] Haciendo búsqueda...');
  const searchBtn = await page.locator('button:has-text("Buscar")').first();
  if (await searchBtn.isVisible()) {
    await searchBtn.click();
    await page.waitForURL(/\/search\//, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(5000);
  }

  await browser.close();

  // Mostrar resultados
  console.log('\n' + '='.repeat(60));
  console.log('REQUESTS CAPTURADOS:');
  console.log('='.repeat(60));

  apiData.requests.forEach((req, i) => {
    console.log(`\n[Request ${i + 1}]`);
    console.log('  Method:', req.method);
    console.log('  URL:', req.url);
    if (req.postData) {
      console.log('  Body:', req.postData.substring(0, 500));
    }
    // Show important headers
    if (req.headers['authorization']) {
      console.log('  Auth:', req.headers['authorization'].substring(0, 50) + '...');
    }
    if (req.headers['x-api-key']) {
      console.log('  API Key:', req.headers['x-api-key']);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('RESPONSES CAPTURADOS:');
  console.log('='.repeat(60));

  apiData.responses.forEach((res, i) => {
    console.log(`\n[Response ${i + 1}]`);
    console.log('  URL:', res.url);
    console.log('  Data:', JSON.stringify(res.data, null, 2).substring(0, 2000));
  });

})();
