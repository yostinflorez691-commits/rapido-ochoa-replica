const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('='.repeat(60));
  console.log('COMPARACIÓN DETALLADA: Original vs Réplica');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false, slowMo: 500 });

  // Crear carpeta para capturas
  const compareDir = 'screenshots/comparacion-detallada';
  if (!fs.existsSync(compareDir)) {
    fs.mkdirSync(compareDir, { recursive: true });
  }

  const comparacion = {
    fecha: new Date().toISOString(),
    elementos: []
  };

  // ==========================================
  // PARTE 1: ANALIZAR SITIO ORIGINAL
  // ==========================================
  console.log('\n📌 ANALIZANDO SITIO ORIGINAL...\n');

  const pageOriginal = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await pageOriginal.goto('https://viajes.rapidoochoa.com.co');
  await pageOriginal.waitForTimeout(5000);

  // Captura completa
  await pageOriginal.screenshot({ path: `${compareDir}/01-original-completo.png` });
  console.log('✓ Captura completa del original');

  // Analizar HEADER
  console.log('\n--- HEADER ---');
  const headerOriginal = await pageOriginal.evaluate(() => {
    const header = document.querySelector('header') || document.querySelector('[class*="header"]');
    if (!header) return null;

    const styles = window.getComputedStyle(header);
    return {
      backgroundColor: styles.backgroundColor,
      height: styles.height,
      padding: styles.padding
    };
  });
  console.log('Header Original:', JSON.stringify(headerOriginal, null, 2));
  comparacion.elementos.push({ nombre: 'Header', original: headerOriginal });

  // Analizar BOTÓN LOGIN
  console.log('\n--- BOTÓN INICIAR SESIÓN ---');
  const loginOriginal = await pageOriginal.evaluate(() => {
    const allElements = document.querySelectorAll('button, a, [role="button"]');
    for (const el of allElements) {
      if (el.textContent?.includes('Iniciar') || el.textContent?.includes('sesión')) {
        const styles = window.getComputedStyle(el);

        // Buscar el círculo del icono
        const iconContainer = el.querySelector('div') || el.querySelector('span');
        let iconStyles = null;
        if (iconContainer) {
          const iStyles = window.getComputedStyle(iconContainer);
          iconStyles = {
            backgroundColor: iStyles.backgroundColor,
            borderRadius: iStyles.borderRadius,
            width: iStyles.width,
            height: iStyles.height
          };
        }

        return {
          texto: el.textContent?.trim(),
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          fontSize: styles.fontSize,
          iconContainer: iconStyles
        };
      }
    }
    return null;
  });
  console.log('Botón Login Original:', JSON.stringify(loginOriginal, null, 2));
  comparacion.elementos.push({ nombre: 'Botón Login', original: loginOriginal });

  // Analizar TÍTULO
  console.log('\n--- TÍTULO PRINCIPAL ---');
  const tituloOriginal = await pageOriginal.evaluate(() => {
    const h1 = document.querySelector('h1');
    const titulo = document.querySelector('[class*="title"]');
    const element = h1 || titulo;

    if (element) {
      const styles = window.getComputedStyle(element);
      return {
        texto: element.textContent?.trim(),
        color: styles.color,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight
      };
    }

    // Buscar el texto "Consulta de horarios"
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      if (el.textContent?.includes('Consulta de horarios') && el.children.length === 0) {
        const styles = window.getComputedStyle(el);
        return {
          texto: el.textContent?.trim(),
          color: styles.color,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        };
      }
    }
    return null;
  });
  console.log('Título Original:', JSON.stringify(tituloOriginal, null, 2));
  comparacion.elementos.push({ nombre: 'Título', original: tituloOriginal });

  // Analizar FORMULARIO DE BÚSQUEDA
  console.log('\n--- FORMULARIO DE BÚSQUEDA ---');
  const formOriginal = await pageOriginal.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const inputsInfo = [];

    inputs.forEach(input => {
      if (input.placeholder) {
        const styles = window.getComputedStyle(input);
        const parent = input.closest('div');
        const parentStyles = parent ? window.getComputedStyle(parent) : null;

        inputsInfo.push({
          placeholder: input.placeholder,
          height: styles.height,
          fontSize: styles.fontSize,
          border: styles.border,
          borderRadius: styles.borderRadius,
          parentBg: parentStyles?.backgroundColor,
          parentBorder: parentStyles?.border,
          parentBorderRadius: parentStyles?.borderRadius
        });
      }
    });

    return inputsInfo;
  });
  console.log('Formulario Original:', JSON.stringify(formOriginal, null, 2));
  comparacion.elementos.push({ nombre: 'Formulario', original: formOriginal });

  // Analizar BOTÓN BUSCAR
  console.log('\n--- BOTÓN BUSCAR ---');
  const buscarOriginal = await pageOriginal.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent?.includes('Buscar')) {
        const styles = window.getComputedStyle(btn);
        return {
          texto: btn.textContent?.trim(),
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          height: styles.height,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        };
      }
    }
    return null;
  });
  console.log('Botón Buscar Original:', JSON.stringify(buscarOriginal, null, 2));
  comparacion.elementos.push({ nombre: 'Botón Buscar', original: buscarOriginal });

  // Analizar BOTONES DE FECHA
  console.log('\n--- BOTONES DE FECHA (Hoy/Mañana/Elegir) ---');
  const fechaOriginal = await pageOriginal.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    const fechaBtns = [];

    for (const btn of buttons) {
      const text = btn.textContent?.trim();
      if (text === 'Hoy' || text === 'Mañana' || text?.includes('Elegir')) {
        const styles = window.getComputedStyle(btn);
        fechaBtns.push({
          texto: text,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          border: styles.border,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          fontSize: styles.fontSize
        });
      }
    }
    return fechaBtns;
  });
  console.log('Botones Fecha Original:', JSON.stringify(fechaOriginal, null, 2));
  comparacion.elementos.push({ nombre: 'Botones Fecha', original: fechaOriginal });

  // Abrir dropdown de origen
  console.log('\n--- DROPDOWN DE CIUDADES ---');
  try {
    await pageOriginal.click('input[placeholder*="Origen"]');
    await pageOriginal.waitForTimeout(1000);
    await pageOriginal.fill('input[placeholder*="Origen"]', 'Med');
    await pageOriginal.waitForTimeout(2000);

    await pageOriginal.screenshot({ path: `${compareDir}/02-original-dropdown.png` });
    console.log('✓ Captura dropdown original');

    const dropdownOriginal = await pageOriginal.evaluate(() => {
      // Buscar el dropdown/lista de sugerencias
      const lists = document.querySelectorAll('ul, [class*="dropdown"], [class*="list"], [class*="suggestions"], [class*="autocomplete"]');

      for (const list of lists) {
        const items = list.querySelectorAll('li, [class*="item"], [class*="option"], button');
        if (items.length > 0) {
          const styles = window.getComputedStyle(list);
          const itemsInfo = [];

          items.forEach((item, i) => {
            if (i < 5) { // Solo los primeros 5
              const itemStyles = window.getComputedStyle(item);
              itemsInfo.push({
                texto: item.textContent?.trim().substring(0, 100),
                fontSize: itemStyles.fontSize,
                color: itemStyles.color,
                padding: itemStyles.padding
              });
            }
          });

          return {
            containerBg: styles.backgroundColor,
            containerBorder: styles.border,
            containerBorderRadius: styles.borderRadius,
            containerShadow: styles.boxShadow,
            itemsCount: items.length,
            items: itemsInfo
          };
        }
      }
      return null;
    });
    console.log('Dropdown Original:', JSON.stringify(dropdownOriginal, null, 2));
    comparacion.elementos.push({ nombre: 'Dropdown', original: dropdownOriginal });
  } catch (e) {
    console.log('Error capturando dropdown:', e.message);
  }

  // Cerrar página original
  await pageOriginal.close();

  // ==========================================
  // PARTE 2: ANALIZAR NUESTRA RÉPLICA
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('📌 ANALIZANDO NUESTRA RÉPLICA...');
  console.log('='.repeat(60));

  // Primero iniciar el servidor
  console.log('\nIniciando servidor de la réplica...');

  const { spawn } = require('child_process');
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: 'C:/Users/Administrator/Desktop/sitio-replica',
    shell: true,
    detached: true
  });

  // Esperar a que el servidor inicie
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('Servidor iniciado');

  const pageReplica = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await pageReplica.goto('http://localhost:3000', { timeout: 30000 });
    await pageReplica.waitForTimeout(5000);

    // Captura completa
    await pageReplica.screenshot({ path: `${compareDir}/03-replica-completo.png` });
    console.log('✓ Captura completa de la réplica');

    // Analizar los mismos elementos
    console.log('\n--- HEADER RÉPLICA ---');
    const headerReplica = await pageReplica.evaluate(() => {
      const header = document.querySelector('header');
      if (!header) return null;
      const styles = window.getComputedStyle(header);
      return {
        backgroundColor: styles.backgroundColor,
        height: styles.height,
        padding: styles.padding
      };
    });
    console.log('Header Réplica:', JSON.stringify(headerReplica, null, 2));

    console.log('\n--- BOTÓN LOGIN RÉPLICA ---');
    const loginReplica = await pageReplica.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Iniciar')) {
          const styles = window.getComputedStyle(btn);
          const iconContainer = btn.querySelector('div');
          let iconStyles = null;
          if (iconContainer) {
            const iStyles = window.getComputedStyle(iconContainer);
            iconStyles = {
              backgroundColor: iStyles.backgroundColor,
              borderRadius: iStyles.borderRadius,
              width: iStyles.width,
              height: iStyles.height
            };
          }
          return {
            texto: btn.textContent?.trim(),
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderRadius: styles.borderRadius,
            padding: styles.padding,
            fontSize: styles.fontSize,
            iconContainer: iconStyles
          };
        }
      }
      return null;
    });
    console.log('Botón Login Réplica:', JSON.stringify(loginReplica, null, 2));

    // Dropdown réplica
    console.log('\n--- DROPDOWN RÉPLICA ---');
    try {
      await pageReplica.click('input[placeholder*="Origen"]');
      await pageReplica.waitForTimeout(1000);
      await pageReplica.fill('input[placeholder*="Origen"]', 'Med');
      await pageReplica.waitForTimeout(2000);

      await pageReplica.screenshot({ path: `${compareDir}/04-replica-dropdown.png` });
      console.log('✓ Captura dropdown réplica');
    } catch (e) {
      console.log('Error:', e.message);
    }

  } catch (e) {
    console.log('Error conectando a réplica:', e.message);
  }

  // ==========================================
  // PARTE 3: MOSTRAR COMPARACIÓN LADO A LADO
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 ABRIENDO AMBOS SITIOS LADO A LADO');
  console.log('='.repeat(60));

  // Abrir ambos en ventanas separadas para comparar visualmente
  const context1 = await browser.newContext({ viewport: { width: 960, height: 1080 } });
  const context2 = await browser.newContext({ viewport: { width: 960, height: 1080 } });

  const winOriginal = await context1.newPage();
  const winReplica = await context2.newPage();

  await winOriginal.goto('https://viajes.rapidoochoa.com.co');
  await winReplica.goto('http://localhost:3000');

  await winOriginal.waitForTimeout(3000);
  await winReplica.waitForTimeout(3000);

  console.log('\n✅ Ambos sitios abiertos. Compara visualmente:');
  console.log('   - Ventana 1: ORIGINAL (viajes.rapidoochoa.com.co)');
  console.log('   - Ventana 2: RÉPLICA (localhost:3000)');
  console.log('\nPresiona Ctrl+C para cerrar cuando termines de comparar...');

  // Guardar resumen
  fs.writeFileSync(`${compareDir}/comparacion-resumen.json`, JSON.stringify(comparacion, null, 2));
  console.log(`\n📁 Resumen guardado en: ${compareDir}/comparacion-resumen.json`);

  // Mantener abierto para comparación visual
  await new Promise(() => {}); // Esperar indefinidamente

})();
