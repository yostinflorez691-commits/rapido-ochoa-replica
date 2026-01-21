# Instrucciones para Claude - Proyecto Réplica Rapido Ochoa

## Contexto del Proyecto
Este proyecto es una réplica pixel-perfect del sitio de venta de pasajes de bus **viajes.rapidoochoa.com.co**.

## Stack Tecnológico
- Next.js 16.1.4
- TypeScript
- Tailwind CSS
- Framer Motion (animaciones)
- API Real de Rapido Ochoa

## Cómo Ejecutar
```bash
cd "C:/Users/Administrator/Desktop/sitio-replica"
npm run dev
# Abre http://localhost:3000
```

## Colores Importantes (MEMORIZAR)

### Header
- Fondo: `#c41e3a` (rojo)
- Texto bienvenida: `#f5c842` (amarillo)

### Botón "Iniciar sesión"
- **IMPORTANTE:** NO es azul, es GRIS
- Fondo: `#3d3d3d` (gris oscuro)
- Círculo del icono: `#5fbdaa` (turquesa/verde agua)
- Texto: blanco

### Formulario
- Botón buscar: `#66ba5b` (verde)
- Bordes contenedores: `#e0e0e0`
- Border-radius: `8px`
- Iconos origen: verde `#66ba5b`
- Iconos destino: gris `#9b9b9b`

### Dropdown de ciudades
- Formato texto: "Ciudad, Departamento Terminal"
- Ejemplo: "Medellín, Antioquia Medellín Terminal Norte"
- Border-radius: `8px`
- Máximo 15 ciudades visibles

## Archivos Clave
| Archivo | Qué hace |
|---------|----------|
| `src/components/layout/header.tsx` | Header con botón login |
| `src/components/sections/search-form.tsx` | Formulario de búsqueda |
| `src/components/ui/calendar.tsx` | Calendario personalizado |
| `src/app/globals.css` | Variables CSS globales |

## Estado Actual
- ✅ Header completo
- ✅ Formulario de búsqueda
- ✅ Dropdown de ciudades
- ✅ Página de resultados
- ✅ Mapa de asientos
- ⏳ Verificación final con usuario

## Capturas de Referencia
Las capturas del sitio original están en `screenshots/`:
- `original-header-only.png` - Muestra el botón login GRIS
- `original-dropdown-origin.png` - Muestra formato del dropdown
- `original-full-desktop.png` - Vista completa

## Notas para Claude
1. Siempre revisar `ESTADO-PROYECTO.md` para ver el progreso
2. El botón login es GRIS, no azul (error común)
3. Usar las capturas en `screenshots/` como referencia
4. La API real funciona: `https://one-api.rapidoochoa.com.co/api/v2/`
