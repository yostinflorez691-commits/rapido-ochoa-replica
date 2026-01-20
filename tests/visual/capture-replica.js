const { chromium } = require('playwright');

async function captureReplica() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  
  console.log('Capturando réplica...');
  await page.goto('http://localhost:3000', { 
    waitUntil: 'networkidle',
    timeout: 30000 
  });
  
  await page.screenshot({ 
    path: 'docs/screenshots-replica/replica-new.png',
    fullPage: true 
  });
  
  console.log('Screenshot guardado');
  await browser.close();
}

captureReplica().catch(console.error);
