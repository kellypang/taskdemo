#!/usr/bin/env node
// Attempt a resilient Playwright browser install that works on Alpine.
// Falls back to chromium-only if full install fails.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// Check if browser download should be skipped
if (process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === '1') {
  console.log('[playwright-install] PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1, skipping browser installation')
  process.exit(0)
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit' })
  return r.status === 0
}

const isAlpine = (() => {
  try { 
    return readFileSync('/etc/os-release','utf-8').toLowerCase().includes('alpine') 
  } catch { 
    return false 
  }
})()

console.log('[playwright-install] isAlpine:', isAlpine)

if (isAlpine) {
  console.log('[playwright-install] Alpine detected: using system browsers to avoid dependency issues.')
  
  // Check if system browsers are available
  const systemChromium = spawnSync('which', ['chromium-browser'], { stdio: 'pipe' }).status === 0
  const systemFirefox = spawnSync('which', ['firefox'], { stdio: 'pipe' }).status === 0
  
  if (systemChromium || systemFirefox) {
    console.log('[playwright-install] System browsers found. Skipping Playwright browser download.')
    console.log('[playwright-install] Available browsers:', 
      systemChromium ? 'chromium' : '', 
      systemFirefox ? 'firefox' : ''
    )
    
    // Set environment variable to use system browsers
    process.env.PLAYWRIGHT_BROWSERS_PATH = '0'
    console.log('[playwright-install] Set PLAYWRIGHT_BROWSERS_PATH=0 to use system browsers')
    
    // Try to install just the browser drivers/binaries without dependencies
    console.log('[playwright-install] Installing browser drivers only...')
    if (systemFirefox) {
      run('npx', ['playwright', 'install', 'firefox', '--no-deps']) ||
      run('npx', ['playwright', 'install', 'firefox'])
    }
    if (systemChromium) {
      run('npx', ['playwright', 'install', 'chromium', '--no-deps']) ||
      run('npx', ['playwright', 'install', 'chromium'])
    }
  } else {
    console.log('[playwright-install] No system browsers found, trying fallback installation.')
    // Install additional fonts that might be needed
    run('apk', ['add', '--no-cache', 'font-noto-emoji', 'ttf-liberation', 'wqy-microhei'])
    
    console.log('[playwright-install] trying firefox without system deps (chromium has known musl issues).')
    if (!run('npx', ['playwright', 'install', 'firefox'])) {
      console.warn('[playwright-install] firefox install failed; trying webkit as fallback.')
      if (!run('npx', ['playwright', 'install', 'webkit'])) {
        console.warn('[playwright-install] webkit also failed; trying chromium without deps.')
        run('npx', ['playwright', 'install', 'chromium'])
      }
    }
  }
} else {
  if (!run('npx', ['playwright', 'install', '--with-deps'])) {
    console.warn('[playwright-install] Full install failed, retrying chromium only...')
    run('npx', ['playwright', 'install', 'chromium'])
  }
}