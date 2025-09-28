// Fallback (will be overridden if backend /tasks/statuses call succeeds)
export let STATUSES = ['NEW', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'CANCELLED']

export function setStatuses(list) {
  if (Array.isArray(list) && list.length) {
    STATUSES = list.slice()
  }
}

// Lazy loader (returns current list even if fetch fails)
export async function loadStatuses(fetcher) {
  try {
    const remote = await fetcher()
    setStatuses(remote)
  } catch (_) {
    // swallow – keep fallback
  }
  return STATUSES
}

export function getDueDate(task) {
  if (!task) return null
  // Normalized property name possibilities
  const raw = task.dueDate || task.due_date || task.duedate
  return raw ? new Date(raw) : null
}

export function formatDisplayDate(date) {
  if (!date) return ''
  try {
    return date.toISOString().slice(0, 10)
  } catch (_) {
    return ''
  }
}
