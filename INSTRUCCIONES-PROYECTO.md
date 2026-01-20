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
│   │   │   └── places/route.ts         # Proxy API para terminales
│   │   └── search/[origin]/[destination]/[date]/p/[passengers]/departures/
│   │       └── page.tsx                # Pagina de resultados de busqueda
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx              # Header con logo
│   │   │   └── footer.tsx              # Footer
│   │   ├── sections/
│   │   │   └── search-form.tsx         # Formulario de busqueda principal
│   │   └── ui/                         # Componentes UI reutilizables
│   │
│   └── lib/
│       ├── api.ts                      # Funciones para llamar API
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
| `src/components/layout/header.tsx` | Header global |
| `src/app/api/search/route.ts` | Proxy API busquedas |
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

## Proximos Pasos Sugeridos

1. [ ] Implementar seleccion de asientos
2. [ ] Agregar pagina de pago
3. [ ] Implementar autenticacion de usuarios
4. [ ] Mejorar version movil de resultados
5. [ ] Agregar filtros adicionales (precio, duracion)
6. [ ] Implementar viajes de ida y vuelta

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

Ultima actualizacion: 20 Enero 2026
