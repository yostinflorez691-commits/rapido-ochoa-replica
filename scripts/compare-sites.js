const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ORIGINAL_URL = 'https://viajes.rapidoochoa.com.co/';
const REPLICA_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots');

// Asegurar que existe el directorio
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureScreenshots() {
  console.log('Iniciando comparación de sitios...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Viewport desktop
    const desktopViewport = { width: 1440, height: 900 };
    // Viewport mobile
    const mobileViewport = { width: 375, height: 812 };

    // === CAPTURAS DESKTOP ===
    console.log('📸 Capturando versión DESKTOP...\n');

    // Original Desktop
    const pageOriginal = await browser.newPage();
    await pageOriginal.setViewport(desktopViewport);
    console.log('  → Cargando sitio original...');
    await pageOriginal.goto(ORIGINAL_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await pageOriginal.waitForTimeout(2000);
    await pageOriginal.screenshot({
      path: path.join(OUTPUT_DIR, 'compare-original-desktop.png'),
      fullPage: false
    });
    console.log('  ✅ Captura original desktop guardada');

    // Replica Desktop
    const pageReplica = await browser.newPage();
    await pageReplica.setViewport(desktopViewport);
    console.log('  → Cargando réplica...');
    await pageReplica.goto(REPLICA_URL, { waitUntil: 'networkidle0', timeout: 30000 });
    await pageReplica.waitForTimeout(2000);
    await pageReplica.screenshot({
      path: path.join(OUTPUT_DIR, 'compare-replica-desktop.png'),
      fullPage: false
    });
    console.log('  ✅ Captura réplica desktop guardada\n');

    // === CAPTURAS MOBILE ===
    console.log('📱 Capturando versión MOBILE...\n');

    // Original Mobile
    await pageOriginal.setViewport(mobileViewport);
    await pageOriginal.reload({ waitUntil: 'networkidle0' });
    await pageOriginal.waitForTimeout(2000);
    await pageOriginal.screenshot({
      path: path.join(OUTPUT_DIR, 'compare-original-mobile.png'),
      fullPage: false
    });
    console.log('  ✅ Captura original mobile guardada');

    // Replica Mobile
    await pageReplica.setViewport(mobileViewport);
    await pageReplica.reload({ waitUntil: 'networkidle0' });
    await pageReplica.waitForTimeout(2000);
    await pageReplica.screenshot({
      path: path.join(OUTPUT_DIR, 'compare-replica-mobile.png'),
      fullPage: false
    });
    console.log('  ✅ Captura réplica mobile guardada\n');

    // === CAPTURAR DROPDOWN ===
    console.log('🔽 Capturando DROPDOWN de origen...\n');

    // Volver a desktop
    await pageOriginal.setViewport(desktopViewport);
    await pageOriginal.reload({ waitUntil: 'networkidle0' });
    await pageOriginal.waitForTimeout(1000);

    // Click en campo origen del original
    try {
      await pageOriginal.click('input[placeholder*="origen"], input[placeholder*="Origen"], [data-testid="origin-input"], .origin-input');
      await pageOriginal.waitForTimeout(1500);
      await pageOriginal.screenshot({
        path: path.join(OUTPUT_DIR, 'compare-original-dropdown.png'),
        fullPage: false
      });
      console.log('  ✅ Dropdown original capturado');
    } catch (e) {
      console.log('  ⚠️ No se pudo capturar dropdown original');
    }

    // Dropdown en réplica
    await pageReplica.setViewport(desktopViewport);
    await pageReplica.reload({ waitUntil: 'networkidle0' });
    await pageReplica.waitForTimeout(1000);

    try {
      await pageReplica.click('input[placeholder*="origen"], input[placeholder*="Origen"], #origin-input, .origin-input');
      await pageReplica.waitForTimeout(1500);
      await pageReplica.screenshot({
        path: path.join(OUTPUT_DIR, 'compare-replica-dropdown.png'),
        fullPage: false
      });
      console.log('  ✅ Dropdown réplica capturado\n');
    } catch (e) {
      console.log('  ⚠️ No se pudo capturar dropdown réplica');
    }

    // === CAPTURA FULL PAGE ===
    console.log('📄 Capturando FULL PAGE...\n');

    await pageOriginal.setViewport(desktopViewport);
    await pageOriginal.reload({ waitUntil: 'networkidle0' });
    await pageOriginal.waitForTimeout(1000);
    await pageOriginal.screenshot({
      path: path.join(OUTPUT_DIR, 'compare-original-fullpage.png'),
      fullPage: true
    });
    console.log('  ✅ Full page original capturado');

    await pageReplica.setViewport(desktopViewport);
    await pageReplica.reload({ waitUntil: 'networkidle0' });
    await pageReplica.waitForTimeout(1000);
    await pageReplica.screenshot({
      path: path.join(OUTPUT_DIR, 'compare-replica-fullpage.png'),
      fullPage: true
    });
    console.log('  ✅ Full page réplica capturado\n');

    console.log('═══════════════════════════════════════');
    console.log('✅ COMPARACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════');
    console.log(`\nScreenshots guardados en: ${OUTPUT_DIR}`);
    console.log('\nArchivos generados:');
    console.log('  - compare-original-desktop.png');
    console.log('  - compare-replica-desktop.png');
    console.log('  - compare-original-mobile.png');
    console.log('  - compare-replica-mobile.png');
    console.log('  - compare-original-dropdown.png');
    console.log('  - compare-replica-dropdown.png');
    console.log('  - compare-original-fullpage.png');
    console.log('  - compare-replica-fullpage.png');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
