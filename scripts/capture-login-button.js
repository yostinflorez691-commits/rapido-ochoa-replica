const { chromium } = require('playwright');

(async () => {
  console.log('Capturando botón de login del sitio original...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('https://viajes.rapidoochoa.com.co');
  await page.waitForTimeout(5000);

  // Capturar solo el header
  const header = await page.$('header') || await page.$('[class*="header"]') || await page.$('nav');
  if (header) {
    await header.screenshot({ path: 'screenshots/original-header-only.png' });
    console.log('Header capturado');
  }

  // Captura completa de la parte superior
  await page.screenshot({
    path: 'screenshots/original-top-section.png',
    clip: { x: 0, y: 0, width: 1920, height: 200 }
  });
  console.log('Sección superior capturada');

  // Buscar y analizar el botón de login
  const loginInfo = await page.evaluate(() => {
    // Buscar elementos que contengan "Iniciar" o "sesión"
    const allElements = document.querySelectorAll('*');
    let loginElement = null;

    for (const el of allElements) {
      const text = el.textContent?.trim() || '';
      if ((text.includes('Iniciar') && text.includes('sesión')) ||
          (text.includes('Iniciar') && text.length < 50)) {
        // Verificar que sea un elemento clicable
        if (el.tagName === 'BUTTON' || el.tagName === 'A' ||
            el.getAttribute('role') === 'button' ||
            el.className.includes('button') || el.className.includes('btn')) {
          loginElement = el;
          break;
        }
      }
    }

    if (!loginElement) {
      // Buscar por clase que contenga login
      loginElement = document.querySelector('[class*="login"]') ||
                     document.querySelector('[class*="signin"]') ||
                     document.querySelector('[class*="session"]');
    }

    if (loginElement) {
      const styles = window.getComputedStyle(loginElement);
      const rect = loginElement.getBoundingClientRect();

      // También buscar el icono dentro
      const icon = loginElement.querySelector('svg') || loginElement.querySelector('img') || loginElement.querySelector('[class*="icon"]');
      let iconInfo = null;
      if (icon) {
        const iconStyles = window.getComputedStyle(icon);
        iconInfo = {
          color: iconStyles.color,
          fill: iconStyles.fill,
          width: iconStyles.width,
          height: iconStyles.height
        };
      }

      // Buscar el contenedor del icono (círculo)
      const iconContainer = loginElement.querySelector('[class*="avatar"]') ||
                           loginElement.querySelector('[class*="icon"]') ||
                           loginElement.querySelector('div');
      let containerInfo = null;
      if (iconContainer && iconContainer !== loginElement) {
        const containerStyles = window.getComputedStyle(iconContainer);
        containerInfo = {
          backgroundColor: containerStyles.backgroundColor,
          borderRadius: containerStyles.borderRadius,
          width: containerStyles.width,
          height: containerStyles.height
        };
      }

      return {
        found: true,
        tagName: loginElement.tagName,
        className: loginElement.className,
        text: loginElement.textContent?.trim(),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          border: styles.border,
          padding: styles.padding,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          display: styles.display,
          alignItems: styles.alignItems,
          gap: styles.gap
        },
        iconInfo,
        containerInfo,
        innerHTML: loginElement.innerHTML.substring(0, 500)
      };
    }

    return { found: false };
  });

  console.log('\n=== INFORMACIÓN DEL BOTÓN LOGIN ===');
  console.log(JSON.stringify(loginInfo, null, 2));

  // Si encontramos el botón, hacer screenshot específico
  if (loginInfo.found && loginInfo.rect) {
    const padding = 20;
    await page.screenshot({
      path: 'screenshots/original-login-button-closeup.png',
      clip: {
        x: Math.max(0, loginInfo.rect.x - padding),
        y: Math.max(0, loginInfo.rect.y - padding),
        width: loginInfo.rect.width + padding * 2,
        height: loginInfo.rect.height + padding * 2
      }
    });
    console.log('Botón de login capturado en closeup');
  }

  await browser.close();
  console.log('\nCaptura completada!');
})();
