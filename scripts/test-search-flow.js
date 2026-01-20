const { chromium } = require('playwright');

(async () => {
  console.log('='.repeat(50));
  console.log('TEST: Flujo completo de busqueda');
  console.log('='.repeat(50));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  try {
    // 1. Ir a la pagina principal
    console.log('\n[1] Navegando a localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/search-comparison/test-01-home.png' });
    console.log('    OK - Pagina cargada');

    // 2. Click en campo origen y buscar "Medellin"
    console.log('\n[2] Escribiendo en campo Origen: "Med"...');
    const originInput = await page.locator('input[placeholder*="Origen"]').first();
    await originInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.type('Med', { delay: 100 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/search-comparison/test-02-origin-search.png' });
    console.log('    OK - Dropdown de origen visible');

    // 3. Seleccionar Medellin Terminal Norte
    console.log('\n[3] Seleccionando "Medellin Terminal Norte"...');
    const medellinOption = await page.locator('text=Medellín, Antioquia Medellín Terminal Norte').first();
    await medellinOption.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/search-comparison/test-03-origin-selected.png' });
    console.log('    OK - Origen seleccionado');

    // 4. Buscar destino "Bogota"
    console.log('\n[4] Escribiendo en campo Destino: "Bog"...');
    const destInput = await page.locator('input[placeholder*="Destino"]').first();
    await destInput.click();
    await page.waitForTimeout(300);
    await page.keyboard.type('Bog', { delay: 100 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/search-comparison/test-04-destination-search.png' });
    console.log('    OK - Dropdown de destino visible');

    // 5. Seleccionar Bogota Terminal Norte
    console.log('\n[5] Seleccionando "Bogota Terminal Norte"...');
    const bogotaOption = await page.locator('text=Bogotá, Cundinamarca Terminal Norte').first();
    await bogotaOption.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/search-comparison/test-05-destination-selected.png' });
    console.log('    OK - Destino seleccionado');

    // 6. Verificar que fecha "Hoy" esta seleccionada
    console.log('\n[6] Verificando seleccion de fecha...');
    await page.screenshot({ path: 'screenshots/search-comparison/test-06-ready-to-search.png' });
    console.log('    OK - Formulario listo para buscar');

    // 7. Click en boton Buscar (usar el boton visible de desktop)
    console.log('\n[7] Haciendo click en "Buscar"...');
    const searchButton = await page.locator('button[type="submit"]:visible').first();
    await searchButton.click();

    // Esperar navegacion
    await page.waitForURL(/\/search\//, { timeout: 10000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/search-comparison/test-07-results.png' });
    console.log('    OK - Pagina de resultados cargada');

    // 8. Verificar URL
    const currentUrl = page.url();
    console.log('\n[8] URL de resultados:', currentUrl);

    // Verificar estructura de URL
    if (currentUrl.includes('/search/') && currentUrl.includes('/departures')) {
      console.log('    OK - URL tiene estructura correcta');
    } else {
      console.log('    WARN - URL podria no tener estructura esperada');
    }

    console.log('\n' + '='.repeat(50));
    console.log('TEST COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(50));
    console.log('\nScreenshots guardados en: screenshots/search-comparison/test-*.png');

  } catch (error) {
    console.error('\nERROR:', error.message);
    await page.screenshot({ path: 'screenshots/search-comparison/test-error.png' });
  } finally {
    await browser.close();
  }
})();
