// NOTE: Explicit .js extension required under NodeNext/Node16 moduleResolution.
import { test, expect, waitForTasks } from './fixtures.js';

// Simple sample test hitting baseURL root. Extend or replace with real tests.

test('root page loads and tasks eventually visible (if any)', async ({ page }) => {
  await page.goto('/');
  const ok = await waitForTasks(page, { timeout: 10000 })
  // Soft expect: if tasks exist they should show; if none exist we don't fail here.
  if (ok) {
    const rows = await page.$$('[data-testid="task-row"], tr.task-row')
    expect(rows.length).toBeGreaterThan(0)
  } else {
    console.log('[e2e] No task rows appeared within timeout; continuing (may be zero task state).')
  }
});
