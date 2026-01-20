const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('='.repeat(60));
  console.log('COMPARACION DETALLADA DEL FORMULARIO DE BUSQUEDA');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false }); // headless: false para ver el proceso
  const viewport = { width: 1400, height: 900 };

  // Crear directorio de screenshots si no existe
  const screenshotDir = path.join(__dirname, '..', 'screenshots', 'search-comparison');

  try {
    // =============================================
    // CAPTURAR SITIO ORIGINAL
    // =============================================
    console.log('\n[1/4] Capturando sitio ORIGINAL...');
    const originalPage = await browser.newPage({ viewport });

    await originalPage.goto('https://viajes.rapidoochoa.com.co', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await originalPage.waitForTimeout(2000);

    // Screenshot 1: Pagina inicial
    await originalPage.screenshot({
      path: 'screenshots/search-comparison/01-original-home.png',
      fullPage: false
    });
    console.log('  - Capturado: pagina inicial original');

    // Screenshot 2: Formulario de busqueda (zoom)
    const originalSearchForm = await originalPage.locator('form').first();
    if (await originalSearchForm.isVisible()) {
      await originalSearchForm.screenshot({
        path: 'screenshots/search-comparison/02-original-search-form.png'
      });
      console.log('  - Capturado: formulario de busqueda original');
    }

    // Screenshot 3: Click en origen para ver dropdown
    const originInput = await originalPage.locator('input[placeholder*="rigen"], input[placeholder*="Origen"]').first();
    if (await originInput.isVisible()) {
      await originInput.click();
      await originalPage.waitForTimeout(500);
      await originInput.fill('Med');
      await originalPage.waitForTimeout(1000);
      await originalPage.screenshot({
        path: 'screenshots/search-comparison/03-original-origin-dropdown.png',
        fullPage: false
      });
      console.log('  - Capturado: dropdown de origen original');
    }

    // Seleccionar Medellin
    const medellinOption = await originalPage.locator('text=Medellín').first();
    if (await medellinOption.isVisible()) {
      await medellinOption.click();
      await originalPage.waitForTimeout(500);
    }

    // Screenshot 4: Click en destino para ver dropdown
    const destInput = await originalPage.locator('input[placeholder*="estino"], input[placeholder*="Destino"]').first();
    if (await destInput.isVisible()) {
      await destInput.click();
      await originalPage.waitForTimeout(500);
      await destInput.fill('Bog');
      await originalPage.waitForTimeout(1000);
      await originalPage.screenshot({
        path: 'screenshots/search-comparison/04-original-destination-dropdown.png',
        fullPage: false
      });
      console.log('  - Capturado: dropdown de destino original');
    }

    // Screenshot 5: Header detallado
    const header = await originalPage.locator('header').first();
    if (await header.isVisible()) {
      await header.screenshot({
        path: 'screenshots/search-comparison/05-original-header.png'
      });
      console.log('  - Capturado: header original');
    }

    await originalPage.close();

    // =============================================
    // CAPTURAR REPLICA
    // =============================================
    console.log('\n[2/4] Capturando REPLICA...');
    const replicaPage = await browser.newPage({ viewport });

    await replicaPage.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await replicaPage.waitForTimeout(2000);

    // Screenshot 1: Pagina inicial
    await replicaPage.screenshot({
      path: 'screenshots/search-comparison/01-replica-home.png',
      fullPage: false
    });
    console.log('  - Capturado: pagina inicial replica');

    // Screenshot 2: Formulario de busqueda (zoom)
    const replicaSearchForm = await replicaPage.locator('form').first();
    if (await replicaSearchForm.isVisible()) {
      await replicaSearchForm.screenshot({
        path: 'screenshots/search-comparison/02-replica-search-form.png'
      });
      console.log('  - Capturado: formulario de busqueda replica');
    }

    // Screenshot 3: Click en origen para ver dropdown
    const replicaOriginInput = await replicaPage.locator('input[placeholder*="rigen"], input[placeholder*="Origen"]').first();
    if (await replicaOriginInput.isVisible()) {
      await replicaOriginInput.click();
      await replicaPage.waitForTimeout(500);
      await replicaOriginInput.fill('Med');
      await replicaPage.waitForTimeout(1000);
      await replicaPage.screenshot({
        path: 'screenshots/search-comparison/03-replica-origin-dropdown.png',
        fullPage: false
      });
      console.log('  - Capturado: dropdown de origen replica');
    }

    // Seleccionar Medellin
    const replicaMedellin = await replicaPage.locator('text=Medellín').first();
    if (await replicaMedellin.isVisible()) {
      await replicaMedellin.click();
      await replicaPage.waitForTimeout(500);
    }

    // Screenshot 4: Click en destino para ver dropdown
    const replicaDestInput = await replicaPage.locator('input[placeholder*="estino"], input[placeholder*="Destino"]').first();
    if (await replicaDestInput.isVisible()) {
      await replicaDestInput.click();
      await replicaPage.waitForTimeout(500);
      await replicaDestInput.fill('Bog');
      await replicaPage.waitForTimeout(1000);
      await replicaPage.screenshot({
        path: 'screenshots/search-comparison/04-replica-destination-dropdown.png',
        fullPage: false
      });
      console.log('  - Capturado: dropdown de destino replica');
    }

    // Screenshot 5: Header detallado
    const replicaHeader = await replicaPage.locator('header').first();
    if (await replicaHeader.isVisible()) {
      await replicaHeader.screenshot({
        path: 'screenshots/search-comparison/05-replica-header.png'
      });
      console.log('  - Capturado: header replica');
    }

    await replicaPage.close();

    // =============================================
    // ABRIR AMBOS LADO A LADO
    // =============================================
    console.log('\n[3/4] Abriendo navegadores lado a lado para comparacion visual...');

    const leftPage = await browser.newPage({ viewport: { width: 700, height: 900 } });
    const rightPage = await browser.newPage({ viewport: { width: 700, height: 900 } });

    // Posicionar ventanas (esto puede no funcionar en todos los sistemas)
    await leftPage.goto('https://viajes.rapidoochoa.com.co');
    await rightPage.goto('http://localhost:3000');

    await leftPage.waitForTimeout(2000);
    await rightPage.waitForTimeout(2000);

    console.log('\n[4/4] Navegadores abiertos:');
    console.log('  - IZQUIERDA: Original (viajes.rapidoochoa.com.co)');
    console.log('  - DERECHA: Replica (localhost:3000)');
    console.log('\n' + '='.repeat(60));
    console.log('SCREENSHOTS GUARDADOS EN: screenshots/search-comparison/');
    console.log('='.repeat(60));
    console.log('\nPresiona Ctrl+C para cerrar los navegadores...\n');

    // Mantener navegadores abiertos para comparacion manual
    await new Promise(() => {}); // Esperar indefinidamente

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
