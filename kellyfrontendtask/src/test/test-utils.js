import { vi } from 'vitest'
import axios from 'axios'

// Central axios mock facade. We rely on vitest manual mocking pattern.
// This helper assumes tests will run `vi.mock('axios', ...)` OR that axios functions are already spies.
// Provide consistent queueing of GET responses in order.
export function futureISO(hours = 1) {
  return new Date(Date.now() + hours * 3600_000).toISOString()
}

export function queueGet(data) {
  // Each call returns the provided data once.
  axios.get.mockImplementationOnce(async () => ({ data }))
}

export function setupAxiosMock() {
  // Ensure all primary http verbs are spies; create() returns same spies.
  const get = axios.get || vi.fn()
  const post = axios.post || vi.fn()
  const put = axios.put || vi.fn()
  const del = axios.delete || vi.fn()
  // If not already mocked, wrap them.
  if (!vi.isMockFunction(get)) axios.get = vi.fn()
  if (!vi.isMockFunction(post)) axios.post = vi.fn()
  if (!vi.isMockFunction(put)) axios.put = vi.fn()
  if (!vi.isMockFunction(del)) axios.delete = vi.fn()
  return axios
}

export function resetAxios() {
  axios.get.mockReset()
  axios.post.mockReset()
  axios.put.mockReset()
  axios.delete.mockReset()
}
