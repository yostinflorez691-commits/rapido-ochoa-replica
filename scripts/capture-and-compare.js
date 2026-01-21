/**
 * Capture fresh screenshots and compare
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ORIGINAL_URL = 'https://viajes.rapidoochoa.com.co/';
const REPLICA_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'validation');

// Ensure dirs exist
['screenshots', 'diffs'].forEach(dir => {
  const p = path.join(OUTPUT_DIR, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

async function main() {
  console.log('\n🔄 VALIDACIÓN POST-CORRECCIONES\n');
  console.log(`Fecha: ${new Date().toLocaleString('es-CO')}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
    protocolTimeout: 120000
  });

  try {
    // Mobile
    console.log('📱 MOBILE (375x812)...');
    const mobile = await browser.newPage();
    await mobile.setViewport({ width: 375, height: 812 });

    await mobile.goto(ORIGINAL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4000);
    await mobile.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/orig-mobile.png') });
    console.log('  ✓ Original capturado');

    await mobile.goto(REPLICA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    await mobile.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/rep-mobile.png') });
    console.log('  ✓ Réplica capturada');

    const mobileResult = await compare('mobile');
    console.log(`  → Diferencia: ${mobileResult.toFixed(2)}%\n`);

    await mobile.close();

    // Desktop
    console.log('🖥️  DESKTOP (1440x900)...');
    const desktop = await browser.newPage();
    await desktop.setViewport({ width: 1440, height: 900 });

    await desktop.goto(ORIGINAL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4000);
    await desktop.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/orig-desktop.png') });
    console.log('  ✓ Original capturado');

    await desktop.goto(REPLICA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    await desktop.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/rep-desktop.png') });
    console.log('  ✓ Réplica capturada');

    const desktopResult = await compare('desktop');
    console.log(`  → Diferencia: ${desktopResult.toFixed(2)}%\n`);

    await desktop.close();

    // Summary
    const avg = (mobileResult + desktopResult) / 2;
    const status = avg < 2 ? '✅ APROBADO' : avg < 5 ? '⚠️ REVISAR' : '❌ RECHAZADO';

    console.log('═'.repeat(50));
    console.log('RESUMEN POST-CORRECCIONES');
    console.log('═'.repeat(50));
    console.log(`Mobile:  ${mobileResult.toFixed(2)}%`);
    console.log(`Desktop: ${desktopResult.toFixed(2)}%`);
    console.log(`Promedio: ${avg.toFixed(2)}% ${status}`);
    console.log('═'.repeat(50));

  } finally {
    await browser.close();
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function compare(name) {
  const { default: pixelmatch } = await import('pixelmatch');

  const orig = PNG.sync.read(fs.readFileSync(path.join(OUTPUT_DIR, `screenshots/orig-${name}.png`)));
  const rep = PNG.sync.read(fs.readFileSync(path.join(OUTPUT_DIR, `screenshots/rep-${name}.png`)));

  const w = Math.min(orig.width, rep.width);
  const h = Math.min(orig.height, rep.height);
  const diff = new PNG({ width: w, height: h });

  const numDiff = pixelmatch(orig.data, rep.data, diff.data, w, h, { threshold: 0.1 });
  fs.writeFileSync(path.join(OUTPUT_DIR, `diffs/diff-${name}.png`), PNG.sync.write(diff));

  return (numDiff / (w * h)) * 100;
}

main().catch(console.error);
