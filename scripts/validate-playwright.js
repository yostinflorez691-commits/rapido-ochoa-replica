/**
 * Validate with Playwright (more robust than Puppeteer)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ORIGINAL_URL = 'https://viajes.rapidoochoa.com.co/';
const REPLICA_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'validation');

// Ensure dirs
['screenshots', 'diffs'].forEach(d => {
  const p = path.join(OUTPUT_DIR, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

async function main() {
  console.log('\n🔄 VALIDACIÓN CON PLAYWRIGHT\n');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    // Mobile
    console.log('📱 MOBILE (375x812)');
    const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await mobileCtx.newPage();

    console.log('  → Capturando original...');
    await mobilePage.goto(ORIGINAL_URL, { timeout: 60000 });
    await mobilePage.waitForTimeout(3000);
    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/orig-mobile.png') });

    console.log('  → Capturando réplica...');
    await mobilePage.goto(REPLICA_URL, { timeout: 30000 });
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/rep-mobile.png') });

    const mobileDiff = await compare('mobile');
    results.push({ name: 'Mobile', diff: mobileDiff });
    console.log(`  → Diferencia: ${mobileDiff.toFixed(2)}%\n`);

    await mobileCtx.close();

    // Desktop
    console.log('🖥️  DESKTOP (1440x900)');
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopCtx.newPage();

    console.log('  → Capturando original...');
    await desktopPage.goto(ORIGINAL_URL, { timeout: 60000 });
    await desktopPage.waitForTimeout(3000);
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/orig-desktop.png') });

    console.log('  → Capturando réplica...');
    await desktopPage.goto(REPLICA_URL, { timeout: 30000 });
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({ path: path.join(OUTPUT_DIR, 'screenshots/rep-desktop.png') });

    const desktopDiff = await compare('desktop');
    results.push({ name: 'Desktop', diff: desktopDiff });
    console.log(`  → Diferencia: ${desktopDiff.toFixed(2)}%\n`);

    await desktopCtx.close();

  } finally {
    await browser.close();
  }

  // Summary
  const avg = results.reduce((s, r) => s + r.diff, 0) / results.length;
  const status = avg < 2 ? '✅ APROBADO' : avg < 5 ? '⚠️ REVISAR' : '❌ RECHAZADO';

  console.log('═'.repeat(50));
  console.log('           RESUMEN POST-CORRECCIONES');
  console.log('═'.repeat(50));
  for (const r of results) {
    const st = r.diff < 2 ? '✅' : r.diff < 5 ? '⚠️' : '❌';
    console.log(`${r.name.padEnd(10)}: ${r.diff.toFixed(2)}% ${st}`);
  }
  console.log('─'.repeat(50));
  console.log(`PROMEDIO  : ${avg.toFixed(2)}% ${status}`);
  console.log('═'.repeat(50));

  // Save report
  const report = `# Validación Post-Correcciones

**Fecha:** ${new Date().toLocaleString('es-CO')}
**Estado:** ${status}

## Resultados

| Viewport | Diferencia | Estado |
|----------|------------|--------|
${results.map(r => `| ${r.name} | ${r.diff.toFixed(2)}% | ${r.diff < 2 ? '✅' : r.diff < 5 ? '⚠️' : '❌'} |`).join('\n')}
| **PROMEDIO** | **${avg.toFixed(2)}%** | **${status}** |

## Correcciones Aplicadas
1. Botón usuario móvil → turquesa #5fbdaa
2. Espaciado card origen/destino → reducido
3. Botón Buscar mobile → rounded-full, verde #1f8641
4. Líneas punteadas swap desktop → eliminadas
5. Header resultados → fondo gris #f8f8f8
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'VALIDATION-REPORT.md'), report);
  console.log(`\nReporte: ${OUTPUT_DIR}/VALIDATION-REPORT.md`);
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
