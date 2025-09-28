// @ts-check
import { defineConfig, devices } from '@playwright/test'
import { execSync } from 'child_process'

// Skip browser download and use system browsers on Alpine
process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1';
process.env.PLAYWRIGHT_BROWSERS_PATH = '0';

// Detect Alpine (musl) to avoid chromium posix_fallocate64 issue; prefer firefox which is often more portable.
const isAlpine = (() => {
  try { return require('fs').readFileSync('/etc/os-release','utf-8').toLowerCase().includes('alpine') } catch { return false }
})();

// Check for system browsers on Alpine
const hasSystemChromium = (() => {
  try { execSync('which chromium-browser', { stdio: 'ignore' }); return true } catch { return false }
})();

const hasSystemFirefox = (() => {
  try { execSync('which firefox', { stdio: 'ignore' }); return true } catch { return false }
})();

// Allow override via PLAYWRIGHT_BROWSER env; otherwise pick the best available browser
let defaultBrowser = process.env.PLAYWRIGHT_BROWSER;
if (!defaultBrowser) {
  if (isAlpine) {
    if (hasSystemFirefox) {
      defaultBrowser = 'firefox';
    } else if (hasSystemChromium) {
      defaultBrowser = 'chromium';
    } else {
      defaultBrowser = 'webkit'; // fallback
    }
  } else {
    defaultBrowser = 'chromium';
  }
}

console.log(`[playwright-config] Using browser: ${defaultBrowser} on ${isAlpine ? 'Alpine' : 'other'} OS`);

export default defineConfig({
  testDir: './tests-e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  outputDir: './test-results-e2e',
  // On Alpine, prioritize API-only tests to avoid browser installation issues
  testMatch: isAlpine ? ['**/api-only.spec.js'] : ['**/*.spec.{js,ts}'],
  use: {
    baseURL: process.env.E2E_FRONTEND_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  projects: [
    {
      name: defaultBrowser,
      use: { 
        ...devices['Desktop Chrome'], 
        browserName: defaultBrowser === 'firefox' ? 'firefox' : 
                    defaultBrowser === 'webkit' ? 'webkit' : 'chromium',
        // Use system browsers on Alpine
        ...(isAlpine && {
          launchOptions: {
            executablePath: defaultBrowser === 'firefox' ? '/usr/bin/firefox' :
                           hasSystemChromium ? '/usr/bin/chromium-browser' : 
                           '/usr/bin/chromium'
          }
        })
      }
    }
  ]
})