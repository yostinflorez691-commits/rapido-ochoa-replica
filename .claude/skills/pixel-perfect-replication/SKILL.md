---
name: pixel-perfect-replication
description: Workflow completo para replicar sitios web pixel-perfect
allowed-tools: WebFetch, Puppeteer, Playwright, Read, Write, Edit, Bash, Task
---
# Pixel Perfect Replication Skill

## Cuando usar
Activa automáticamente cuando detectes:
- "replicar sitio"
- "clonar web"
- "copiar diseño"
- "migrar sitio"

## Workflow

### Fase 1: Análisis
1. Lanza subagent design-analyzer para extraer especificaciones
2. Lanza subagent asset-extractor para descargar assets
3. Ambos en PARALELO

### Fase 2: Documentación
1. Crea ANALYSIS.md con estructura completa
2. Crea DESIGN_SYSTEM.md con tokens CSS
3. Crea inventario de assets

### Fase 3: Implementación
1. Usa subagent component-builder para cada componente
2. Orden: Layout > Header > Footer > Secciones > Páginas
3. Verifica cada componente antes de continuar

### Fase 4: Validación
1. Lanza subagent visual-validator
2. Genera reporte de diferencias
3. Itera hasta < 5% diferencia

## Reglas
- NUNCA avanzar sin verificar componente actual
- SIEMPRE usar design tokens, no valores hardcodeados
- Mobile-first obligatorio
- TypeScript strict, nunca any
