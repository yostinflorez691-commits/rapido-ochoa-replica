# Design System - Rapido Ochoa Viajes

## CSS Variables (Design Tokens)

```css
:root {
  /* ═══════════════════════════════════════════════════════════ */
  /* COLORES                                                      */
  /* ═══════════════════════════════════════════════════════════ */

  /* Primarios */
  --color-primary: #002674;
  --color-primary-dark: #001541;
  --color-primary-light: #003399;

  /* Acento */
  --color-accent: #66ba5b;
  --color-accent-dark: #4a9a42;
  --color-accent-light: #7ecf74;

  /* Escala de Grises */
  --color-gray-900: #232323;
  --color-gray-700: #686868;
  --color-gray-500: #9b9b9b;
  --color-gray-300: #c7c7c7;
  --color-gray-100: #e6e6e6;
  --color-gray-50: #fafafa;

  /* Estados */
  --color-error: #ff040d;
  --color-warning: #e8b600;
  --color-success: #66ba5b;
  --color-info: #00abcb;

  /* Neutros */
  --color-white: #ffffff;
  --color-black: #000000;

  /* ═══════════════════════════════════════════════════════════ */
  /* TIPOGRAFÍA                                                   */
  /* ═══════════════════════════════════════════════════════════ */

  /* Familias */
  --font-primary: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-secondary: 'Source Sans Pro', sans-serif;
  --font-display: 'Oswald', sans-serif;

  /* Pesos */
  --font-light: 300;
  --font-normal: 400;
  --font-semibold: 600;

  /* Tamaños */
  --text-xxl: 1.25rem;    /* 20px */
  --text-xl: 1.125rem;    /* 18px */
  --text-lg: 0.9375rem;   /* 15px */
  --text-base: 0.8125rem; /* 13px */
  --text-sm: 0.75rem;     /* 12px */
  --text-xs: 0.6875rem;   /* 11px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.4;
  --leading-relaxed: 1.6;

  /* ═══════════════════════════════════════════════════════════ */
  /* ESPACIADO                                                    */
  /* ═══════════════════════════════════════════════════════════ */

  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 0.75rem;   /* 12px */
  --space-base: 1rem;    /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */

  /* ═══════════════════════════════════════════════════════════ */
  /* BORDES                                                       */
  /* ═══════════════════════════════════════════════════════════ */

  --radius-sm: 2px;
  --radius-base: 3px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  --border-width: 1px;
  --border-color: var(--color-gray-300);

  /* ═══════════════════════════════════════════════════════════ */
  /* SOMBRAS                                                      */
  /* ═══════════════════════════════════════════════════════════ */

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);

  /* ═══════════════════════════════════════════════════════════ */
  /* DIMENSIONES DE COMPONENTES                                   */
  /* ═══════════════════════════════════════════════════════════ */

  /* Header */
  --header-height: 60px;

  /* Botones */
  --btn-height-sm: 36px;
  --btn-height-base: 45px;
  --btn-height-lg: 50px;
  --btn-height-fixed: 60px;

  /* Inputs */
  --input-height: 45px;
  --input-padding-x: 15px;

  /* Sidebar */
  --sidebar-width: 250px;

  /* Cards */
  --card-padding: 15px;

  /* Logo */
  --logo-width: 150px;
  --logo-height: 30px;

  /* ═══════════════════════════════════════════════════════════ */
  /* TRANSICIONES                                                 */
  /* ═══════════════════════════════════════════════════════════ */

  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;

  /* ═══════════════════════════════════════════════════════════ */
  /* Z-INDEX                                                      */
  /* ═══════════════════════════════════════════════════════════ */

  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-tooltip: 600;
}
```

## Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#002674",
          dark: "#001541",
          light: "#003399",
        },
        accent: {
          DEFAULT: "#66ba5b",
          dark: "#4a9a42",
          light: "#7ecf74",
        },
        gray: {
          50: "#fafafa",
          100: "#e6e6e6",
          300: "#c7c7c7",
          500: "#9b9b9b",
          700: "#686868",
          900: "#232323",
        },
        error: "#ff040d",
        warning: "#e8b600",
        success: "#66ba5b",
        info: "#00abcb",
      },
      fontFamily: {
        sans: ["Open Sans", "system-ui", "sans-serif"],
        display: ["Oswald", "sans-serif"],
      },
      fontSize: {
        xxs: ["0.6875rem", { lineHeight: "1.4" }],
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.8125rem", { lineHeight: "1.4" }],
        base: ["0.9375rem", { lineHeight: "1.4" }],
        lg: ["1.125rem", { lineHeight: "1.4" }],
        xl: ["1.25rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "header": "60px",
        "sidebar": "250px",
        "btn-fixed": "60px",
      },
      borderRadius: {
        DEFAULT: "3px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.1)",
        dropdown: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
```

## Componentes Base

### Button Variants
```tsx
// Clases Tailwind para botones
const buttonVariants = {
  primary: "h-[50px] bg-accent hover:bg-accent-dark text-white font-semibold rounded px-6 transition-colors",
  secondary: "h-[50px] bg-primary hover:bg-primary-dark text-white font-semibold rounded px-6 transition-colors",
  outline: "h-[50px] border border-gray-300 hover:border-primary text-gray-700 font-normal rounded px-6 transition-colors",
  ghost: "h-[50px] hover:bg-gray-100 text-gray-700 font-normal rounded px-6 transition-colors",
  fixed: "h-[60px] bg-accent text-white font-semibold fixed bottom-0 left-0 right-0 z-fixed",
};
```

### Input Styles
```tsx
// Clases Tailwind para inputs
const inputStyles = "h-[45px] border border-gray-300 rounded px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";
```

### Card Styles
```tsx
// Clases Tailwind para cards
const cardStyles = "bg-white border border-gray-100 rounded p-4 shadow-card";
```
