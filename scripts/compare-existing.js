/**
 * Compare existing screenshots with pixelmatch
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs', 'comparison-results');

// Crear directorio de salida
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(path.join(OUTPUT_DIR, 'diffs'))) {
  fs.mkdirSync(path.join(OUTPUT_DIR, 'diffs'), { recursive: true });
}

// Pares de imágenes a comparar
const COMPARISONS = [
  { name: 'Mobile Home', orig: 'compare-original.png', rep: 'compare-replica.png' },
  { name: 'Desktop Home', orig: 'original-full-desktop.png', rep: 'final-home.png' },
  { name: 'Desktop Dropdown', orig: 'original-dropdown-origin.png', rep: 'replica-origin-dropdown.png' },
  { name: 'Results Page', orig: 'detail-orig-results.png', rep: 'detail-rep-results.png' },
];

async function main() {
  const { default: pixelmatch } = await import('pixelmatch');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('           COMPARACIÓN PIXEL-PERFECT (CAPTURAS EXISTENTES)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const results = [];

  for (const comp of COMPARISONS) {
    const origPath = path.join(SCREENSHOTS_DIR, comp.orig);
    const repPath = path.join(SCREENSHOTS_DIR, comp.rep);

    if (!fs.existsSync(origPath)) {
      console.log(`⚠ No encontrado: ${comp.orig}`);
      continue;
    }
    if (!fs.existsSync(repPath)) {
      console.log(`⚠ No encontrado: ${comp.rep}`);
      continue;
    }

    console.log(`▶ ${comp.name}`);
    console.log(`  Original: ${comp.orig}`);
    console.log(`  Réplica:  ${comp.rep}`);

    try {
      const img1 = PNG.sync.read(fs.readFileSync(origPath));
      const img2 = PNG.sync.read(fs.readFileSync(repPath));

      const width = Math.min(img1.width, img2.width);
      const height = Math.min(img1.height, img2.height);

      console.log(`  Dimensiones: ${width}x${height}`);

      const diff = new PNG({ width, height });

      const numDiff = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        width,
        height,
        { threshold: 0.1 }
      );

      const total = width * height;
      const pct = (numDiff / total) * 100;

      // Guardar diff
      const diffName = `diff-${comp.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      fs.writeFileSync(path.join(OUTPUT_DIR, 'diffs', diffName), PNG.sync.write(diff));

      const status = pct < 2 ? '✅ APROBADO' : pct < 5 ? '⚠️ REVISAR' : '❌ RECHAZADO';
      console.log(`  Diferencia: ${pct.toFixed(2)}% ${status}`);
      console.log(`  Diff guardado: diffs/${diffName}\n`);

      results.push({
        name: comp.name,
        diff: pct,
        pixels: numDiff,
        total,
        status,
        diffFile: diffName
      });
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}\n`);
    }
  }

  // Resumen
  if (results.length > 0) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                         RESUMEN');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('| Comparación | Diferencia | Estado |');
    console.log('|-------------|------------|--------|');
    for (const r of results) {
      console.log(`| ${r.name.padEnd(15)} | ${r.diff.toFixed(2).padStart(8)}% | ${r.status} |`);
    }

    const avg = results.reduce((s, r) => s + r.diff, 0) / results.length;
    const overall = avg < 2 ? '✅ APROBADO' : avg < 5 ? '⚠️ REVISAR' : '❌ RECHAZADO';

    console.log(`\nPromedio: ${avg.toFixed(2)}% ${overall}`);

    // Generar reporte markdown
    const report = `# Reporte de Comparación Pixel-Perfect

**Fecha:** ${new Date().toLocaleString('es-CO')}
**Estado General:** ${overall}
**Diferencia Promedio:** ${avg.toFixed(2)}%

## Resultados Detallados

| Componente | Diferencia | Píxeles Diff | Estado |
|------------|------------|--------------|--------|
${results.map(r => `| ${r.name} | ${r.diff.toFixed(2)}% | ${r.pixels.toLocaleString()} | ${r.status} |`).join('\n')}

## Criterios
- < 2% = ✅ APROBADO
- 2-5% = ⚠️ REVISAR
- > 5% = ❌ RECHAZADO

## Áreas Problemáticas

${results.filter(r => r.diff >= 5).map(r => `
### ${r.name} (${r.diff.toFixed(2)}% diferencia)
- Ver imagen diff: \`diffs/${r.diffFile}\`
- Píxeles diferentes: ${r.pixels.toLocaleString()} de ${r.total.toLocaleString()}
`).join('\n')}

## Próximos Pasos
1. Revisar imágenes diff para identificar diferencias específicas
2. Corregir estilos según el análisis
3. Regenerar capturas y re-comparar
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'COMPARISON-REPORT.md'), report);
    console.log(`\nReporte guardado: ${OUTPUT_DIR}/COMPARISON-REPORT.md`);
  }
}

main().catch(console.error);
