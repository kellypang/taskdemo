import { getDueDate } from '../models/task'

/**
 * Get color for task status
 */
export function getStatusColor(status) {
  switch (status?.toUpperCase()) {
    case 'NEW': return '#007bff'
    case 'IN_PROGRESS': return '#ffc107'
    case 'COMPLETED': return '#28a745'
    case 'CANCELLED': return '#dc3545'
    default: return '#6c757d'
  }
}

/**
 * Check if a task is overdue
 */
export function isOverdue(task) {
  const dueDate = getDueDate(task)
  return dueDate && dueDate < new Date() && task.status !== 'COMPLETED'
}

/**
 * Format date for datetime-local input
 */
export function getDateTimeValue(dateValue) {
  if (!dateValue) return ''
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return ''
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch {
    return ''
  }
}