# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/libretime.spec.ts >> LibreTime E2E - Panel + Streaming >> Full flow: panel → music → stream
- Location: tests/libretime.spec.ts:13:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 502
```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]: 404 - The file you requested could not be found
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const NGROK_URL = 'https://hemoglobic-karla-calligraphically.ngrok-free.dev';
  4   | const BUNNY_URL = 'https://libretime-afgbp.bunny.run';
  5   | 
  6   | test.describe('LibreTime E2E - Panel + Streaming', () => {
  7   |   test.use({
  8   |     extraHTTPHeaders: {
  9   |       'ngrok-skip-browser-warning': 'true',
  10  |     },
  11  |   });
  12  |   
  13  |   test('Full flow: panel → music → stream', async ({ page }) => {
  14  |     console.log('1. Opening panel...');
  15  |     await page.goto(NGROK_URL, { waitUntil: 'networkidle', timeout: 30000 });
  16  |     
  17  |     // Check if we hit ngrok interstitial
  18  |     const isInterstitial = await page.locator('text="You are about to visit"').isVisible().catch(() => false);
  19  |     if (isInterstitial) {
  20  |       console.log('   ngrok interstitial detected, clicking "Visit Site"...');
  21  |       await page.click('button:has-text("Visit Site"), a:has-text("Visit Site")');
  22  |       await page.waitForLoadState('networkidle');
  23  |     }
  24  |     
  25  |     console.log(`   Page title: ${await page.title()}`);
  26  |     console.log(`   URL: ${page.url()}`);
  27  |     
  28  |     // Check if login needed
  29  |     const needsLogin = await page.locator('input[name="username"], input[name="login"], input[type="password"]').first().isVisible({ timeout: 3000 }).catch(() => false);
  30  |     
  31  |     if (needsLogin) {
  32  |       console.log('2. Login required, signing in...');
  33  |       await page.fill('input[name="username"], input[name="login"], input[type="text"]', 'admin');
  34  |       await page.fill('input[name="password"], input[type="password"]', 'AdminLibreTime2026!');
  35  |       await page.click('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Iniciar")');
  36  |       await page.waitForLoadState('networkidle');
  37  |     } else {
  38  |       console.log('2. No login required or already authenticated');
  39  |     }
  40  |     
  41  |     // 3. Navigate to library
  42  |     console.log('3. Navigating to library...');
  43  |     await page.waitForTimeout(2000);
  44  |     
  45  |     // Try direct navigation to library
  46  |     await page.goto(`${NGROK_URL}/library`, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {
  47  |       console.log('   /library not found, trying /media...');
  48  |     });
  49  |     
  50  |     await page.waitForTimeout(2000);
  51  |     
  52  |     // 4. Find and play demo music
  53  |     console.log('4. Searching for demo music...');
  54  |     
  55  |     // Check what's on the page
  56  |     const pageText = await page.locator('body').textContent();
  57  |     console.log(`   Page preview: ${pageText?.slice(0, 300)}...`);
  58  |     
  59  |     // Look for demo tracks
  60  |     const demoTracks = ['Cafe_BGM', 'Chill_Vibes', 'Acoustic_Sunset'];
  61  |     for (const track of demoTracks) {
  62  |       const found = await page.locator(`text=${track}`).first().isVisible({ timeout: 2000 }).catch(() => false);
  63  |       if (found) {
  64  |         console.log(`   Found track: ${track}`);
  65  |         await page.locator(`text=${track}`).first().click();
  66  |         break;
  67  |       }
  68  |     }
  69  |     
  70  |     // Try play buttons
  71  |     const playBtns = await page.locator('button[aria-label*="play" i], button[title*="play" i], button:has-text("Play"), button:has-text("Reproducir")').count();
  72  |     if (playBtns > 0) {
  73  |       await page.locator('button[aria-label*="play" i], button[title*="play" i], button:has-text("Play"), button:has-text("Reproducir")').first().click();
  74  |       console.log(`   Clicked play button (${playBtns} found)`);
  75  |     } else {
  76  |       console.log('   No play buttons visible');
  77  |     }
  78  |     
  79  |     await page.waitForTimeout(3000);
  80  |     
  81  |     // 5. Verify stream via bunny.net
  82  |     console.log('5. Verifying stream via bunny.net...');
  83  |     const streamResponse = await page.request.get(`${BUNNY_URL}/live.mp3`, { timeout: 10000 });
  84  |     console.log(`   Stream status: ${streamResponse.status()}`);
> 85  |     expect(streamResponse.status()).toBe(200);
      |                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  86  |     
  87  |     // 6. Health check
  88  |     console.log('6. Health check...');
  89  |     const health = await page.request.get(`${BUNNY_URL}/status`);
  90  |     const data = await health.json();
  91  |     console.log('   Health:', data);
  92  |     expect(data.status).toBe('ok');
  93  |     
  94  |     console.log('✅ FULL FLOW VERIFIED');
  95  |   });
  96  |   
  97  |   test('Direct stream via bunny.net', async ({ page }) => {
  98  |     console.log('Testing direct stream...');
  99  |     const response = await page.request.get(`${BUNNY_URL}/live.mp3`, { timeout: 15000 });
  100 |     console.log(`Status: ${response.status()}, Content-Type: ${response.headers()['content-type']}`);
  101 |     expect(response.status()).toBe(200);
  102 |   });
  103 | });
```