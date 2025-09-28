import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTasks, deleteTask, updateStatus } from '../api/tasks'
import { formatDisplayDate, getDueDate, STATUSES } from '../models/task'
import { getStatusColor, isOverdue } from '../utils/taskUtils'

export default function TaskListView() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [sort, setSort] = useState({ field: 'dueDate', dir: 'asc' })
  const [filter, setFilter] = useState({ status: 'all', search: '' })
  const [statusUpdating, setStatusUpdating] = useState(null)

  async function loadTasks() {
    setLoading(true)
    setError(null)
    try {
      const data = await listTasks()
      const arr = Array.isArray(data) ? data : []
      setTasks(arr)
    } catch (e) {
      setError('Failed to load tasks')
      console.error('Load tasks error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  function toggleSort(field) {
    setSort(prev => 
      prev.field === field 
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' } 
        : { field, dir: 'asc' }
    )
  }

  function getSortedAndFilteredTasks() {
    let filteredTasks = [...tasks]
    
    // Apply status filter
    if (filter.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filter.status)
    }
    
    // Apply search filter
    if (filter.search.trim()) {
      const searchTerm = filter.search.toLowerCase().trim()
      filteredTasks = filteredTasks.filter(task => 
        task.title?.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Apply sorting
    const { field, dir } = sort
    filteredTasks.sort((a, b) => {
      let av = a[field]
      let bv = b[field]
      
      if (field === 'dueDate') {
        av = getDueDate(a)?.getTime() || 0
        bv = getDueDate(b)?.getTime() || 0
      }
      
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      
      if (av < bv) return dir === 'asc' ? -1 : 1
      if (av > bv) return dir === 'asc' ? 1 : -1
      return 0
    })
    
    return filteredTasks
  }

  async function handleDelete(task) {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return
    
    try {
      await deleteTask(task.id)
      setMessage(`Task "${task.title}" deleted successfully`)
      setTimeout(() => setMessage(''), 3000)
      await loadTasks()
    } catch (e) {
      setError(`Failed to delete task: ${e.message}`)
      console.error('Delete error:', e)
    }
  }

  async function handleStatusChange(task, newStatus) {
    setStatusUpdating(task.id)
    try {
      await updateStatus(task.id, newStatus)
      setMessage(`Task status updated to ${newStatus}`)
      setTimeout(() => setMessage(''), 3000)
      await loadTasks()
    } catch (e) {
      setError(`Failed to update status: ${e.message}`)
      console.error('Status update error:', e)
    } finally {
      setStatusUpdating(null)
    }
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

  function isOverdue(task) {
    const dueDate = getDueDate(task)
    return dueDate && dueDate < new Date() && task.status !== 'COMPLETED'
  }

  const filteredTasks = getSortedAndFilteredTasks()
  const taskStats = {
    total: tasks.length,
    new: tasks.filter(t => t.status === 'NEW').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => isOverdue(t)).length
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Task Management Dashboard</h1>
        <Link to="/tasks/new" className="btn btn-primary">+ Create New Task</Link>
      </div>

      {/* Task Statistics */}
      <div className="task-stats">
        <div className="stat-card">
          <div className="stat-number">{taskStats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{taskStats.new}</div>
          <div className="stat-label">New</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{taskStats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{taskStats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-number">{taskStats.overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <label>Filter by Status:</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Tasks</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{status.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <Link to="/tasks/search" className="btn btn-secondary">Advanced Search</Link>
      </div>

      {/* Messages */}
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading State */}
      {loading && <div className="loading">Loading tasks...</div>}

      {/* Task Table */}
      {!loading && (
        <div className="task-table-container">
          <div className="table-header">
            <h3>All Tasks ({filteredTasks.length})</h3>
          </div>
          
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks found.</p>
              <Link to="/tasks/new" className="btn btn-primary">Create your first task</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>
                      <button 
                        className="sort-button" 
                        onClick={() => toggleSort('title')}
                      >
                        Title {sort.field === 'title' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th>
                      <button 
                        className="sort-button" 
                        onClick={() => toggleSort('status')}
                      >
                        Status {sort.field === 'status' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th>
                      <button 
                        className="sort-button" 
                        onClick={() => toggleSort('dueDate')}
                      >
                        Due Date {sort.field === 'dueDate' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, index) => (
                    <tr 
                      key={task.id} 
                      className={`task-row ${isOverdue(task) ? 'overdue' : ''}`}
                    >
                      <td>{task.tasknum || task.id}</td>
                      <td className="task-title">
                        <Link to={`/tasks/${task.id}`} className="task-link">
                          {task.title}
                        </Link>
                        {isOverdue(task) && <span className="overdue-badge">OVERDUE</span>}
                      </td>
                      <td>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          disabled={statusUpdating === task.id}
                          className="status-select"
                          style={{ color: getStatusColor(task.status) }}
                        >
                          {STATUSES.map(status => (
                            <option key={status} value={status}>
                              {status.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        {statusUpdating === task.id && <span className="updating">Updating...</span>}
                      </td>
                      <td className={isOverdue(task) ? 'due-date overdue' : 'due-date'}>
                        {formatDisplayDate(getDueDate(task))}
                      </td>
                      <td className="actions">
                        <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-view">View</Link>
                        <button
                          onClick={() => handleDelete(task)}
                          className="btn btn-sm btn-danger"
                          title="Delete task"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
