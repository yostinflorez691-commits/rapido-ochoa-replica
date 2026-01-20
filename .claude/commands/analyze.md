---
description: Analiza un sitio web completamente
allowed-tools: WebFetch, Puppeteer, Task, Write
---
Analiza el sitio $ARGUMENTS exhaustivamente.

Lanza estos subagents EN PARALELO:
1. @design-analyzer - Extraer especificaciones de diseño
2. @asset-extractor - Descargar todos los assets

Espera a que terminen y consolida en:
- ANALYSIS.md - Análisis completo
- DESIGN_SYSTEM.md - Design tokens
- docs/assets/ - Assets organizados
