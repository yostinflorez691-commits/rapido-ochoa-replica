# LISTADO COMPLETO DE DIFERENCIAS - Original vs Réplica

**Fecha de análisis:** 20 Enero 2026
**Sitio original:** https://viajes.rapidoochoa.com.co
**Réplica:** http://localhost:3000

---

## RESUMEN EJECUTIVO

| Categoría | Diferencias Críticas | Diferencias Menores |
|-----------|---------------------|---------------------|
| Header | 3 | 2 |
| Formulario búsqueda | 5 | 3 |
| Página resultados | 4 | 6 |
| Tarjetas de viaje | 2 | 4 |
| Versión móvil | 8 | 5 |
| **TOTAL** | **22** | **20** |

---

## 1. HEADER (BARRA SUPERIOR)

### 1.1 Logo Principal
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Tipo | Imagen PNG con bus y texto estilizado | Texto + icono de bus genérico | **CAMBIAR**: Usar imagen `/images/logo.png` |
| Eslogan | "Transportamos tus ilusiones" en amarillo debajo | Texto separado al lado | **AJUSTAR** posición |
| Fondo logo | Transparente sobre rojo | Cuadro blanco con borde | **QUITAR** el fondo blanco |

### 1.2 Mensaje de Bienvenida
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Color | Amarillo (#f5c842) itálica | Blanco en home, amarillo en results | **UNIFICAR** a amarillo itálica |
| Posición | Centrado o después del logo | Variable | **FIJAR** posición |

### 1.3 Botón Iniciar Sesión
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Icono usuario | Círculo amarillo con silueta | Similar pero diferente tono | **AJUSTAR** color a #d4a855 |
| Fondo botón | Gris oscuro (#3d3d3d) | Similar | OK |
| Border radius | Completamente redondo | Completamente redondo | OK |

---

## 2. FORMULARIO DE BÚSQUEDA (HOME)

### 2.1 Campos de Origen/Destino
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Icono origen | Pin de ubicación verde relleno | Círculo verde lleno | **CAMBIAR** a icono MapPin filled |
| Icono destino | Pin de ubicación gris | Círculo con borde | **CAMBIAR** a icono MapPin outline |
| Placeholder | "Buscar Origen" / "Buscar Destino" | Similar | OK |
| Tres puntos | Tiene menú de 3 puntos verticales | No tiene | **AGREGAR** menú contextual |

### 2.2 Botón Intercambiar
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Icono | Flechas horizontales verdes | Flechas arriba/abajo | **CAMBIAR** a flechas horizontales |
| Fondo | Blanco con borde | Verde claro | **AJUSTAR** estilo |
| Posición desktop | Entre origen y destino horizontalmente | Similar | OK |
| Posición móvil | Al lado derecho, centrado verticalmente | En medio | **AJUSTAR** posición móvil |

### 2.3 Selector de Fecha
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Título | "¿Cuándo viajas?" | "¿Cuándo viajas?" | OK |
| Botones | Hoy, Mañana, Elegir (con calendario) | Similar | OK |
| Estilo botones | Borde gris, hover verde | Borde verde siempre | **AJUSTAR** a borde gris por defecto |
| Badge error | Punto rojo de validación | No tiene | **AGREGAR** indicador de error |

### 2.4 Botón Buscar
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Color | Verde (#4a9c4e) | Verde (#4a9c4e) | OK |
| Icono | Lupa blanca | Lupa blanca | OK |
| Tamaño | Grande, redondeado | Similar | OK |

---

## 3. PÁGINA DE RESULTADOS - HEADER

### 3.1 Search Bar en Resultados
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Fondo | Rojo con campos blancos | Similar | OK |
| Campos visibles | Origen, destino, fecha, opcional | Similar | OK |
| Botón X para limpiar | Tiene en cada campo | Tiene | OK |
| Campo "Opcional" | Dropdown con flecha abajo | Similar | OK |

### 3.2 Filtros de Tiempo
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| "Personalizar búsqueda" | Verde con icono sliders + badge rojo "0" | Similar | OK |
| Botones Mañana/Tarde/Noche | Borde gris, selección con borde negro | Similar | OK |
| Posición | Derecha del título | Derecha del título | OK |

---

## 4. PÁGINA DE RESULTADOS - CONTENIDO

### 4.1 Sección "Viajes Recomendados"
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Título | "Viajes recomendados" | "Viajes recomendados" | OK |
| Badge "PARA TI" | Rojo con texto blanco | Rojo con texto blanco | OK |
| Estrellas decorativas | Amarillas al lado | Estrella amarilla | OK |

### 4.2 Tarjetas de Viaje
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| **Logo REY DORADO** | Imagen con "Lo Máximo!" banner amarillo encima | Texto con banner dorado | **MEJORAR** diseño del logo |
| Checkmark | Verde al lado del logo | Checkmark SVG verde | OK |
| Badge "Popular" | NO visible en original (puede ser scroll) | Naranja con "Popular" | **VERIFICAR** si original lo tiene |
| Icono sol/luna | Simple, sin fondo | Con fondo circular | **Réplica está MEJOR** |
| Terminales | "Medellín Terminal Norte" | Muestra correctamente | OK |
| "Ver detalles" | Verde subrayado | Verde subrayado | OK |
| Duración | "11 horas" | "11 horas" | OK |
| Precio | "$ 115.000 COP" en negro | Similar | OK |
| Botón "Ver sillas" | Borde rojo, texto rojo, fondo blanco | Variable (rojo/borde) | **UNIFICAR** estilo |

### 4.3 Navegador de Fechas
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Flechas | Círculos con < > | Círculos con < > | OK |
| Fechas | 3 columnas con precios | 3 columnas con precios | OK |
| Fecha activa | Fondo verde claro | Fondo verde claro | OK |
| Precios | "Desde: $ 115.000 COP" | Similar pero en rojo | **AJUSTAR** color a negro |

### 4.4 Footer
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| "Powered by Reserhub" | Logo estilizado | Texto simple | **MEJORAR** logo Reserhub |
| "Mostrando todos los viajes" | Itálica gris abajo | NO TIENE | **AGREGAR** texto |

---

## 5. VERSIÓN MÓVIL - CRÍTICO

### 5.1 Header Móvil
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Logo | Imagen pequeña centrada | Texto con icono | **USAR** imagen logo |
| Botón usuario | Círculo amarillo a la derecha | Similar | OK |
| Hamburger menu | No visible | No tiene | OK |

### 5.2 Formulario Móvil
| Aspecto | Original | Réplica | Acción |
|---------|----------|---------|--------|
| Layout | Vertical, campos apilados | Vertical, campos apilados | OK |
| Botón intercambio | Al lado derecho, entre campos | En el medio | **AJUSTAR** posición |
| Menú 3 puntos | Tiene en cada campo | No tiene | **AGREGAR** |

### 5.3 Resultados Móvil - CORREGIDO
| Aspecto | Original | Réplica | Estado |
|---------|----------|---------|--------|
| **Layout general** | Diseño móvil específico | Diseño móvil específico | OK - CORREGIDO |
| Header | "Cambiar búsqueda" botón rojo | "Cambiar búsqueda" + flecha atrás | OK - CORREGIDO |
| Tarjetas | Diseño compacto vertical | Diseño compacto vertical | OK - CORREGIDO |
| Filtros | Scroll horizontal | Scroll horizontal | OK - CORREGIDO |

### 5.4 Tarjetas Móvil - CORREGIDO
| Aspecto | Original | Réplica | Estado |
|---------|----------|---------|--------|
| Diseño | Vertical compacto | Vertical compacto | OK - CORREGIDO |
| Logo | Abajo de horarios | En sección media | OK - CORREGIDO |
| Precio | Grande, prominente | Grande, prominente | OK - CORREGIDO |
| Botón | "Ver sillas" | "Ver sillas" con borde | OK - CORREGIDO |

---

## 6. ELEMENTOS FALTANTES

### 6.1 Por Agregar
| Elemento | Descripción | Prioridad |
|----------|-------------|-----------|
| Menú 3 puntos | En campos de origen/destino | Media |
| Badge error fecha | Punto rojo cuando no hay fecha | Baja |
| "Mostrando todos los viajes" | Texto en footer de resultados | Baja |
| Layout móvil resultados | Diseño responsive completo | **ALTA** |
| Header móvil resultados | "Cambiar búsqueda" + flecha atrás | **ALTA** |

### 6.2 Por Quitar
| Elemento | Descripción | Prioridad |
|----------|-------------|-----------|
| Fondo blanco logo | En header | Media |
| Icono "N" | Es de extensión del navegador | N/A (ignorar) |

### 6.3 Por Descargar/Obtener
| Recurso | Descripción | Fuente |
|---------|-------------|--------|
| Logo Reserhub | Para footer más fiel | Extraer del original |
| Iconos MapPin | Estilo exacto del original | Lucide o custom SVG |

---

## 7. PRIORIDADES DE CORRECCIÓN

### CRÍTICO (Hacer primero) - COMPLETADO
1. [x] Crear versión móvil de página de resultados
2. [x] Header móvil con "Cambiar búsqueda"
3. [x] Tarjetas responsive para móvil
4. [x] Usar logo imagen en header (ya existe)

### ALTO (Hacer después) - COMPLETADO
5. [x] Ajustar iconos de origen/destino (MapPin)
6. [x] Botón intercambiar con flechas horizontales
7. [x] Agregar "Mostrando todos los viajes disponibles"
8. [x] Unificar color mensaje bienvenida

### MEDIO (Pulir) - COMPLETADO
9. [x] Menú 3 puntos en campos
10. [x] Ajustar estilos de botones fecha
11. [x] Logo Reserhub estilizado
12. [x] Precios en navegador de fechas (color negro)

### BAJO (Detalles finales) - COMPLETADO
13. [x] Badge error en fecha (punto rojo cuando "Elegir" sin fecha)
14. [x] Animaciones de hover (tarjetas, botones, links)
15. [x] Transiciones suaves (todos los elementos interactivos)

---

## 8. ARCHIVOS A MODIFICAR

| Archivo | Cambios Necesarios |
|---------|-------------------|
| `src/app/search/.../page.tsx` | Layout móvil, header móvil, tarjetas responsive |
| `src/components/layout/header.tsx` | Logo imagen, colores |
| `src/components/sections/search-form.tsx` | Iconos, botón intercambio, menú 3 puntos |
| `src/styles/globals.css` | Media queries móvil |

---

## 9. NOTAS ADICIONALES

### Lo que está BIEN en la réplica:
- Conexión con API real funcionando
- Nombres de terminales correctos
- Sección "Viajes recomendados PARA TI"
- Badge "Popular" (aunque el original no lo muestra claramente)
- Iconos sol/luna con fondo circular (incluso mejor que original)
- Navegador de fechas funcional
- Filtros de tiempo funcionando

### Lo que necesita TRABAJO URGENTE:
- **Versión móvil de resultados** - No es usable actualmente
- **Header móvil** - Falta diseño específico
- **Logo del header** - Usar imagen en vez de texto

---

**Última actualización:** 20 Enero 2026
