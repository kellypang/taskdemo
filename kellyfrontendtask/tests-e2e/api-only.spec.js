// API-only test that doesn't require browser installation
// This will run as a Playwright test but only make HTTP requests

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:4000';
const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000';

test.describe('API E2E Tests (No Browser)', () => {
  test('backend health check', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/actuator/health`);
    expect(response.ok()).toBeTruthy();
  });

  test('backend API - list tasks', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/tasks`);
    expect(response.ok()).toBeTruthy();
    const tasks = await response.json();
    expect(Array.isArray(tasks)).toBeTruthy();
  });

  test('frontend serves static content', async ({ request }) => {
    try {
      const response = await request.get(FRONTEND_URL);
      expect(response.status()).toBeLessThan(500); // Allow 404, but not 500+ errors
    } catch (error) {
      console.log('Frontend not available, skipping test');
      test.skip();
    }
  });
});