const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== BUSCANDO ORIGEN DEL TOKEN EN JS ===\n');

  const TOKEN = 'ac1d2715377e5d88e7fffe848034c0b1';

  // Capture all JS responses
  const jsContents = {};

  page.on('response', async response => {
    const url = response.url();
    if ((url.endsWith('.js') || url.includes('.js?')) && url.includes('rapidoochoa')) {
      try {
        const content = await response.text();
        jsContents[url] = content;
      } catch (e) {}
    }
  });

  // Navigate
  console.log('Cargando sitio...');
  await page.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);

  // Also do a search to trigger more JS
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const formattedDate = `${String(tomorrow.getDate()).padStart(2, '0')}-${months[tomorrow.getMonth()]}-${String(tomorrow.getFullYear()).slice(-2)}`;

  await page.goto(`https://viajes.rapidoochoa.com.co/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/${formattedDate}/p/A1/departures`, {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  await page.waitForTimeout(3000);

  console.log(`\nArchivos JS capturados: ${Object.keys(jsContents).length}`);

  // Search for token in all JS files
  console.log('\nBuscando token en archivos JS...\n');

  for (const [url, content] of Object.entries(jsContents)) {
    const fileName = url.split('/').pop().split('?')[0];

    if (content.includes(TOKEN)) {
      console.log(`\n=== ENCONTRADO EN: ${fileName} ===`);

      // Find all occurrences
      let index = 0;
      let count = 0;
      while ((index = content.indexOf(TOKEN, index)) !== -1) {
        count++;
        // Get context
        const start = Math.max(0, index - 200);
        const end = Math.min(content.length, index + TOKEN.length + 200);
        let context = content.substring(start, end);

        // Clean up for readability
        context = context.replace(/\\n/g, '\n').replace(/\\"/g, '"');

        console.log(`\nOcurrencia ${count}:`);
        console.log('---');
        console.log(context);
        console.log('---');

        index++;
      }

      console.log(`\nTotal ocurrencias: ${count}`);

      // Save the relevant JS file for analysis
      const savePath = path.join(__dirname, '..', 'screenshots', `token-source-${fileName}`);
      fs.writeFileSync(savePath, content.substring(0, 50000)); // First 50KB
      console.log(`Guardado en: ${savePath}`);
    }
  }

  // Also check if there's an API call that returns the token
  console.log('\n\n=== BUSCANDO SI EL TOKEN VIENE DE UNA API ===');

  // Look for patterns like "getToken", "fetchToken", "apiKey", etc.
  for (const [url, content] of Object.entries(jsContents)) {
    const fileName = url.split('/').pop().split('?')[0];

    const patterns = [
      /getToken|fetchToken|apiToken|apiKey|authToken/gi,
      /authorization.*header/gi,
      /token.*=.*fetch/gi,
      /Bearer|Token token=/gi
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`\n${fileName}: ${matches.slice(0, 5).join(', ')}`);
      }
    }
  }

  // Check if token is environment variable
  console.log('\n\n=== VERIFICANDO SI ES VARIABLE DE ENTORNO ===');

  const envCheck = await page.evaluate(() => {
    // Check common env patterns
    const checks = {
      'process.env exists': typeof process !== 'undefined' && typeof process.env !== 'undefined',
      'window.__ENV__ exists': typeof window.__ENV__ !== 'undefined',
      'window.env exists': typeof window.env !== 'undefined',
    };
    return checks;
  });
  console.log(envCheck);

  await browser.close();

  console.log('\n=== ANALISIS COMPLETADO ===');
  console.log('\nCONCLUSION:');
  console.log('Si el token esta hardcodeado en el JS bundle, es probable que sea');
  console.log('un token de API publico que no cambia frecuentemente.');
  console.log('Si viene de una API o env var, podria cambiar periodicamente.');
})();
