const { chromium } = require('playwright');
const path = require('path');

async function captureScreenshots() {
  const browser = await chromium.launch();
  
  // Capturar sitio original
  console.log('Capturando sitio original...');
  const pageOriginal = await browser.newPage();
  await pageOriginal.setViewportSize({ width: 1440, height: 900 });
  await pageOriginal.goto('https://viajes.rapidoochoa.com.co', { waitUntil: 'networkidle', timeout: 60000 });
  await pageOriginal.screenshot({ 
    path: 'docs/screenshots-original/original-desktop.png',
    fullPage: true 
  });
  
  await pageOriginal.setViewportSize({ width: 375, height: 812 });
  await pageOriginal.screenshot({ 
    path: 'docs/screenshots-original/original-mobile.png',
    fullPage: true 
  });
  
  // Capturar réplica
  console.log('Capturando réplica...');
  const pageReplica = await browser.newPage();
  await pageReplica.setViewportSize({ width: 1440, height: 900 });
  await pageReplica.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await pageReplica.screenshot({ 
    path: 'docs/screenshots-replica/replica-desktop.png',
    fullPage: true 
  });
  
  await pageReplica.setViewportSize({ width: 375, height: 812 });
  await pageReplica.screenshot({ 
    path: 'docs/screenshots-replica/replica-mobile.png',
    fullPage: true 
  });
  
  await browser.close();
  console.log('Screenshots guardados en docs/');
}

captureScreenshots().catch(console.error);
