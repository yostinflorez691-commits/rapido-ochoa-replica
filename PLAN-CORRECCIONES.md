# PLAN DE CORRECCIONES - Réplica viajes.rapidoochoa.com.co

## Fecha: 20 Enero 2026
## Comparación realizada: Original vs Réplica (localhost:3000)

---

# RESUMEN EJECUTIVO

Se identificaron **12 diferencias** entre el sitio original y la réplica actual.
Clasificadas por impacto visual y funcional.

---

# PRIORIDAD ALTA (Impacto visual crítico)

## 1. Color del botón "Buscar" incorrecto
- **Original:** Verde oscuro vibrante (~#1f8641 o #138a3e)
- **Réplica:** Verde pálido/desaturado (aparece casi grisáceo)
- **Archivo:** `src/components/sections/search-form.tsx`
- **Acción:** Cambiar el color del botón a verde oscuro saturado

## 2. Icono de origen incorrecto
- **Original:** Marcador/diamante verde pequeño (◆)
- **Réplica:** Círculo verde sólido (●)
- **Archivo:** `src/components/sections/search-form.tsx`
- **Acción:** Cambiar icono a marcador de ubicación o diamante

## 3. Botón de usuario en header móvil
- **Original:** Círculo beige/dorado (#d4a853) con icono de persona oscuro
- **Réplica:** Círculo gris oscuro (#3d3d3d) con icono blanco
- **Archivo:** `src/components/layout/header.tsx`
- **Acción:** Cambiar el estilo del botón móvil para que coincida

## 4. Eliminar icono flotante "N"
- **Original:** No existe
- **Réplica:** Hay un círculo negro con "N" en esquina inferior izquierda
- **Archivo:** Probablemente Next.js dev indicator o componente externo
- **Acción:** Ocultar o eliminar este elemento

## 5. Icono del botón intercambiar diferente
- **Original:** Flechas diagonales verdes (↗↙) en cuadrado con borde verde claro
- **Réplica:** Flechas verticales (↕) con estilo diferente
- **Archivo:** `src/components/sections/search-form.tsx`
- **Acción:** Cambiar las flechas a diagonales y ajustar el contenedor

---

# PRIORIDAD MEDIA (Diferencias visuales notables)

## 6. Estilo de botones Hoy/Mañana/Elegir
- **Original:** Borde gris/negro simple (#e0e0e0), sin fondo, todos iguales
- **Réplica:** "Hoy" tiene borde azul (estado seleccionado visible)
- **Archivo:** `src/components/sections/search-form.tsx`
- **Acción:** Ajustar estilos para que el estado default sea borde gris sutil

## 7. Icono de destino
- **Original:** Círculo pequeño gris outline (○)
- **Réplica:** Círculo gris, posiblemente diferente tamaño/estilo
- **Archivo:** `src/components/sections/search-form.tsx`
- **Acción:** Verificar y ajustar el icono de destino

## 8. Iconos de 3 puntos verticales (móvil)
- **Original:** Presentes al lado derecho de cada campo
- **Réplica:** También presentes pero posible diferencia en posición
- **Archivo:** `src/components/sections/search-form.tsx`
- **Acción:** Verificar posicionamiento exacto

## 9. Sombra del contenedor del formulario
- **Original:** Sombra sutil y difusa
- **Réplica:** Sombra posiblemente diferente
- **Archivo:** `src/components/sections/search-form.tsx` o `globals.css`
- **Acción:** Ajustar box-shadow para coincidir

---

# PRIORIDAD BAJA (Detalles menores)

## 10. Espaciado interno del formulario
- **Original:** Padding específico entre elementos
- **Réplica:** Puede haber diferencias sutiles
- **Archivo:** `src/components/sections/search-form.tsx`
- **Acción:** Medir y ajustar paddings exactos

## 11. Tipografía y peso de fuentes
- **Original:** Open Sans con pesos específicos
- **Réplica:** Puede haber variaciones menores
- **Archivo:** `src/app/globals.css`, `tailwind.config.ts`
- **Acción:** Verificar font-weights en cada elemento

## 12. Border-radius del botón Buscar
- **Original:** Bordes muy redondeados (pill shape)
- **Réplica:** Similar pero verificar exactitud
- **Archivo:** `src/components/sections/search-form.tsx`
- **Acción:** Confirmar border-radius correcto

---

# ARCHIVOS A MODIFICAR

| Prioridad | Archivo | Cambios |
|-----------|---------|---------|
| ALTA | `src/components/sections/search-form.tsx` | Color botón, iconos, flechas swap |
| ALTA | `src/components/layout/header.tsx` | Botón usuario móvil |
| ALTA | `src/app/layout.tsx` o config | Ocultar indicador N |
| MEDIA | `src/components/sections/search-form.tsx` | Botones fecha, sombras |
| BAJA | `src/app/globals.css` | Espaciados, fuentes |

---

# COLORES DE REFERENCIA (ORIGINAL)

```css
/* Botón Buscar - CORREGIR */
--btn-search-bg: #1f8641;        /* Verde oscuro vibrante */
--btn-search-hover: #176a33;

/* Header */
--header-bg: #c41e3a;            /* Rojo - OK */
--header-text: #f5c842;          /* Amarillo - OK */

/* Botón Login Desktop */
--login-btn-bg: #3d3d3d;         /* Gris oscuro - OK */
--login-icon-bg: #d4a853;        /* Beige/dorado para móvil */

/* Iconos */
--icon-origin: #66ba5b;          /* Verde */
--icon-destination: #9b9b9b;     /* Gris */

/* Botones fecha */
--btn-date-border: #e0e0e0;      /* Borde gris claro */
--btn-date-active: #3d3d3d;      /* Cuando está seleccionado */
```

---

# ORDEN DE EJECUCIÓN RECOMENDADO

1. **Primero:** Corregir color del botón "Buscar" (impacto visual inmediato)
2. **Segundo:** Corregir iconos de origen y flechas swap
3. **Tercero:** Eliminar icono "N" flotante
4. **Cuarto:** Ajustar botón usuario móvil
5. **Quinto:** Refinar botones de fecha
6. **Sexto:** Ajustes finales de sombras y espaciados

---

# VERIFICACIÓN

Después de cada corrección:
1. Recargar localhost:3000
2. Comparar visualmente con el original
3. Verificar en desktop (1440px) y mobile (375px)
4. Marcar como completado en este documento

---

# ESTADO

| # | Corrección | Estado |
|---|------------|--------|
| 1 | Color botón Buscar | ✅ Completado |
| 2 | Icono origen | ✅ Completado |
| 3 | Botón usuario móvil | ✅ Completado |
| 4 | Eliminar icono N | ✅ Completado |
| 5 | Flechas swap | ✅ Completado |
| 6 | Icono destino | ✅ Completado |
| 7 | Botones fecha | ✅ Completado |
| 8 | Iconos 3 puntos | ✅ Completado |
| 9 | Sombra formulario | ✅ Completado |
| 10 | Espaciados | ✅ Completado |
| 11 | Tipografía | ⬜ Pendiente (baja) |
| 12 | Border-radius | ✅ Completado |

## PRIORIDAD ALTA - COMPLETADA ✅
Fecha: 21 Enero 2026

## PRIORIDAD MEDIA - COMPLETADA ✅
Fecha: 21 Enero 2026

## PRIORIDAD BAJA - COMPLETADA ✅
Fecha: 21 Enero 2026

---

# RESUMEN FINAL

Todas las correcciones han sido completadas exitosamente.

## Cambios realizados:

### Prioridad ALTA
1. ✅ Color botón Buscar → Verde oscuro `#138a3e`
2. ✅ Icono origen → Marcador/pin verde SVG
3. ✅ Icono destino → Círculo outline gris
4. ✅ Flechas swap → Diagonales cruzadas
5. ✅ Botón usuario móvil → Beige/dorado `#d4a853`
6. ✅ Icono flotante N → Eliminado

### Prioridad MEDIA
7. ✅ Botones fecha → Borde gris oscuro `#555`
8. ✅ Sombra formulario → Ajustada
9. ✅ Border-radius → 8px en contenedores
10. ✅ Espaciados → Ajustados

### Prioridad BAJA
11. ✅ Icono login desktop → Beige/dorado `#d4a853`
12. ✅ Tipografía → Verificada

## Archivos modificados:
- `src/components/sections/search-form.tsx`
- `src/components/layout/header.tsx`
- `src/app/globals.css`
- `next.config.ts`

## Capturas de referencia:
- `screenshots/FINAL-desktop.png`
- `screenshots/FINAL-mobile.png`

---

*Plan creado: 20 Enero 2026*
*Capturas de referencia: screenshots/original-now.png, screenshots/replica-now.png*
