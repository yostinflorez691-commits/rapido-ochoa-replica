/**
 * Quick Pixel-Perfect Comparison
 * Comparación rápida y robusta
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ORIGINAL_URL = 'https://viajes.rapidoochoa.com.co/';
const REPLICA_URL = 'http://localhost:3000';

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'comparison-results');

// Crear directorios
['screenshots', 'diffs'].forEach(dir => {
  const fullPath = path.join(OUTPUT_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

async function main() {
  console.log('\n🔍 COMPARACIÓN PIXEL-PERFECT\n');
  console.log(`Original: ${ORIGINAL_URL}`);
  console.log(`Réplica:  ${REPLICA_URL}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    protocolTimeout: 120000
  });

  const results = [];

  try {
    // MOBILE
    console.log('📱 MOBILE (375x812)');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 812 });

    console.log('  → Capturando original...');
    await mobilePage.goto(ORIGINAL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 4000));
    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/original-mobile.png') });

    console.log('  → Capturando réplica...');
    await mobilePage.goto(REPLICA_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/replica-mobile.png') });

    const mobileResult = await compare('mobile');
    results.push({ name: 'Mobile', ...mobileResult });
    await mobilePage.close();

    // DESKTOP
    console.log('\n🖥️  DESKTOP (1440x900)');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900 });

    console.log('  → Capturando original...');
    await desktopPage.goto(ORIGINAL_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 4000));
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/original-desktop.png') });

    console.log('  → Capturando réplica...');
    await desktopPage.goto(REPLICA_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/replica-desktop.png') });

    const desktopResult = await compare('desktop');
    results.push({ name: 'Desktop', ...desktopResult });
    await desktopPage.close();

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }

  // Resumen
  console.log('\n' + '═'.repeat(60));
  console.log('                    RESUMEN FINAL');
  console.log('═'.repeat(60) + '\n');

  for (const r of results) {
    const status = r.diff < 2 ? '✅ APROBADO' : r.diff < 5 ? '⚠️ REVISAR' : '❌ RECHAZADO';
    console.log(`${r.name.padEnd(10)} → ${r.diff.toFixed(2)}% diferencia ${status}`);
  }

  const avg = results.reduce((s, r) => s + r.diff, 0) / results.length;
  console.log(`\nPromedio: ${avg.toFixed(2)}%`);

  // Guardar reporte
  const report = generateReport(results);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'QUICK-REPORT.md'), report);
  console.log(`\nReporte: ${OUTPUT_DIR}/QUICK-REPORT.md`);
}

async function compare(name) {
  const { default: pixelmatch } = await import('pixelmatch');

  const origPath = path.join(OUTPUT_DIR, `screenshots/original-${name}.png`);
  const repPath = path.join(OUTPUT_DIR, `screenshots/replica-${name}.png`);
  const diffPath = path.join(OUTPUT_DIR, `diffs/diff-${name}.png`);

  const img1 = PNG.sync.read(fs.readFileSync(origPath));
  const img2 = PNG.sync.read(fs.readFileSync(repPath));

  const width = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);
  const diff = new PNG({ width, height });

  const numDiff = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const total = width * height;
  const pct = (numDiff / total) * 100;

  console.log(`  → Diferencia: ${pct.toFixed(2)}% (${numDiff.toLocaleString()} píxeles)`);

  return { diff: pct, pixels: numDiff, total };
}

function generateReport(results) {
  const avg = results.reduce((s, r) => s + r.diff, 0) / results.length;
  const status = avg < 2 ? '✅ APROBADO' : avg < 5 ? '⚠️ REVISAR' : '❌ RECHAZADO';

  return `# Reporte Comparación Pixel-Perfect

**Fecha:** ${new Date().toLocaleString('es-CO')}
**Estado General:** ${status}
**Diferencia Promedio:** ${avg.toFixed(2)}%

## Resultados

| Viewport | Diferencia | Píxeles Diferentes | Estado |
|----------|------------|-------------------|--------|
${results.map(r => {
  const st = r.diff < 2 ? '✅' : r.diff < 5 ? '⚠️' : '❌';
  return `| ${r.name} | ${r.diff.toFixed(2)}% | ${r.pixels.toLocaleString()} | ${st} |`;
}).join('\n')}

## Criterios
- < 2% = ✅ APROBADO
- 2-5% = ⚠️ REVISAR
- > 5% = ❌ RECHAZADO

## Archivos
- \`screenshots/original-mobile.png\`
- \`screenshots/replica-mobile.png\`
- \`screenshots/original-desktop.png\`
- \`screenshots/replica-desktop.png\`
- \`diffs/diff-mobile.png\`
- \`diffs/diff-desktop.png\`

## Siguiente Paso
Revisar las imágenes diff para identificar áreas específicas a corregir.
`;
}

main().catch(console.error);
