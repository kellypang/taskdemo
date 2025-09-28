import axios from 'axios'

// Support test environment where axios is module-mocked and create() may be undefined
const baseURL = import.meta?.env?.VITE_API_BASE || '/api'
const client = typeof axios.create === 'function' ? axios.create({ baseURL }) : axios

// ---- Core CRUD ----
export async function listTasks() {
  const { data } = await client.get('/tasks')
  // Normalization: backend currently returns a simple array. If future pagination wraps it,
  // accept objects like { content: [...], items: [...], data: [...] }.
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.content)) return data.content
  if (data && Array.isArray(data.items)) return data.items
  if (data && Array.isArray(data.data)) return data.data
  return []
}

export async function getTask(id) {
  const { data } = await client.get(`/tasks/${id}`)
  return data
}

export async function createTask(task) {
  const { data } = await client.post('/tasks', task)
  return data
}

export async function updateTask(task) {
  const { id, ...rest } = task
  const { data } = await client.put(`/tasks/${id}`, rest)
  return data
}

export async function deleteTask(id) {
  await client.delete(`/tasks/${id}`)
}

// Align with backend: PUT /tasks/{id}/status?status=VALUE
export async function updateStatus(id, status) {
  const { data } = await client.put(`/tasks/${id}/status`, null, { params: { status } })
  return data
}

// ---- Extended Queries ----
export async function listStatuses() {
  const { data } = await client.get('/tasks/statuses')
  return data
}

// Search tasks using backend endpoint when possible; fallback to in-memory filter.
// Backend: GET /tasks/search?title=&status=&dueDate=YYYY-MM-DD (all params optional)
export async function searchTasks(filters = {}) {
  const { title = '', dueDate = '', status = '' } = filters
  const hasFilters = !!(title || dueDate || status)
  // Try server search first when any filter supplied (or even none, acts like list)
  try {
    const params = {}
    if (title) params.title = title
    if (status) params.status = status
    if (dueDate) params.dueDate = dueDate
    const { data } = await client.get('/tasks/search', { params })
    return data
  } catch (err) {
    // Fallback (silently) to client-side filtering of full list
    console.warn('[tasks.searchTasks] backend search failed, falling back to client filtering', err?.message)
    const all = await listTasks()
    return all.filter(t => {
      if (title && !t.title?.toLowerCase().includes(title.toLowerCase())) return false
      if (status && t.status !== status) return false
      if (dueDate) {
        const d = (t.dueDate || '').slice(0,10)
        if (d !== dueDate) return false
      }
      return true
    })
  }
}

