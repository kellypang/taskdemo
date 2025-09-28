import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTask } from '../api/tasks'
import { STATUSES } from '../models/task'
import { getDateTimeValue } from '../utils/taskUtils'

export default function CreateTask() {
  const navigate = useNavigate()
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: 'NEW',
    dueDate: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  function handleChange(field, value) {
    setTask(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  function validateTask(taskData) {
    const newErrors = {}
    
    if (!taskData.title?.trim()) {
      newErrors.title = 'Title is required'
    } else if (taskData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    }
    
    if (!taskData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    } else {
      const dueDate = new Date(taskData.dueDate)
      const now = new Date()
      if (dueDate <= now) {
        newErrors.dueDate = 'Due date must be in the future'
      }
    }
    
    if (taskData.description?.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }
    
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    const validationErrors = validateTask(task)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setSubmitting(true)
    setErrors({})
    
    try {
      const newTask = await createTask({
        ...task,
        status: task.status || 'NEW'
      })
      
      setMessage('Task created successfully!')
      
      // Redirect to the new task after a short delay
      setTimeout(() => {
        navigate(`/tasks/${newTask.id}`)
      }, 1500)
      
    } catch (error) {
      console.error('Create task error:', error)
      
      if (error.response?.status === 400 && error.response.data) {
        setErrors(error.response.data)
      } else {
        setErrors({ general: 'Failed to create task. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    navigate('/')
  }

  // Format date for datetime-local input
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
    handleChange('dueDate', value ? new Date(value).toISOString() : '')
  }

  return (
    <div className="create-task-page">
      <div className="page-header">
        <h1>Create New Task</h1>
        <p>Fill in the details below to create a new task</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {errors.general && <div className="alert alert-error">{errors.general}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="create-task-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label required">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              value={task.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter a descriptive title for your task"
              className={`form-input ${errors.title ? 'error' : ''}`}
              disabled={submitting}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              value={task.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide additional details about the task (optional)"
              rows={4}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              disabled={submitting}
            />
            <div className="char-count">
              {task.description.length}/500 characters
            </div>
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label required">
                Due Date & Time
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                value={getDateTimeValue(task.dueDate)}
                onChange={(e) => handleDateTimeChange(e.target.value)}
                className={`form-input ${errors.dueDate ? 'error' : ''}`}
                disabled={submitting}
              />
              {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Initial Status
              </label>
              <select
                id="status"
                value={task.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="form-select"
                disabled={submitting}
              >
                {STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
            >
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Creating Task...
                </>
              ) : (
                'Create Task'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="btn btn-secondary btn-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="help-text">
        <h3>Tips for creating effective tasks:</h3>
        <ul>
          <li>Use clear, actionable titles that describe what needs to be done</li>
          <li>Set realistic due dates that allow enough time to complete the work</li>
          <li>Add descriptions for complex tasks to provide context and requirements</li>
          <li>Start with "NEW" status - you can change it later as work progresses</li>
        </ul>
      </div>
    </div>
  )
}