# Análisis Completo - viajes.rapidoochoa.com.co

## Información General
- **URL**: https://viajes.rapidoochoa.com.co
- **Tipo**: Plataforma de búsqueda y reserva de viajes en bus
- **Fecha de análisis**: 2026-01-20

---

## 1. Estructura del Sitio

### Layout Principal
```
┌─────────────────────────────────────────────┐
│                   HEADER                     │
│  Logo (150x30px)  |  Navegación              │
├─────────────────────────────────────────────┤
│              HERO / BÚSQUEDA                 │
│  [Origen] [Destino] [Fecha] [Pasajeros]      │
│              [BUSCAR]                        │
├──────────────┬──────────────────────────────┤
│   SIDEBAR    │        RESULTADOS            │
│   Filtros    │   Cards horizontales         │
│              │   con info de viajes         │
├──────────────┴──────────────────────────────┤
│                   FOOTER                     │
└─────────────────────────────────────────────┘
```

### Componentes Identificados
1. **Header/TopBar**
   - Logo Rapido Ochoa
   - Navegación principal
   - Altura estimada: 60px

2. **Buscador Principal**
   - Campos: Origen, Destino, Fecha, Pasajeros
   - Botón de búsqueda prominente
   - Opción de intercambiar origen/destino

3. **Sidebar de Filtros**
   - Filtro por proveedor
   - Filtro por horario
   - Filtro por duración
   - Ancho: ~250px

4. **Cards de Resultados**
   - Layout horizontal
   - Info: Hora salida, duración, hora llegada
   - Precio y disponibilidad
   - Botón de selección

5. **Footer**
   - Información de contacto
   - Links legales
   - Oculto en móvil

---

## 2. Paleta de Colores

### Colores Principales
| Nombre | Hex | Uso |
|--------|-----|-----|
| Primary | #002674 | Fondos principales, headers |
| Primary Dark | #001541 | Hover states, acentos |
| Accent/Success | #66ba5b | Botones CTA, precios, confirmaciones |
| White | #FFFFFF | Fondos, texto sobre oscuro |

### Escala de Grises
| Nombre | Hex | Uso |
|--------|-----|-----|
| Gray 900 | #232323 | Texto principal |
| Gray 700 | #686868 | Texto secundario |
| Gray 500 | #9b9b9b | Placeholders, disabled |
| Gray 300 | #c7c7c7 | Bordes |
| Gray 100 | #e6e6e6 | Separadores |
| Gray 50 | #fafafa | Fondos alternos |

### Estados
| Estado | Hex |
|--------|-----|
| Error | #ff040d |
| Warning | #e8b600 |
| Success | #66ba5b |
| Info | #00abcb |

---

## 3. Tipografía

### Fuente Principal
- **Font Family**: "Open Sans", sans-serif
- **Pesos**: 300 (Light), 400 (Regular), 600 (Semi-Bold)
- **Google Fonts**: https://fonts.googleapis.com/css?family=Open+Sans:300,400,600

### Fuentes Secundarias
- **Helvetica Neue**: Fallback
- **Source Sans Pro**: UI elements
- **Oswald**: Headers especiales (condensada)

### Escala de Tamaños
| Nombre | Tamaño | Line Height |
|--------|--------|-------------|
| xxl | 20px | 1.4 |
| xl | 18px | 1.4 |
| l | 15px | 1.4 |
| m | 13px | 1.4 |
| s | 12px | 1.4 |
| xs | 11px | 1.4 |

---

## 4. Espaciados

### Sistema de Espaciado
```
4px  - xs
8px  - sm
12px - md
16px - base
24px - lg
32px - xl
48px - 2xl
64px - 3xl
```

### Específicos
- **Padding de cards**: 15px 10px
- **Border radius**: 3px (estándar)
- **Gap entre elementos**: 8-16px

---

## 5. Componentes UI

### Botones
```css
/* Botón Primario */
height: 50px;
background: #66ba5b;
border-radius: 3px;
font-weight: 600;
color: white;

/* Botón Fijo (Mobile) */
height: 60px;
position: fixed;
bottom: 0;
```

### Inputs
```css
height: 45px;
border: 1px solid #c7c7c7;
border-radius: 3px;
padding: 0 15px;
font-size: 14px;
```

### Cards
```css
background: white;
border: 1px solid #e6e6e6;
border-radius: 3px;
padding: 15px;
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
```

---

## 6. Breakpoints Responsive

| Nombre | Breakpoint | Descripción |
|--------|------------|-------------|
| mobile | < 640px | Stack vertical, nav colapsada |
| tablet | 640px - 1080px | Layout adaptado |
| desktop | > 1080px | Layout completo con sidebar |

---

## 7. Assets Requeridos

### Imágenes
- [ ] Logo Rapido Ochoa (PNG/SVG)
- [ ] Favicon
- [ ] Iconos de transporte
- [ ] Background patterns (si existen)

### Iconos (Lucide equivalentes)
- MapPin (ubicación)
- Calendar (fecha)
- Users (pasajeros)
- ArrowRight/ArrowLeftRight (intercambio)
- Clock (duración)
- Bus (transporte)
- Filter (filtros)
- ChevronDown (dropdowns)

---

## 8. Funcionalidades

### Core
1. **Búsqueda de rutas**
   - Autocompletado de ciudades
   - Selector de fecha
   - Cantidad de pasajeros

2. **Resultados**
   - Lista de viajes disponibles
   - Ordenamiento
   - Filtrado

3. **Selección de asientos**
   - Mapa visual del bus
   - Estados: disponible, ocupado, seleccionado

4. **Proceso de compra**
   - Datos del pasajero
   - Método de pago
   - Confirmación

---

## 9. Notas de Implementación

### Prioridades
1. Layout base responsive
2. Header con logo y navegación
3. Buscador principal
4. Cards de resultados
5. Sistema de filtros
6. Footer

### Consideraciones Técnicas
- Mobile-first approach
- Usar Tailwind con custom theme
- Design tokens via CSS variables
- Componentes Radix UI para accesibilidad
- Framer Motion para transiciones
