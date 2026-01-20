const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Iniciando comparacion visual de pagina de resultados de busqueda...\n');

  const browser = await chromium.launch({ headless: true });
  const viewport = { width: 1440, height: 900 };

  // Calculate tomorrow's date in the required format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  const originSlug = 't-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa';
  const destSlug = 't-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa';

  const originalSearchUrl = `https://viajes.rapidoochoa.com.co/search/${originSlug}/${destSlug}/${formattedDate}/p/A1/departures`;
  const replicaSearchUrl = `http://localhost:3001/search/${originSlug}/${destSlug}/${formattedDate}/p/A1/departures`;

  console.log('URLs a comparar:');
  console.log('Original:', originalSearchUrl);
  console.log('Replica:', replicaSearchUrl);
  console.log('');

  try {
    // Capture original site - Home
    console.log('1. Capturando pagina principal del sitio ORIGINAL...');
    const pageOriginal = await browser.newPage({ viewport });
    await pageOriginal.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'networkidle', timeout: 60000 });
    await pageOriginal.waitForTimeout(3000);
    await pageOriginal.screenshot({ path: 'screenshots/original-home.png', fullPage: false });
    console.log('   -> screenshots/original-home.png');

    // Capture original site - Search Results
    console.log('2. Capturando resultados de busqueda del sitio ORIGINAL...');
    await pageOriginal.goto(originalSearchUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await pageOriginal.waitForTimeout(5000);
    await pageOriginal.screenshot({ path: 'screenshots/original-search-results.png', fullPage: false });
    console.log('   -> screenshots/original-search-results.png');

    // Get HTML structure of search results
    const originalHTML = await pageOriginal.evaluate(() => {
      const searchBar = document.querySelector('.search-bar, [class*="search"], header');
      const results = document.querySelector('.results, [class*="result"], main');
      return {
        searchBarClasses: searchBar ? searchBar.className : 'not found',
        resultsClasses: results ? results.className : 'not found',
        bodyClasses: document.body.className
      };
    });
    console.log('\n   Estructura del sitio original:');
    console.log('   - Search bar classes:', originalHTML.searchBarClasses);
    console.log('   - Results classes:', originalHTML.resultsClasses);

    await pageOriginal.close();

    // Capture replica site - Home
    console.log('\n3. Capturando pagina principal de la REPLICA...');
    const pageReplica = await browser.newPage({ viewport });
    await pageReplica.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 60000 });
    await pageReplica.waitForTimeout(3000);
    await pageReplica.screenshot({ path: 'screenshots/replica-home.png', fullPage: false });
    console.log('   -> screenshots/replica-home.png');

    // Capture replica site - Search Results
    console.log('4. Capturando resultados de busqueda de la REPLICA...');
    await pageReplica.goto(replicaSearchUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await pageReplica.waitForTimeout(8000); // Wait longer for API calls
    await pageReplica.screenshot({ path: 'screenshots/replica-search-results.png', fullPage: false });
    console.log('   -> screenshots/replica-search-results.png');

    await pageReplica.close();

    console.log('\n========================================');
    console.log('CAPTURAS COMPLETADAS');
    console.log('========================================');
    console.log('Revisa las imagenes en la carpeta screenshots/');
    console.log('');
    console.log('Archivos generados:');
    console.log('  - original-home.png (pagina principal original)');
    console.log('  - original-search-results.png (resultados original)');
    console.log('  - replica-home.png (pagina principal replica)');
    console.log('  - replica-search-results.png (resultados replica)');
    console.log('');
    console.log('Compara visualmente estos archivos para identificar diferencias.');

  } catch (error) {
    console.error('Error durante la captura:', error.message);
  } finally {
    await browser.close();
  }
})();
