import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as tasksApi from '../api/tasks'
import axios from 'axios'

vi.mock('axios', () => {
  const get = vi.fn()
  const create = vi.fn(() => ({ get }))
  return { default: { get, create }, get, create }
})

function mockGetOnce(impl){ axios.get.mockImplementationOnce(impl) }

describe('api/tasks searchTasks', () => {
  beforeEach(() => { vi.resetAllMocks() })

  it('passes only provided filters as query params', async () => {
    mockGetOnce(async (url, { params }) => {
      expect(url).toBe('/tasks/search')
      expect(params).toEqual({ title: 'report', status: 'NEW' })
      return { data: [] }
    })
    await tasksApi.searchTasks({ title: 'report', status: 'NEW', dueDate: '' })
  })

  it('includes dueDate when supplied', async () => {
    mockGetOnce(async (url, { params }) => {
      expect(params).toEqual({ dueDate: '2025-09-21' })
      return { data: [] }
    })
    await tasksApi.searchTasks({ dueDate: '2025-09-21' })
  })

  it('falls back to client filtering when server fails', async () => {
    // First call (server) fails
    mockGetOnce(async () => { throw new Error('boom') })
    // Fallback listTasks call (returns all tasks) -> second get invocation
    mockGetOnce(async () => ({ data: [
      { id: 1, title: 'Alpha Report', status: 'NEW', dueDate: '2025-09-21T10:00:00' },
      { id: 2, title: 'Beta', status: 'PENDING', dueDate: '2025-09-22T10:00:00' }
    ] }))

    const results = await tasksApi.searchTasks({ title: 'report' })
    expect(results.length).toBe(1)
    expect(results[0].title).toBe('Alpha Report')
    // Ensure two GET attempts: /tasks/search then /tasks
    expect(axios.get).toHaveBeenCalledTimes(2)
  })
})
