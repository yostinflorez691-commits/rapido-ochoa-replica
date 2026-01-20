const { chromium } = require('playwright');

(async () => {
  console.log('Abriendo navegadores para comparacion...\n');

  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });

  // Abrir sitio original
  const originalContext = await browser.newContext({ viewport: null });
  const originalPage = await originalContext.newPage();
  await originalPage.goto('https://viajes.rapidoochoa.com.co');
  console.log('[ORIGINAL] https://viajes.rapidoochoa.com.co');

  // Abrir replica
  const replicaContext = await browser.newContext({ viewport: null });
  const replicaPage = await replicaContext.newPage();
  await replicaPage.goto('http://localhost:3000');
  console.log('[REPLICA]  http://localhost:3000');

  console.log('\n========================================');
  console.log('Navegadores abiertos!');
  console.log('Compara los dos sitios visualmente.');
  console.log('Presiona Ctrl+C para cerrar.');
  console.log('========================================\n');

  // Mantener abierto
  await new Promise(() => {});
})();
