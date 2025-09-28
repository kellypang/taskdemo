import { describe, it, expect, vi } from 'vitest'
import * as tasksApi from '../api/tasks'
import axios from 'axios'

// Mock axios to control responses
vi.mock('axios', () => {
  const get = vi.fn()
  return { default: { get }, get }
})

describe('listTasks normalization', () => {
  it('returns array when backend returns array', async () => {
    axios.get.mockResolvedValue({ data: [ { id: 1 }, { id: 2 } ] })
    const list = await tasksApi.listTasks()
    expect(list.length).toBe(2)
  })
  it('extracts content when backend returns paged object', async () => {
    axios.get.mockResolvedValue({ data: { content: [ { id: 3 } ] } })
    const list = await tasksApi.listTasks()
    expect(list).toEqual([ { id: 3 } ])
  })
  it('extracts items when backend returns items array', async () => {
    axios.get.mockResolvedValue({ data: { items: [ { id: 4 } ] } })
    const list = await tasksApi.listTasks()
    expect(list).toEqual([ { id: 4 } ])
  })
  it('extracts data.data when nested array present', async () => {
    axios.get.mockResolvedValue({ data: { data: [ { id: 5 } ] } })
    const list = await tasksApi.listTasks()
    expect(list).toEqual([ { id: 5 } ])
  })
  it('returns empty array on unknown shape', async () => {
    axios.get.mockResolvedValue({ data: { unexpected: true } })
    const list = await tasksApi.listTasks()
    expect(list).toEqual([])
  })
})
