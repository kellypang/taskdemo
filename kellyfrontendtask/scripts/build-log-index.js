#!/usr/bin/env node
import { readdirSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'test-logs')
let entries = []
try {
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.html')) {
      const full = join(dir, f)
      const st = statSync(full)
      entries.push({ f, m: st.mtimeMs })
    }
  }
} catch {
  // no directory yet
}
entries.sort((a,b) => b.m - a.m)
const list = entries.map(e => `<li><a href="${e.f}">${e.f}</a></li>`).join('\n') || '<li>No logs yet.</li>'
const html = `<!DOCTYPE html><html><head><meta charset='utf-8'/><title>Test Logs Index</title><style>body{font-family:system-ui,Arial,sans-serif;padding:24px;} ul{line-height:1.5;} a{text-decoration:none;color:#0a58ca;} h1{margin-top:0;} code{background:#f5f5f5;padding:2px 4px;border-radius:4px;}</style></head><body><h1>Test Logs Index</h1><p>Generated at ${new Date().toISOString()}</p><ul>${list}</ul><p>Generate a new log: <code>npm run test:logs</code></p></body></html>`
if (entries.length) {
  writeFileSync(join(dir, 'index.html'), html, 'utf8')
  console.log('Wrote test-logs/index.html')
}
