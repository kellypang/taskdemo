// Use proper named import for Playwright test; there is no default export.
// We alias `test` to `base` so we can create our extended test with fixtures.
import { test as base, expect, Page, TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Extended test that captures HTML of any navigation or response with status >=400.
// Waits until at least one task row appears or times out.
async function waitForTasks(page: Page, { timeout = 8000 }: { timeout?: number } = {}): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const rows = await page.$$('[data-testid="task-row"], tr.task-row')
      if (rows.length > 0) return true
    } catch (_) { /* ignore */ }
    await page.waitForTimeout(250)
  }
  return false
}

export const test = base.extend<{
  waitForTasks: (page: Page, opts?: { timeout?: number }) => Promise<boolean>
}>({
  // Expose helper via fixture
  waitForTasks: async ({}, use) => { await use(waitForTasks); },
  // Augment the existing page fixture to capture failing HTML responses automatically
  page: async ({ page }, use, testInfo: TestInfo) => {
    const artifactsDir = path.join(testInfo.project.outputDir, 'error-pages');
    if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

  // NOTE: page.on('response') provides a Response, not APIResponse.
  // Using APIResponse caused a TypeScript overload mismatch.
  const responseListener = async (response: import('@playwright/test').Response) => {
      try {
        const status = response.status();
        if (status >= 400 && response.headers()['content-type']?.includes('text/html')) {
          const urlSafe = response.url().replace(/[^a-z0-9]+/gi, '_').slice(0, 120);
          const file = path.join(artifactsDir, `${Date.now()}_${status}_${urlSafe}.html`);
          const body = await response.text();
          fs.writeFileSync(file, body, 'utf-8');
          testInfo.attachments.push({ name: `html-error-${status}`, contentType: 'text/html', path: file });
        }
      } catch (_) { /* ignore individual failures capturing artifacts */ }
    };

    page.on('response', responseListener);
    try {
      await use(page);
    } finally {
      // Clean up listener to avoid memory leak across workers
      page.off('response', responseListener);
    }
  }
});

export const expectEx = expect;
// Also re-export expect under its original name so test files can import { expect } from './fixtures.js'
export { waitForTasks, expect };
