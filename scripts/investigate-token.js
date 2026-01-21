const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log('=== INVESTIGANDO ORIGEN DEL TOKEN ===\n');

  // Capture all JavaScript files loaded
  const jsFiles = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.endsWith('.js') || url.includes('.js?')) {
      jsFiles.push(url);
    }
  });

  // Navigate to the original site
  console.log('Navegando al sitio original...');
  await page.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for page to load
  await page.waitForTimeout(3000);

  // Try to find the token in the page's JavaScript context
  console.log('\n1. Buscando token en variables globales...');
  const globalSearch = await page.evaluate(() => {
    const results = {};

    // Search window object
    for (const key in window) {
      try {
        const value = window[key];
        if (typeof value === 'string' && value.includes('ac1d2715377e5d88e7fffe848034c0b1')) {
          results[key] = value;
        }
        if (typeof value === 'object' && value !== null) {
          const str = JSON.stringify(value);
          if (str && str.includes('ac1d2715377e5d88e7fffe848034c0b1')) {
            results[key] = 'FOUND IN OBJECT';
          }
        }
      } catch (e) {}
    }

    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (value && value.includes('ac1d2715377e5d88e7fffe848034c0b1')) {
        results['localStorage.' + key] = value.substring(0, 200);
      }
    }

    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      if (value && value.includes('ac1d2715377e5d88e7fffe848034c0b1')) {
        results['sessionStorage.' + key] = value.substring(0, 200);
      }
    }

    return results;
  });

  console.log('Variables encontradas:', Object.keys(globalSearch).length > 0 ? globalSearch : 'Ninguna');

  // Search in page HTML source
  console.log('\n2. Buscando token en HTML de la pagina...');
  const pageContent = await page.content();
  const tokenInHTML = pageContent.includes('ac1d2715377e5d88e7fffe848034c0b1');
  console.log('Token en HTML:', tokenInHTML ? 'SI ENCONTRADO' : 'No encontrado');

  // Search in inline scripts
  const inlineScripts = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script:not([src])');
    const found = [];
    scripts.forEach((script, i) => {
      if (script.textContent.includes('ac1d2715377e5d88e7fffe848034c0b1')) {
        found.push(`Script ${i}: ${script.textContent.substring(0, 500)}...`);
      }
    });
    return found;
  });

  if (inlineScripts.length > 0) {
    console.log('Token en scripts inline:', inlineScripts);
  }

  // List main JS files
  console.log('\n3. Archivos JS cargados:');
  const mainJsFiles = jsFiles.filter(url =>
    url.includes('rapidoochoa') || url.includes('_next') || url.includes('main')
  );
  mainJsFiles.slice(0, 10).forEach(url => console.log('  -', url.split('/').pop().split('?')[0]));

  // Try to find config or environment variables
  console.log('\n4. Buscando configuracion...');
  const configSearch = await page.evaluate(() => {
    const results = {};

    // Common config variable names
    const configNames = ['config', 'CONFIG', 'env', 'ENV', 'settings', 'SETTINGS',
                         'apiConfig', 'API_CONFIG', '__NEXT_DATA__', 'window.__ENV__'];

    for (const name of configNames) {
      try {
        const value = eval(name);
        if (value) {
          const str = JSON.stringify(value, null, 2);
          if (str.length < 5000) {
            results[name] = value;
          } else {
            results[name] = 'LARGE OBJECT - ' + str.substring(0, 500) + '...';
          }
        }
      } catch (e) {}
    }

    return results;
  });

  // Check __NEXT_DATA__ for token
  console.log('\n5. Contenido de __NEXT_DATA__:');
  const nextData = await page.evaluate(() => {
    const script = document.querySelector('#__NEXT_DATA__');
    if (script) {
      try {
        return JSON.parse(script.textContent);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  if (nextData) {
    console.log('Props keys:', Object.keys(nextData));
    if (nextData.props) {
      console.log('pageProps keys:', Object.keys(nextData.props.pageProps || {}));
    }

    // Search for token in nextData
    const nextDataStr = JSON.stringify(nextData);
    if (nextDataStr.includes('ac1d2715377e5d88e7fffe848034c0b1')) {
      console.log('TOKEN ENCONTRADO EN __NEXT_DATA__!');
    }
    if (nextDataStr.includes('token')) {
      console.log('Palabra "token" encontrada en __NEXT_DATA__');
    }
  }

  // Download and search main JS bundle
  console.log('\n6. Descargando y buscando en JS bundles principales...');
  for (const jsUrl of mainJsFiles.slice(0, 5)) {
    try {
      const response = await page.evaluate(async (url) => {
        const res = await fetch(url);
        return await res.text();
      }, jsUrl);

      if (response.includes('ac1d2715377e5d88e7fffe848034c0b1')) {
        console.log(`TOKEN ENCONTRADO EN: ${jsUrl.split('/').pop()}`);

        // Find context around the token
        const index = response.indexOf('ac1d2715377e5d88e7fffe848034c0b1');
        const context = response.substring(Math.max(0, index - 100), index + 150);
        console.log('Contexto:', context);
      }
    } catch (e) {
      // Skip if can't fetch
    }
  }

  console.log('\n=== INVESTIGACION COMPLETADA ===');
  console.log('\nNavegador abierto para inspeccion manual (30 seg)...');
  console.log('Puedes abrir DevTools > Network y buscar "token" o "authorization"');

  await page.waitForTimeout(30000);
  await browser.close();
})();
