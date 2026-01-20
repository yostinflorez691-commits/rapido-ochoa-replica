const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = months[tomorrow.getMonth()];
  const year = String(tomorrow.getFullYear()).slice(-2);
  const formattedDate = `${day}-${month}-${year}`;

  // Create context with specific viewport
  const context = await browser.newContext({
    viewport: { width: 960, height: 1000 }
  });

  // Open original site on the left
  const pageOriginal = await context.newPage();
  await pageOriginal.goto('https://viajes.rapidoochoa.com.co');

  // Open replica site on the right
  const pageReplica = await context.newPage();
  await pageReplica.goto('http://localhost:3000');

  console.log('Both sites opened. Compare them visually.');
  console.log('Press Ctrl+C to close when done.');

  // Keep browser open
  await new Promise(() => {});
})();
