const { chromium } = require('playwright');

(async () => {
  console.log('Capturando detalles del formulario de busqueda...\n');

  const browser = await chromium.launch({ headless: true });
  const viewport = { width: 1400, height: 900 };

  try {
    // =============================================
    // CAPTURAR SITIO ORIGINAL
    // =============================================
    console.log('[ORIGINAL] Capturando viajes.rapidoochoa.com.co...');
    const originalPage = await browser.newPage({ viewport });

    await originalPage.goto('https://viajes.rapidoochoa.com.co', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await originalPage.waitForTimeout(3000);

    // Pagina completa
    await originalPage.screenshot({
      path: 'screenshots/search-comparison/original-home.png',
      fullPage: false
    });
    console.log('  + original-home.png');

    // Click en origen y escribir
    const originInput = await originalPage.locator('input').first();
    await originInput.click();
    await originalPage.waitForTimeout(500);
    await originalPage.keyboard.type('Med', { delay: 100 });
    await originalPage.waitForTimeout(1500);

    await originalPage.screenshot({
      path: 'screenshots/search-comparison/original-dropdown.png',
      fullPage: false
    });
    console.log('  + original-dropdown.png');

    // Extraer estilos del formulario
    const styles = await originalPage.evaluate(() => {
      const form = document.querySelector('form');
      const inputs = document.querySelectorAll('input');
      const buttons = document.querySelectorAll('button');

      const getComputedStyles = (el) => {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
          backgroundColor: cs.backgroundColor,
          borderRadius: cs.borderRadius,
          border: cs.border,
          boxShadow: cs.boxShadow,
          padding: cs.padding,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          color: cs.color,
          height: cs.height,
          width: cs.width
        };
      };

      return {
        formStyles: form ? getComputedStyles(form) : null,
        inputCount: inputs.length,
        inputStyles: inputs.length > 0 ? getComputedStyles(inputs[0]) : null,
        buttonCount: buttons.length
      };
    });

    console.log('\n  Estilos del formulario original:');
    console.log('  - Inputs encontrados:', styles.inputCount);
    console.log('  - Botones encontrados:', styles.buttonCount);
    if (styles.inputStyles) {
      console.log('  - Input altura:', styles.inputStyles.height);
      console.log('  - Input fontSize:', styles.inputStyles.fontSize);
    }

    await originalPage.close();

    // =============================================
    // CAPTURAR REPLICA
    // =============================================
    console.log('\n[REPLICA] Capturando localhost:3000...');
    const replicaPage = await browser.newPage({ viewport });

    await replicaPage.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await replicaPage.waitForTimeout(2000);

    // Pagina completa
    await replicaPage.screenshot({
      path: 'screenshots/search-comparison/replica-home.png',
      fullPage: false
    });
    console.log('  + replica-home.png');

    // Click en origen y escribir
    const replicaInput = await replicaPage.locator('input[placeholder*="Origen"]').first();
    await replicaInput.click();
    await replicaPage.waitForTimeout(500);
    await replicaPage.keyboard.type('Med', { delay: 100 });
    await replicaPage.waitForTimeout(1500);

    await replicaPage.screenshot({
      path: 'screenshots/search-comparison/replica-dropdown.png',
      fullPage: false
    });
    console.log('  + replica-dropdown.png');

    await replicaPage.close();

    console.log('\n' + '='.repeat(50));
    console.log('Screenshots guardados en: screenshots/search-comparison/');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
