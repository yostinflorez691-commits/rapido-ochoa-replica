const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== BUSCANDO TOKEN EN JS BUNDLES ===\n');

  const TOKEN = 'ac1d2715377e5d88e7fffe848034c0b1';

  // Capture JS files
  const jsContents = {};
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('.js') && url.includes('rapidoochoa')) {
      try {
        const content = await response.text();
        jsContents[url] = content;
      } catch (e) {}
    }
  });

  console.log('Cargando sitio...');
  await page.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  console.log(`\nArchivos JS: ${Object.keys(jsContents).length}`);

  // Search for token
  for (const [url, content] of Object.entries(jsContents)) {
    const fileName = url.split('/').pop().split('?')[0];

    if (content.includes(TOKEN)) {
      console.log(`\n=== TOKEN ENCONTRADO EN: ${fileName} ===`);

      const index = content.indexOf(TOKEN);
      const start = Math.max(0, index - 300);
      const end = Math.min(content.length, index + TOKEN.length + 300);
      const context = content.substring(start, end);

      console.log('\nContexto alrededor del token:');
      console.log('---');
      console.log(context);
      console.log('---');

      // Look for patterns that indicate how the token is set
      const surrounding = content.substring(Math.max(0, index - 1000), Math.min(content.length, index + 1000));

      if (surrounding.includes('process.env')) {
        console.log('\n>>> El token parece venir de process.env (variable de entorno)');
      }
      if (surrounding.includes('fetch') || surrounding.includes('axios')) {
        console.log('\n>>> El token podria venir de una llamada API');
      }
      if (surrounding.includes('NEXT_PUBLIC') || surrounding.includes('REACT_APP')) {
        console.log('\n>>> El token es una variable de entorno de build-time');
      }

      // Check if it's a constant
      const constMatch = surrounding.match(/(const|let|var)\s+\w+\s*=\s*["'].*ac1d2715377e5d88e7fffe848034c0b1/);
      if (constMatch) {
        console.log('\n>>> El token esta definido como constante:', constMatch[0].substring(0, 100));
      }
    }
  }

  await browser.close();

  console.log('\n\n=== CONCLUSION ===');
  console.log('El token "ac1d2715377e5d88e7fffe848034c0b1" parece ser un API key');
  console.log('estatico del tenant de Rapido Ochoa en el sistema Reserhub.');
  console.log('');
  console.log('RECOMENDACION: Este tipo de tokens de API publica generalmente');
  console.log('no cambian frecuentemente, pero si lo hace, se puede actualizar');
  console.log('manualmente en: src/app/api/trips/[tripId]/details/route.ts');
})();
