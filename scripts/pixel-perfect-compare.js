/**
 * Pixel-Perfect Comparison Script
 * Compara el sitio original vs la réplica en múltiples breakpoints
 * Genera reporte detallado con porcentajes de diferencia
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// pixelmatch es ESM, usar import dinámico
let pixelmatch;
async function loadPixelmatch() {
  if (!pixelmatch) {
    const module = await import('pixelmatch');
    pixelmatch = module.default;
  }
  return pixelmatch;
}

const ORIGINAL_URL = 'https://viajes.rapidoochoa.com.co/';
const REPLICA_URL = 'http://localhost:3000';

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
  { name: 'wide', width: 1440, height: 900 },
  { name: 'ultrawide', width: 1920, height: 1080 },
];

const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'comparison-results');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');
const DIFFS_DIR = path.join(OUTPUT_DIR, 'diffs');

// Crear directorios
[OUTPUT_DIR, SCREENSHOTS_DIR, DIFFS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function captureScreenshot(page, url, breakpoint, prefix) {
  await page.setViewport({
    width: breakpoint.width,
    height: breakpoint.height,
    deviceScaleFactor: 1
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000)); // Esperar carga completa
  } catch (err) {
    console.log(`  ⚠ Timeout en ${url}, intentando continuar...`);
    await new Promise(r => setTimeout(r, 2000));
  }

  const filename = `${prefix}-${breakpoint.name}-${breakpoint.width}x${breakpoint.height}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);

  await page.screenshot({
    path: filepath,
    fullPage: false,
    type: 'png'
  });

  console.log(`  ✓ Captured: ${filename}`);
  return filepath;
}

async function compareImages(img1Path, img2Path, diffPath) {
  const pm = await loadPixelmatch();

  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));

  // Ajustar tamaños si son diferentes
  const width = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);

  const diff = new PNG({ width, height });

  const numDiffPixels = pm(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const totalPixels = width * height;
  const diffPercentage = ((numDiffPixels / totalPixels) * 100).toFixed(2);

  return {
    diffPixels: numDiffPixels,
    totalPixels,
    diffPercentage: parseFloat(diffPercentage),
    width,
    height
  };
}

async function runComparison() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('           PIXEL-PERFECT COMPARISON REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Original: ${ORIGINAL_URL}`);
  console.log(`Réplica:  ${REPLICA_URL}`);
  console.log(`Fecha:    ${new Date().toLocaleString('es-CO')}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  try {
    const page = await browser.newPage();

    for (const breakpoint of BREAKPOINTS) {
      console.log(`\n▶ Breakpoint: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
      console.log('─'.repeat(50));

      // Capturar original
      console.log('  Capturando original...');
      const originalPath = await captureScreenshot(page, ORIGINAL_URL, breakpoint, 'original');

      // Capturar réplica
      console.log('  Capturando réplica...');
      const replicaPath = await captureScreenshot(page, REPLICA_URL, breakpoint, 'replica');

      // Comparar
      console.log('  Comparando...');
      const diffFilename = `diff-${breakpoint.name}.png`;
      const diffPath = path.join(DIFFS_DIR, diffFilename);

      const comparison = await compareImages(originalPath, replicaPath, diffPath);

      // Determinar estado
      let status;
      if (comparison.diffPercentage < 2) {
        status = '✅ APROBADO';
      } else if (comparison.diffPercentage < 5) {
        status = '⚠️ REVISAR';
      } else {
        status = '❌ RECHAZADO';
      }

      results.push({
        breakpoint: breakpoint.name,
        width: breakpoint.width,
        height: breakpoint.height,
        ...comparison,
        status,
        diffImage: diffFilename
      });

      console.log(`  Resultado: ${comparison.diffPercentage}% diferencia ${status}`);
    }

  } finally {
    await browser.close();
  }

  // Generar reporte
  generateReport(results);

  return results;
}

function generateReport(results) {
  const reportPath = path.join(OUTPUT_DIR, 'COMPARISON-REPORT.md');

  const totalDiff = results.reduce((sum, r) => sum + r.diffPercentage, 0) / results.length;
  const overallStatus = totalDiff < 2 ? '✅ APROBADO' : totalDiff < 5 ? '⚠️ REVISAR' : '❌ RECHAZADO';

  let report = `# Reporte de Comparación Pixel-Perfect

**Fecha:** ${new Date().toLocaleString('es-CO')}
**Original:** ${ORIGINAL_URL}
**Réplica:** ${REPLICA_URL}

## Resumen General

| Métrica | Valor |
|---------|-------|
| **Diferencia Promedio** | ${totalDiff.toFixed(2)}% |
| **Estado General** | ${overallStatus} |
| **Breakpoints Analizados** | ${results.length} |

## Resultados por Breakpoint

| Breakpoint | Resolución | Diferencia | Estado |
|------------|------------|------------|--------|
`;

  for (const r of results) {
    report += `| ${r.breakpoint} | ${r.width}x${r.height} | ${r.diffPercentage}% | ${r.status} |\n`;
  }

  report += `
## Criterios de Evaluación

- **< 2% diferencia** = ✅ APROBADO
- **2-5% diferencia** = ⚠️ REVISAR
- **> 5% diferencia** = ❌ RECHAZADO

## Archivos Generados

### Screenshots
`;

  for (const r of results) {
    report += `- \`screenshots/original-${r.breakpoint}-${r.width}x${r.height}.png\`\n`;
    report += `- \`screenshots/replica-${r.breakpoint}-${r.width}x${r.height}.png\`\n`;
  }

  report += `
### Imágenes de Diferencias
`;

  for (const r of results) {
    report += `- \`diffs/${r.diffImage}\` (${r.diffPercentage}% diff)\n`;
  }

  report += `
## Áreas Problemáticas Identificadas

`;

  const problematic = results.filter(r => r.diffPercentage >= 2);
  if (problematic.length === 0) {
    report += `No se identificaron áreas problemáticas significativas.\n`;
  } else {
    for (const r of problematic) {
      report += `### ${r.breakpoint} (${r.diffPercentage}% diferencia)
- Revisar imagen de diferencias: \`diffs/${r.diffImage}\`
- Resolución: ${r.width}x${r.height}
- Píxeles diferentes: ${r.diffPixels.toLocaleString()} de ${r.totalPixels.toLocaleString()}

`;
    }
  }

  report += `
---
*Generado automáticamente por pixel-perfect-compare.js*
`;

  fs.writeFileSync(reportPath, report);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('                    RESUMEN FINAL');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(`Diferencia promedio: ${totalDiff.toFixed(2)}%`);
  console.log(`Estado general: ${overallStatus}`);
  console.log(`\nReporte guardado en: ${reportPath}`);
  console.log(`Screenshots en: ${SCREENSHOTS_DIR}`);
  console.log(`Diffs en: ${DIFFS_DIR}\n`);
}

// Ejecutar
runComparison().catch(console.error);
