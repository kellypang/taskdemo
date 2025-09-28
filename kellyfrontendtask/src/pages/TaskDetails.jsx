import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTask, updateTask, deleteTask, updateStatus } from '../api/tasks'
import { formatDisplayDate, getDueDate, STATUSES } from '../models/task'
import { getStatusColor, isOverdue, getDateTimeValue } from '../utils/taskUtils'

export default function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [updateErrors, setUpdateErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  async function loadTask() {
    if (!id) return
    setLoading(true)
    setError(null)
    
    try {
      const taskData = await getTask(id)
      setTask(taskData)
      setEditForm({
        title: taskData.title || '',
        description: taskData.description || '',
        dueDate: taskData.dueDate || '',
        status: taskData.status || 'NEW'
      })
    } catch (e) {
      console.error('Load task error:', e)
      if (e.response?.status === 404) {
        setError('Task not found')
      } else {
        setError('Failed to load task details')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTask()
  }, [id])

  function handleEditChange(field, value) {
    setEditForm(prev => ({ ...prev, [field]: value }))
    if (updateErrors[field]) {
      setUpdateErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  function validateEditForm() {
    const errors = {}
    
    if (!editForm.title?.trim()) {
      errors.title = 'Title is required'
    } else if (editForm.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long'
    }
    
    if (!editForm.dueDate) {
      errors.dueDate = 'Due date is required'
    } else {
      const dueDate = new Date(editForm.dueDate)
      const now = new Date()
      if (dueDate <= now) {
        errors.dueDate = 'Due date must be in the future'
      }
    }
    
    if (editForm.description?.length > 500) {
      errors.description = 'Description must be less than 500 characters'
    }
    
    return errors
  }

  async function handleSaveEdit() {
    const errors = validateEditForm()
    if (Object.keys(errors).length > 0) {
      setUpdateErrors(errors)
      return
    }
    
    setSubmitting(true)
    setUpdateErrors({})
    
    try {
      const updatedTask = await updateTask({ id: task.id, ...editForm })
      setTask(updatedTask)
      setIsEditing(false)
      setMessage('Task updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      console.error('Update task error:', e)
      if (e.response?.status === 400 && e.response.data) {
        setUpdateErrors(e.response.data)
      } else {
        setUpdateErrors({ general: 'Failed to update task. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setUpdateErrors({})
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate || '',
      status: task.status || 'NEW'
    })
  }

  async function handleStatusChange(newStatus) {
    setStatusUpdating(true)
    try {
      const updatedTask = await updateStatus(task.id, newStatus)
      setTask(updatedTask)
      setMessage(`Status updated to ${newStatus}`)
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      console.error('Status update error:', e)
      setError('Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return
    
    try {
      await deleteTask(task.id)
      navigate('/', { 
        state: { message: `Task "${task.title}" deleted successfully` }
      })
    } catch (e) {
      console.error('Delete task error:', e)
      setError('Failed to delete task')
    }
  }

  function getDateTimeValue(dateValue) {
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

  function handleDateTimeChange(value) {
    handleEditChange('dueDate', value ? new Date(value).toISOString() : '')
  }

  function isOverdue() {
    if (!task) return false
    const dueDate = getDueDate(task)
    return dueDate && dueDate < new Date() && task.status !== 'COMPLETED'
  }

  function getStatusColor(status) {
    switch (status?.toUpperCase()) {
      case 'NEW': return '#007bff'
      case 'IN_PROGRESS': return '#ffc107'
      case 'COMPLETED': return '#28a745'
      case 'CANCELLED': return '#dc3545'
      default: return '#6c757d'
    }
  }

  if (loading) {
    return <div className="loading-page">Loading task details...</div>
  }

  if (error) {
    return (
      <div className="error-page">
        <h1>Error</h1>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Back to Tasks</Link>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="error-page">
        <h1>Task Not Found</h1>
        <p>The requested task could not be found.</p>
        <Link to="/" className="btn btn-primary">Back to Tasks</Link>
      </div>
    )
  }

  return (
    <div className="task-details-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <Link to="/">All Tasks</Link>
        <span className="separator">›</span>
        <span className="current">Task #{task.tasknum || task.id}</span>
      </nav>

      {/* Messages */}
      {message && <div className="alert alert-success">{message}</div>}
      {updateErrors.general && <div className="alert alert-error">{updateErrors.general}</div>}

      <div className="task-details-container">
        <div className="task-header">
          <div className="task-header-content">
            {isEditing ? (
              <div className="edit-title">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className={`title-input ${updateErrors.title ? 'error' : ''}`}
                  placeholder="Task title"
                />
                {updateErrors.title && <div className="error-message">{updateErrors.title}</div>}
              </div>
            ) : (
              <h1 className="task-title">
                {task.title}
                {isOverdue() && <span className="overdue-badge">OVERDUE</span>}
              </h1>
            )}
            
            <div className="task-meta">
              <span className="task-id">Task #{task.tasknum || task.id}</span>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {task.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="task-actions">
            {!isEditing ? (
              <>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Task
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete Task
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-success"
                  onClick={handleSaveEdit}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="task-content">
          <div className="task-details-grid">
            <div className="detail-section">
              <h3>Description</h3>
              {isEditing ? (
                <div>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    className={`form-textarea ${updateErrors.description ? 'error' : ''}`}
                    rows={6}
                    placeholder="Task description (optional)"
                  />
                  <div className="char-count">
                    {editForm.description?.length || 0}/500 characters
                  </div>
                  {updateErrors.description && <div className="error-message">{updateErrors.description}</div>}
                </div>
              ) : (
                <p className="task-description">
                  {task.description || <em>No description provided</em>}
                </p>
              )}
            </div>

            <div className="detail-section">
              <h3>Due Date & Time</h3>
              {isEditing ? (
                <div>
                  <input
                    type="datetime-local"
                    value={getDateTimeValue(editForm.dueDate)}
                    onChange={(e) => handleDateTimeChange(e.target.value)}
                    className={`form-input ${updateErrors.dueDate ? 'error' : ''}`}
                  />
                  {updateErrors.dueDate && <div className="error-message">{updateErrors.dueDate}</div>}
                </div>
              ) : (
                <p className={`due-date ${isOverdue() ? 'overdue' : ''}`}>
                  {formatDisplayDate(getDueDate(task))}
                  {isOverdue() && <span className="overdue-text"> (Overdue)</span>}
                </p>
              )}
            </div>

            <div className="detail-section">
              <h3>Status</h3>
              <div className="status-controls">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdating || isEditing}
                  className="status-select"
                  style={{ color: getStatusColor(task.status) }}
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {statusUpdating && <span className="updating">Updating...</span>}
              </div>
            </div>

            <div className="detail-section">
              <h3>Task Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Created:</span>
                  <span className="info-value">
                    {task.createdAt ? formatDisplayDate(new Date(task.createdAt)) : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Updated:</span>
                  <span className="info-value">
                    {task.updatedAt ? formatDisplayDate(new Date(task.updatedAt)) : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Priority:</span>
                  <span className="info-value">
                    {isOverdue() ? 'HIGH (Overdue)' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}