const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Capture all requests to the API
  const capturedRequests = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('one-api.rapidoochoa.com.co') || url.includes('details_requests')) {
      console.log('\n=== REQUEST ===');
      console.log('URL:', url);
      console.log('Method:', request.method());
      console.log('Headers:', JSON.stringify(request.headers(), null, 2));
      capturedRequests.push({
        url,
        method: request.method(),
        headers: request.headers()
      });
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('one-api.rapidoochoa.com.co') || url.includes('details_requests')) {
      console.log('\n=== RESPONSE ===');
      console.log('URL:', url);
      console.log('Status:', response.status());
      try {
        const body = await response.text();
        console.log('Body:', body.substring(0, 500));
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

  console.log('\nEsperando que carguen los viajes...');
  await page.waitForTimeout(5000);

  // Click on "Ver sillas" button
  console.log('\nBuscando boton "Ver sillas"...');
  const clicked = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Ver sillas') && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
    }
    return false;
  });

  if (clicked) {
    console.log('Click realizado, capturando peticiones de API...');
    await page.waitForTimeout(10000);
  } else {
    console.log('No se encontro el boton');
  }

  console.log('\n\n=== RESUMEN DE PETICIONES CAPTURADAS ===');
  console.log(JSON.stringify(capturedRequests, null, 2));

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('screenshots/captured-headers.json', JSON.stringify(capturedRequests, null, 2));
  console.log('\nGuardado en screenshots/captured-headers.json');

  console.log('\nNavegador abierto para inspeccion (20 seg)...');
  await page.waitForTimeout(20000);
  await browser.close();
})();
