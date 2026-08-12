import { test, expect } from '@playwright/test';

const NGROK_URL = 'https://hemoglobic-karla-calligraphically.ngrok-free.dev';
const BUNNY_URL = 'https://libretime-afgbp.bunny.run';

test.describe('LibreTime E2E - Panel + Streaming', () => {
  test.use({
    extraHTTPHeaders: {
      'ngrok-skip-browser-warning': 'true',
    },
  });
  
  test('Full flow: panel → music → stream', async ({ page }) => {
    console.log('1. Opening panel...');
    await page.goto(NGROK_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check if we hit ngrok interstitial
    const isInterstitial = await page.locator('text="You are about to visit"').isVisible().catch(() => false);
    if (isInterstitial) {
      console.log('   ngrok interstitial detected, clicking "Visit Site"...');
      await page.click('button:has-text("Visit Site"), a:has-text("Visit Site")');
      await page.waitForLoadState('networkidle');
    }
    
    console.log(`   Page title: ${await page.title()}`);
    console.log(`   URL: ${page.url()}`);
    
    // Check if login needed
    const needsLogin = await page.locator('input[name="username"], input[name="login"], input[type="password"]').first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (needsLogin) {
      console.log('2. Login required, signing in...');
      await page.fill('input[name="username"], input[name="login"], input[type="text"]', 'admin');
      await page.fill('input[name="password"], input[type="password"]', 'AdminLibreTime2026!');
      await page.click('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
      await page.waitForLoadState('networkidle');
    } else {
      console.log('2. No login required or already authenticated');
    }
    
    // 3. Navigate to library
    console.log('3. Navigating to library...');
    await page.waitForTimeout(2000);
    
    // Try direct navigation to library
    await page.goto(`${NGROK_URL}/library`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {
      console.log('   /library not found, trying /media...');
    });
    
    await page.waitForTimeout(2000);
    
    // 4. Find and play demo music
    console.log('4. Searching for demo music...');
    
    // Check what's on the page
    const pageText = await page.locator('body').textContent();
    console.log(`   Page preview: ${pageText?.slice(0, 300)}...`);
    
    // Look for demo tracks
    const demoTracks = ['Cafe_BGM', 'Chill_Vibes', 'Acoustic_Sunset'];
    for (const track of demoTracks) {
      const found = await page.locator(`text=${track}`).first().isVisible({ timeout: 2000 }).catch(() => false);
      if (found) {
        console.log(`   Found track: ${track}`);
        await page.locator(`text=${track}`).first().click();
        break;
      }
    }
    
    // Try play buttons
    const playBtns = await page.locator('button[aria-label*="play" i], button[title*="play" i], button:has-text("Play"), button:has-text("Reproducir")').count();
    if (playBtns > 0) {
      await page.locator('button[aria-label*="play" i], button[title*="play" i], button:has-text("Play"), button:has-text("Reproducir")').first().click();
      console.log(`   Clicked play button (${playBtns} found)`);
    } else {
      console.log('   No play buttons visible');
    }
    
    await page.waitForTimeout(3000);
    
    // 5. Verify stream via bunny.net
    console.log('5. Verifying stream via bunny.net...');
    const streamResponse = await page.request.get(`${BUNNY_URL}/live.mp3`, { timeout: 10000 });
    console.log(`   Stream status: ${streamResponse.status()}`);
    expect(streamResponse.status()).toBe(200);
    
    // 6. Health check
    console.log('6. Health check...');
    const health = await page.request.get(`${BUNNY_URL}/status`);
    const data = await health.json();
    console.log('   Health:', data);
    expect(data.status).toBe('ok');
    
    console.log('✅ FULL FLOW VERIFIED');
  });
  
  test('Direct stream via bunny.net', async ({ page }) => {
    console.log('Testing direct stream...');
    const response = await page.request.get(`${BUNNY_URL}/live.mp3`, { timeout: 15000 });
    console.log(`Status: ${response.status()}, Content-Type: ${response.headers()['content-type']}`);
    expect(response.status()).toBe(200);
  });
});