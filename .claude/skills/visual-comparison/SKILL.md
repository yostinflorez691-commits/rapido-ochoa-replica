---
name: visual-comparison
description: Compara visualmente sitio original vs réplica
allowed-tools: Puppeteer, Playwright, Read, Write, Bash
---
# Visual Comparison Skill

## Proceso
1. Captura screenshots del original en 5 breakpoints:
   - 375px (mobile)
   - 768px (tablet)
   - 1024px (desktop)
   - 1440px (wide)
   - 1920px (ultrawide)

2. Captura screenshots de la réplica en los mismos breakpoints

3. Compara usando pixelmatch:
   - Genera imagen diff
   - Calcula porcentaje de diferencia
   - Identifica áreas problemáticas

4. Genera reporte con:
   - Screenshots lado a lado
   - Porcentaje de match por breakpoint
   - Lista de diferencias específicas
   - Sugerencias de corrección

## Threshold
- < 2% diferencia = APROBADO
- 2-5% diferencia = REVISAR
- > 5% diferencia = RECHAZADO
