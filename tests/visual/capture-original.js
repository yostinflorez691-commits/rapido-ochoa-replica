const { chromium } = require('playwright');

async function captureOriginal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  
  console.log('Navegando al sitio original...');
  await page.goto('https://viajes.rapidoochoa.com.co', { 
    waitUntil: 'domcontentloaded',
    timeout: 60000 
  });
  
  // Esperar a que cargue el contenido dinámico
  console.log('Esperando contenido dinámico...');
  await page.waitForTimeout(8000);
  
  // Intentar esperar por un elemento específico
  try {
    await page.waitForSelector('input', { timeout: 10000 });
    console.log('Formulario encontrado');
  } catch (e) {
    console.log('Timeout esperando formulario, capturando de todos modos...');
  }
  
  await page.screenshot({ 
    path: 'docs/screenshots-original/original-full.png',
    fullPage: true 
  });
  
  console.log('Screenshot guardado en docs/screenshots-original/original-full.png');
  
  await browser.close();
}

captureOriginal().catch(console.error);
