---
description: Valida calidad del código y diseño
allowed-tools: Bash, Read, Puppeteer
---
Ejecuta validación completa:

1. Build check: npm run build
2. Type check: npx tsc --noEmit
3. Lint check: npm run lint
4. Visual comparison: /compare $ARGUMENTS
5. Lighthouse audit
6. Accessibility check

Genera reporte con resultados y sugerencias.
