# Proyecto Replica - viajes.rapidoochoa.com.co

## Estado Actual: FUNCIONAL CON API REAL

La replica del sitio de Rapido Ochoa esta completa y conectada a la API real.

---

## Como Iniciar el Proyecto

### 1. Abrir terminal en la carpeta del proyecto
```bash
cd C:\Users\Administrator\Desktop\sitio-replica
```

### 2. Instalar dependencias (solo si es primera vez o hay errores)
```bash
npm install
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

### 4. Abrir en navegador
```
http://localhost:3000
```

---

## Estructura del Proyecto

```
sitio-replica/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Pagina principal
│   │   ├── layout.tsx                  # Layout principal
│   │   ├── api/
│   │   │   ├── search/route.ts         # Proxy API para busquedas
│   │   │   ├── places/route.ts         # Proxy API para terminales
│   │   │   ├── trips/[tripId]/details/route.ts  # Proxy API para asientos
│   │   │   └── token/refresh/route.ts  # API para gestionar token
│   │   └── search/[origin]/[destination]/[date]/p/[passengers]/departures/
│   │       └── page.tsx                # Pagina de resultados de busqueda
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx              # Header con logo
│   │   │   └── footer.tsx              # Footer
│   │   ├── sections/
│   │   │   ├── search-form.tsx         # Formulario de busqueda principal
│   │   │   └── seat-map.tsx            # Mapa de asientos del bus
│   │   └── ui/                         # Componentes UI reutilizables
│   │
│   └── lib/
│       ├── api.ts                      # Funciones para llamar API
│       ├── token-manager.ts            # Gestor del token de API
│       └── utils.ts                    # Utilidades (cn function)
│
├── public/
│   └── images/
│       └── logo.png                    # Logo oficial de Rapido Ochoa
│
├── scripts/                            # Scripts de Playwright para testing
│
└── screenshots/                        # Capturas de pantalla para comparacion
```

---

## Conexion con API Real

El proyecto esta conectado a la API real de Rapido Ochoa:

### Endpoints utilizados:

```
Base URL: https://one-api.rapidoochoa.com.co/api/v2

POST /search          - Crear busqueda de viajes
GET  /search/{id}     - Obtener resultados de busqueda
GET  /places          - Obtener lista de terminales
```

### Proxy API (evita CORS):

Los endpoints estan proxeados localmente:
- `POST /api/search` -> Crea busqueda
- `GET /api/search?id={searchId}` -> Obtiene resultados
- `GET /api/places` -> Lista terminales

---

## API de Seleccion de Asientos (Ver Sillas)

### Flujo de la API:

1. **Solicitar detalles del viaje:**
```
POST https://one-api.rapidoochoa.com.co/api/v2/trips/{trip_id}/details_requests
```
Respuesta: `{ "id": 24298863, "state": "in_progress", ... }`

2. **Polling para obtener resultado:**
```
GET https://one-api.rapidoochoa.com.co/api/v2/trips/{trip_id}/details_requests/{request_id}
```
Esperar hasta que `state === "finished"`

### Estructura de Respuesta:

```json
{
  "id": 24298863,
  "state": "finished",
  "trip": {
    "id": "1_29_21jan260640_001300224_27",
    "pricing": { "total": 115000, ... },
    "departure": "2026-01-21T07:40:00",
    "arrival": "2026-01-21T18:40:00",
    "availability": 32,
    "capacity": 42,
    "service": "Rey Dorado - Lo máximo",
    "allows_seat_selection": true,
    "diagram_type": "bus"
  },
  "lines": { ... },
  "terminals": { ... },
  "bus": [...]  // Mapa de asientos
}
```

### Estructura del Mapa de Asientos (`bus`):

El campo `bus` es un array 3D:
- **Nivel 1:** Pisos del bus (normalmente 1)
- **Nivel 2:** Filas del bus
- **Nivel 3:** Asientos por fila (tipicamente 5: 2 + pasillo + 2)

```json
"bus": [
  [  // Piso 1
    [  // Fila 1
      { "category": "seat", "number": "1", "occupied": false, "adjacent_seats": null },
      { "category": "seat", "number": "2", "occupied": true, "adjacent_seats": null },
      { "category": "hallway" },
      { "category": "seat", "number": "4", "occupied": false, "adjacent_seats": null },
      { "category": "seat", "number": "3", "occupied": false, "adjacent_seats": null }
    ],
    // ... mas filas
  ]
]
```

### Tipos de Elementos:

| category | Descripcion |
|----------|-------------|
| `seat` | Asiento (tiene number, occupied) |
| `hallway` | Pasillo central |

### Estados de Asiento:

| occupied | Significado |
|----------|-------------|
| `false` | Disponible (se puede seleccionar) |
| `true` | Ocupado (deshabilitado) |

### Estructura HTML del Mapa:

```
.new-seats-layout
  .new-seats-layout-diagram
    .vehicle-container.bus
      .vehicle-front (frente del bus con ruedas)
      .seats-layout
        .seats-layout-row (cada fila)
          .seats-layout-item (asiento izquierda)
          .seats-layout-item-middle (asiento centro-izq)
          .hallway (pasillo)
          .seats-layout-aisle (asiento centro-der)
          .seats-layout-item (asiento derecha)
```

### Clases CSS de Asientos:

- `css-ia0sik` - Asiento disponible (boton activo)
- `css-1nj3sim` - Asiento ocupado (boton disabled con icono persona)
- `css-bjn8wh` - Contenedor del boton

### Servicios del Bus (amenities):

La respuesta incluye servicios disponibles:
```json
"services": ["comfortable", "tv", "wifi", "gps", "charger_usb", "air_conditioning", "bathroom"]
```

---

## Cambios Visuales Realizados (20 Enero 2026)

### Pagina de Resultados - Mejoras Completadas:

| Componente | Cambio |
|------------|--------|
| **Header** | Usa logo real `/images/logo.png` |
| **Nombres de terminales** | Muestra nombres reales de API (ej: "Medellin Terminal Norte") |
| **Logo REY DORADO** | Gradiente dorado + checkmark verde |
| **Badge "Popular"** | Llama de fuego + gradiente naranja |
| **Seccion "Viajes recomendados"** | Agregada con badge "PARA TI" |
| **Badge "Lo Maximo"** | Banner dorado sobre el logo |
| **Badge "De Primera"** | Texto italica + [VIP] |
| **Filtro "Personalizar"** | Badge de notificacion rojo con numero |
| **Iconos sol/luna** | Fondo circular con colores vivos |
| **Navegador de fechas** | Botones circulares, precios en rojo |
| **Footer Reserhub** | Estilo mejorado |

### VERSION MOVIL - Correciones Criticas (20 Enero 2026):

| Componente | Cambio |
|------------|--------|
| **Header movil** | Nuevo! Boton "Cambiar busqueda" + flecha atras + iconos |
| **Filtros movil** | Scroll horizontal con todos los filtros |
| **Tarjetas movil** | Nuevo layout vertical compacto |
| **Navegador fechas movil** | Diseño responsive con 3 columnas |
| **Footer** | Agregado "Mostrando todos los viajes disponibles" |

La pagina de resultados ahora es **completamente responsive** y funciona correctamente en movil.

### PRIORIDAD ALTA - Completado (20 Enero 2026):

| Componente | Cambio |
|------------|--------|
| **Iconos origen/destino** | MapPin filled (verde) para origen, MapPin outline para destino |
| **Logo header** | Usando imagen real `/images/logo.png` |
| **Mensaje bienvenida** | Color amarillo (#f5c842) italica unificado |
| **Boton intercambiar** | Flechas horizontales verdes |

### PRIORIDAD MEDIA - Completado (20 Enero 2026):

| Componente | Cambio |
|------------|--------|
| **Menu 3 puntos** | Agregado en campos origen/destino (desktop y movil) |
| **Logo Reserhub** | Estilizado con gradiente rojo + negro |
| **Precios navegador fechas** | Color negro en vez de rojo |
| **Botones fecha** | Borde gris por defecto, negro cuando seleccionado |

### PRIORIDAD BAJA - Completado (20 Enero 2026):

| Componente | Cambio |
|------------|--------|
| **Badge error fecha** | Punto rojo en boton "Elegir" cuando no hay fecha seleccionada |
| **Animaciones hover** | Tarjetas se elevan, botones escalan, transiciones suaves |
| **Transiciones** | Todos los elementos interactivos tienen transition-all duration-200 |

---

## Funcionalidades Implementadas

### Pagina Principal (/)
- [x] Header con logo real RAPIDO OCHOA
- [x] Mensaje "Bienvenido a Rapido Ochoa!"
- [x] Boton "Iniciar sesion"
- [x] Formulario de busqueda con:
  - [x] Campo origen con autocompletado (API real)
  - [x] Campo destino con autocompletado (API real)
  - [x] Boton intercambiar ciudades
  - [x] Selector de fecha (Hoy/Manana/Elegir)
  - [x] Boton Buscar
- [x] Dropdown con terminales de API real
- [x] Version movil con modales

### Pagina de Resultados (/search/...)
- [x] Header con logo real y search bar
- [x] Filtros por horario (Manana/Tarde/Noche)
- [x] Badge notificacion en "Personalizar busqueda"
- [x] Seccion "Viajes recomendados PARA TI"
- [x] Tarjetas de viaje con:
  - [x] Logo REY DORADO con gradiente y checkmark
  - [x] Badge "Popular" con llama de fuego
  - [x] Badge "Lo Maximo" dorado
  - [x] Badge "De Primera" + [VIP]
  - [x] Horarios salida/llegada
  - [x] Terminales con nombres reales de API
  - [x] Indicador "Directo"
  - [x] Duracion del viaje
  - [x] Precio en COP
  - [x] Boton "Ver sillas"
  - [x] Iconos sol/luna con fondo circular
- [x] Navegacion de fechas con precios
- [x] Footer "Powered by Reserhub"

---

## Archivos Clave a Modificar

| Archivo | Proposito |
|---------|-----------|
| `src/app/search/.../page.tsx` | Pagina de resultados (PRINCIPAL) |
| `src/components/sections/search-form.tsx` | Formulario de busqueda |
| `src/components/sections/seat-map.tsx` | Mapa de asientos del bus (layout horizontal) |
| `src/components/layout/header.tsx` | Header global |
| `src/app/api/search/route.ts` | Proxy API busquedas |
| `src/app/api/trips/[tripId]/details/route.ts` | Proxy API detalles viaje/asientos |
| `src/app/api/token/refresh/route.ts` | API para gestionar/actualizar token |
| `src/lib/token-manager.ts` | Gestor centralizado del token de API |
| `src/lib/api.ts` | Funciones API |

---

## Formato de URLs

### Pagina de resultados:
```
/search/{origin-slug}/{destination-slug}/{DD-MMM-YY}/p/{passengers}/departures

Ejemplo:
/search/t-medellin-ad933da7-aca7-456a-a0e6-96e843785cd2-ochoa/t-bogota-26eddda1-587e-47ac-856a-73ceed0fae96-ochoa/21-Ene-26/p/A1/departures
```

### Formato de fecha:
- URL: `DD-MMM-YY` (ej: `21-Ene-26`)
- API: `DD-MM-YYYY` (ej: `21-01-2026`)

---

## Tecnologias Usadas

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estatico
- **Tailwind CSS 4** - Estilos
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos
- **Playwright** - Testing y screenshots

---

## Colores Principales

```css
Rojo principal:     #c41e3a
Verde botones:      #4a9c4e
Amarillo/Dorado:    #f59e0b, #fbbf24
Naranja Popular:    #f97316
Gris textos:        #666, #888, #999
Fondo pagina:       #f8f8f8
```

---

## Funcionalidades Recientes (20 Enero 2026)

### Seleccion de Asientos - COMPLETADO

1. [x] **API Proxy para detalles del viaje**
   - Ruta: `src/app/api/trips/[tripId]/details/route.ts`
   - Maneja autenticacion con token de API
   - Implementa polling para esperar respuesta

2. [x] **Componente SeatMap** (Rediseñado para igualar al original)
   - Ruta: `src/components/sections/seat-map.tsx`
   - **Layout horizontal** (vista desde arriba del bus, igual al original)
   - Asientos de **40x40px** con bordes grises
   - Estados: Disponible (blanco/gris), Seleccionado (rojo), Ocupado (icono persona)
   - **Panel derecho** con:
     - "Tus sillas" - leyenda con contadores (Libres, Elegidos, Ocupados)
     - "Precio aproximado*" - muestra precio total
     - Boton rojo "Elige al menos 1 silla" / "Continuar"
   - **Icono del conductor** a la izquierda del diagrama
   - **Fondo degradado rosa claro** como el original
   - Responsive: en movil el panel va debajo del diagrama

3. [x] **Integracion en pagina de resultados**
   - Boton "Ver sillas" abre/cierra mapa de asientos
   - Estado de expansion manejado por `expandedTripId`
   - Animaciones con Framer Motion

### Estructura del Componente SeatMap:

```
+--------------------------------------------------+
|  [Conductor]  | Asientos (horizontal)  |         |
|               | 1  5  9  13 17 21 ... |  Tus     |
|               | 2  6  10 14 18 22 ... |  sillas  |
|               |    (pasillo)          |  ------  |
|               | 3  7  11 15 19 23 ... |  Precio  |
|               | 4  8  12 16 20 24 ... |  aprox.  |
|               |                        |  [Boton] |
+--------------------------------------------------+
```

---

## Proximos Pasos Sugeridos

1. [ ] Agregar pagina de pago/checkout
2. [ ] Implementar autenticacion de usuarios
3. [ ] Agregar filtros adicionales (precio, duracion)
4. [ ] Implementar viajes de ida y vuelta
5. [ ] Guardar seleccion de asientos en estado global

---

## Notas Importantes

1. El servidor de desarrollo debe estar corriendo (`npm run dev`)
2. Los datos de viajes son REALES de la API de Rapido Ochoa
3. El proxy API evita problemas de CORS con la API externa
4. Los terminales se cargan dinamicamente desde la API

---

## Solucion de Problemas

### Si el servidor no inicia:
```bash
npm install
npm run dev
```

### Si hay errores de TypeScript:
```bash
npx tsc --noEmit
```

### Si la API no responde:
- Verificar conexion a internet
- La API puede tener rate limiting
- Revisar consola del navegador para errores

---

---

## Gestion del Token de API

El sitio usa un token de autenticacion para la API de Reserhub:

### Token Actual:
```
Token token=ac1d2715377e5d88e7fffe848034c0b1
```

### Donde se usa:
- `src/lib/token-manager.ts` - Gestor centralizado del token
- `src/app/api/trips/[tripId]/details/route.ts` - API de detalles/asientos

### Si el token deja de funcionar:

**Opcion 1: Actualizar manualmente**
1. Abre https://viajes.rapidoochoa.com.co en Chrome
2. Abre DevTools (F12) > Network
3. Haz una busqueda de viajes y click en "Ver sillas"
4. Busca peticiones a `one-api.rapidoochoa.com.co`
5. Copia el header `Authorization: Token token=XXXXXX`
6. Actualiza el token en `src/lib/token-manager.ts`

**Opcion 2: Usar el API de actualizacion**
```bash
# Ver estado actual del token
curl http://localhost:3000/api/token/refresh

# Actualizar token
curl -X PUT http://localhost:3000/api/token/refresh \
  -H "Content-Type: application/json" \
  -d '{"token": "nuevo_token_aqui"}'
```

### Caracteristicas del Token:
- Es un API key estatico del tenant Rapido Ochoa
- Probablemente no cambia frecuentemente
- Es publico (visible en el frontend del sitio original)

---

Ultima actualizacion: 20 Enero 2026 - Mapa de asientos rediseñado (layout horizontal igual al original)
