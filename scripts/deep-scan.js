const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });

  console.log('='.repeat(70));
  console.log('ESCANEO PROFUNDO - ANALISIS DETALLADO DE CADA ELEMENTO');
  console.log('='.repeat(70));

  // ORIGINAL
  console.log('\n[ANALIZANDO SITIO ORIGINAL...]');
  const p1 = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await p1.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'networkidle' });
  await p1.waitForTimeout(3000);

  const original = await p1.evaluate(() => {
    const getStyles = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        bg: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        padding: cs.padding,
        border: cs.border,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow.substring(0, 60),
        text: el.innerText ? el.innerText.substring(0, 40) : ''
      };
    };

    const header = document.querySelector('header');
    const allButtons = Array.from(document.querySelectorAll('button'));
    const loginBtn = allButtons.find(b => b.textContent.includes('sesión'));
    const searchBtn = allButtons.find(b => b.textContent.includes('Buscar'));
    const title = document.querySelector('h1');
    const inputs = Array.from(document.querySelectorAll('input'));
    const swapBtn = allButtons.find(b => b.querySelector('svg') && b.closest('form'));
    const dateCard = document.querySelector('[class*="date"], [class*="cuando"]') ||
                     allButtons.find(b => b.textContent.includes('Hoy'))?.parentElement?.parentElement;
    const dateButtons = allButtons.filter(b =>
      b.textContent.includes('Hoy') ||
      b.textContent.includes('Mañana') ||
      b.textContent.includes('Elegir')
    );

    // Get search card (the white card containing origin/destination)
    const searchCard = inputs[0] ? inputs[0].closest('[class*="rounded"], [class*="shadow"], div[class*="bg-white"]') : null;

    return {
      header: getStyles(header),
      loginBtn: getStyles(loginBtn),
      title: getStyles(title),
      searchBtn: getStyles(searchBtn),
      input: getStyles(inputs[0]),
      swapBtn: getStyles(swapBtn),
      dateCard: getStyles(dateCard),
      dateBtnHoy: getStyles(dateButtons.find(b => b.textContent.includes('Hoy'))),
      dateBtnManana: getStyles(dateButtons.find(b => b.textContent.includes('Mañana'))),
      searchCard: getStyles(searchCard)
    };
  });

  // REPLICA
  console.log('[ANALIZANDO REPLICA...]');
  const p2 = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await p2.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(2000);

  const replica = await p2.evaluate(() => {
    const getStyles = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        bg: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        padding: cs.padding,
        border: cs.border,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow.substring(0, 60),
        text: el.innerText ? el.innerText.substring(0, 40) : ''
      };
    };

    const header = document.querySelector('header');
    const allButtons = Array.from(document.querySelectorAll('button'));
    const loginBtn = allButtons.find(b => b.textContent.includes('sesión') && b.offsetParent);
    const searchBtn = allButtons.find(b => b.textContent.includes('Buscar') && b.offsetParent && b.offsetHeight > 50);
    const title = document.querySelector('h1');
    const inputs = Array.from(document.querySelectorAll('input')).filter(i => i.offsetParent);
    const swapBtn = allButtons.find(b => b.querySelector('svg') && b.offsetParent && b.closest('form'));
    const dateCard = allButtons.find(b => b.textContent.includes('Hoy') && b.offsetParent)?.parentElement?.parentElement;
    const dateButtons = allButtons.filter(b =>
      (b.textContent.includes('Hoy') ||
      b.textContent.includes('Mañana') ||
      b.textContent.includes('Elegir')) && b.offsetParent
    );

    const searchCard = inputs[0] ? inputs[0].closest('.rounded-full, [class*="shadow"]') : null;

    return {
      header: getStyles(header),
      loginBtn: getStyles(loginBtn),
      title: getStyles(title),
      searchBtn: getStyles(searchBtn),
      input: getStyles(inputs[0]),
      swapBtn: getStyles(swapBtn),
      dateCard: getStyles(dateCard),
      dateBtnHoy: getStyles(dateButtons.find(b => b.textContent.includes('Hoy'))),
      dateBtnManana: getStyles(dateButtons.find(b => b.textContent.includes('Mañana'))),
      searchCard: getStyles(searchCard)
    };
  });

  await browser.close();

  // COMPARACION DETALLADA
  console.log('\n' + '='.repeat(70));
  console.log('DIFERENCIAS ENCONTRADAS:');
  console.log('='.repeat(70));

  const compare = (name, o, r) => {
    console.log('\n[' + name.toUpperCase() + ']');
    if (!o && !r) { console.log('  (No encontrado en ninguno)'); return; }
    if (!o) { console.log('  ⚠ FALTA EN ORIGINAL'); return; }
    if (!r) { console.log('  ⚠ FALTA EN REPLICA'); return; }

    let hasDiff = false;
    const props = ['width', 'height', 'fontSize', 'fontWeight', 'color', 'bg', 'borderRadius', 'border'];
    props.forEach(p => {
      const ov = o[p];
      const rv = r[p];
      if (ov && rv && ov !== rv) {
        console.log('  ' + p + ':');
        console.log('    ORIGINAL: ' + ov);
        console.log('    REPLICA:  ' + rv);
        hasDiff = true;
      }
    });
    if (!hasDiff) console.log('  ✓ Coincide');
  };

  compare('HEADER', original.header, replica.header);
  compare('BOTON LOGIN', original.loginBtn, replica.loginBtn);
  compare('TITULO H1', original.title, replica.title);
  compare('INPUT ORIGEN', original.input, replica.input);
  compare('BOTON SWAP', original.swapBtn, replica.swapBtn);
  compare('TARJETA FECHAS', original.dateCard, replica.dateCard);
  compare('BOTON HOY', original.dateBtnHoy, replica.dateBtnHoy);
  compare('BOTON MAÑANA', original.dateBtnManana, replica.dateBtnManana);
  compare('BOTON BUSCAR', original.searchBtn, replica.searchBtn);
  compare('TARJETA BUSQUEDA', original.searchCard, replica.searchCard);

  console.log('\n' + '='.repeat(70));
  console.log('DETALLES ADICIONALES DEL ORIGINAL:');
  console.log('='.repeat(70));
  console.log('\nHeader:', JSON.stringify(original.header, null, 2));
  console.log('\nTitulo:', JSON.stringify(original.title, null, 2));
  console.log('\nBoton Buscar:', JSON.stringify(original.searchBtn, null, 2));
  console.log('\nBoton Hoy:', JSON.stringify(original.dateBtnHoy, null, 2));

})();
