const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Iniciando captura del sitio original...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Crear carpeta screenshots si no existe
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  // ====================
  // SITIO ORIGINAL
  // ====================
  console.log('Capturando sitio original...');
  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(4000);

  // Captura completa del header
  await page.screenshot({ path: 'screenshots/original-full-desktop.png', fullPage: false });
  console.log('- Captura desktop completa');

  // Extraer estilos del boton login
  const loginButtonStyles = await page.evaluate(() => {
    // Buscar el boton de iniciar sesion
    const buttons = document.querySelectorAll('button');
    let loginBtn = null;
    buttons.forEach(btn => {
      if (btn.textContent.includes('Iniciar') || btn.textContent.includes('sesion') || btn.textContent.includes('sesión')) {
        loginBtn = btn;
      }
    });

    if (loginBtn) {
      const styles = window.getComputedStyle(loginBtn);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        border: styles.border,
        textContent: loginBtn.textContent.trim()
      };
    }
    return null;
  });

  console.log('\n=== ESTILOS BOTON LOGIN ===');
  console.log(JSON.stringify(loginButtonStyles, null, 2));

  // Click en origen para ver dropdown
  console.log('\nCapturando dropdown de origen...');
  try {
    await page.click('input[placeholder*="Origen"]');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder*="Origen"]', 'Med');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/original-dropdown-origin.png' });
    console.log('- Captura dropdown origen');

    // Extraer estilos del dropdown
    const dropdownStyles = await page.evaluate(() => {
      const dropdown = document.querySelector('[class*="dropdown"]') ||
                       document.querySelector('[class*="autocomplete"]') ||
                       document.querySelector('[class*="suggestions"]') ||
                       document.querySelector('[class*="list"]');
      if (dropdown) {
        const styles = window.getComputedStyle(dropdown);
        return {
          backgroundColor: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
          border: styles.border,
          maxHeight: styles.maxHeight,
          overflow: styles.overflow
        };
      }
      return null;
    });

    console.log('\n=== ESTILOS DROPDOWN ===');
    console.log(JSON.stringify(dropdownStyles, null, 2));

    // Contar items en dropdown
    const itemCount = await page.evaluate(() => {
      const items = document.querySelectorAll('[class*="dropdown"] li, [class*="autocomplete"] li, [class*="suggestions"] li, [class*="option"]');
      return items.length;
    });
    console.log(`\nCantidad de items en dropdown: ${itemCount}`);

  } catch (e) {
    console.log('Error capturando dropdown:', e.message);
  }

  // Extraer CSS variables
  const cssVars = await page.evaluate(() => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const vars = {};

    // Lista de variables que nos interesan
    const varNames = [
      '--primary', '--primary-strong', '--accent', '--accent-strong',
      '--main-button', '--main-button-strong',
      '--gray-100', '--gray-200', '--gray-300', '--gray-400', '--gray-500', '--gray-600',
      '--border-radius-box', '--fontsize-m', '--fontsize-l'
    ];

    varNames.forEach(name => {
      const value = styles.getPropertyValue(name);
      if (value) {
        vars[name] = value.trim();
      }
    });

    return vars;
  });

  console.log('\n=== VARIABLES CSS ===');
  console.log(JSON.stringify(cssVars, null, 2));

  // Extraer estilos del formulario
  const formStyles = await page.evaluate(() => {
    const form = document.querySelector('form') || document.querySelector('[class*="search"]');
    const inputs = document.querySelectorAll('input');

    const inputStyles = {};
    inputs.forEach((input, i) => {
      const styles = window.getComputedStyle(input);
      if (input.placeholder) {
        inputStyles[input.placeholder] = {
          borderRadius: styles.borderRadius,
          border: styles.border,
          height: styles.height,
          fontSize: styles.fontSize,
          padding: styles.padding
        };
      }
    });

    return inputStyles;
  });

  console.log('\n=== ESTILOS INPUTS ===');
  console.log(JSON.stringify(formStyles, null, 2));

  // VERSION MOVIL
  console.log('\n--- Capturando version movil ---');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/original-mobile.png' });
  console.log('- Captura movil completa');

  await browser.close();
  console.log('\nCaptura completada!');
  console.log('Las capturas se guardaron en la carpeta screenshots/');
})();
