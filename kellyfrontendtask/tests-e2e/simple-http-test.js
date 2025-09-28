#!/usr/bin/env node
// Simple HTTP test that doesn't require browser installation
// This serves as a fallback for environments where Playwright can't install browsers

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const FRONTEND_URL = process.env.E2E_FRONTEND_URL || 'http://localhost:3000'
const BACKEND_URL = process.env.E2E_BACKEND_URL || process.env.E2E_BASE_URL || 'http://localhost:4000'

console.log('Running simple HTTP-based E2E tests...')
console.log(`Frontend URL: ${FRONTEND_URL}`)
console.log(`Backend URL: ${BACKEND_URL}`)

async function httpTest(url, testName) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      console.log(`✓ ${testName}: ${response.status} ${response.statusText}`)
      return true
    } else {
      console.log(`✗ ${testName}: ${response.status} ${response.statusText}`)
      return false
    }
  } catch (error) {
    console.log(`✗ ${testName}: ${error.message}`)
    return false
  }
}

async function apiTest(url, testName) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      console.log(`✓ ${testName}: API responded with data (${JSON.stringify(data).substring(0, 50)}...)`)
      return true
    } else {
      console.log(`✗ ${testName}: ${response.status} ${response.statusText}`)
      return false
    }
  } catch (error) {
    console.log(`✗ ${testName}: ${error.message}`)
    return false
  }
}

async function runTests() {
  const tests = []
  
  // Test frontend availability
  tests.push(await httpTest(FRONTEND_URL, 'Frontend Health Check'))
  
  // Test backend API endpoints
  tests.push(await apiTest(`${BACKEND_URL}/api/tasks`, 'Backend API - List Tasks'))
  tests.push(await httpTest(`${BACKEND_URL}/health`, 'Backend Health Check'))
  tests.push(await httpTest(`${BACKEND_URL}/actuator/health`, 'Backend Actuator Health'))
  
  const passed = tests.filter(Boolean).length
  const total = tests.length
  
  console.log(`\nTest Results: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('✓ All HTTP E2E tests passed!')
    process.exit(0)
  } else {
    console.log('✗ Some HTTP E2E tests failed')
    process.exit(1)
  }
}

runTests().catch(error => {
  console.error('Test runner error:', error)
  process.exit(1)
})