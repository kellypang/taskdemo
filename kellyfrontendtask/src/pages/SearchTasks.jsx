import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchTasks } from '../api/tasks'
import { STATUSES, formatDisplayDate, getDueDate } from '../models/task'
import { getStatusColor, isOverdue } from '../utils/taskUtils'

export default function SearchTasks() {
  const [filters, setFilters] = useState({ 
    title: '', 
    dueDate: '', 
    status: '',
    dueDateRange: 'any' // any, today, this_week, overdue
  })
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState('')
  const [sort, setSort] = useState({ field: 'dueDate', dir: 'asc' })

  function change(field, value) { 
    setFilters(prev => ({ ...prev, [field]: value }))
    // Clear specific date when using date range filter
    if (field === 'dueDateRange' && value !== 'specific') {
      setFilters(prev => ({ ...prev, dueDate: '' }))
    }
  }

  function getDateRangeValue() {
    const now = new Date()
    switch (filters.dueDateRange) {
      case 'today':
        return now.toISOString().split('T')[0]
      case 'this_week':
        const nextWeek = new Date(now)
        nextWeek.setDate(now.getDate() + 7)
        return nextWeek.toISOString().split('T')[0]
      case 'overdue':
        return 'overdue'
      default:
        return filters.dueDate
    }
  }

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Prepare search filters
      const searchFilters = {
        title: filters.title.trim(),
        status: filters.status
      }
      
      // Handle date filtering
      if (filters.dueDateRange === 'specific' && filters.dueDate) {
        searchFilters.dueDate = filters.dueDate
      }
      
      let data = await searchTasks(searchFilters)
      
      // Apply client-side filtering for special date ranges
      if (filters.dueDateRange === 'today') {
        const today = new Date().toISOString().split('T')[0]
        data = data.filter(task => {
          const taskDate = getDueDate(task)
          return taskDate && taskDate.toISOString().split('T')[0] === today
        })
      } else if (filters.dueDateRange === 'this_week') {
        const now = new Date()
        const nextWeek = new Date(now)
        nextWeek.setDate(now.getDate() + 7)
        data = data.filter(task => {
          const taskDate = getDueDate(task)
          return taskDate && taskDate >= now && taskDate <= nextWeek
        })
      } else if (filters.dueDateRange === 'overdue') {
        const now = new Date()
        data = data.filter(task => {
          const taskDate = getDueDate(task)
          return taskDate && taskDate < now && task.status !== 'COMPLETED'
        })
      }
      
      setResults(data)
      setSelected(null)
      setSearched(true)
      setMessage(`${data.length} result${data.length === 1 ? '' : 's'} found`)
    } catch (err) {
      console.error('Search failed', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setFilters({ title: '', dueDate: '', status: '', dueDateRange: 'any' })
    setResults([])
    setSelected(null)
    setSearched(false)
    setError(null)
    setMessage('')
  }

  function toggleSort(field) {
    setSort(prev => 
      prev.field === field 
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' } 
        : { field, dir: 'asc' }
    )
  }

  function getSortedResults() {
    const sorted = [...results]
    const { field, dir } = sort
    
    sorted.sort((a, b) => {
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
    
    return sorted
  }

  function isOverdue(task) {
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

  const sortedResults = getSortedResults()

  return (
    <div className="search-page">
      <div className="page-header">
        <h1>Search Tasks</h1>
        <p>Find tasks using various filters and criteria</p>
      </div>

      <div className="search-container">
        <div className="search-form-container">
          <h3>Search Filters</h3>
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="search-title">Title Contains</label>
                <input 
                  id="search-title" 
                  type="text"
                  value={filters.title} 
                  onChange={e => change('title', e.target.value)} 
                  placeholder="Enter keywords to search in task titles"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="search-status">Status</label>
                <select 
                  id="search-status" 
                  value={filters.status} 
                  onChange={e => change('status', e.target.value)}
                  className="form-select"
                >
                  <option value="">Any Status</option>
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date-range">Due Date</label>
              <select 
                id="date-range"
                value={filters.dueDateRange} 
                onChange={e => change('dueDateRange', e.target.value)}
                className="form-select"
              >
                <option value="any">Any Date</option>
                <option value="today">Due Today</option>
                <option value="this_week">Due This Week</option>
                <option value="overdue">Overdue</option>
                <option value="specific">Specific Date</option>
              </select>
              
              {filters.dueDateRange === 'specific' && (
                <input 
                  type="date" 
                  value={filters.dueDate} 
                  onChange={e => change('dueDate', e.target.value)}
                  className="form-input"
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Searching...' : 'Search Tasks'}
              </button>
              <button 
                type="button" 
                onClick={handleClear}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>

        {/* Messages */}
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Results */}
        {searched && !loading && sortedResults.length === 0 && !error && (
          <div className="no-results">
            <h3>No Results Found</h3>
            <p>No tasks match your search criteria. Try adjusting your filters or <Link to="/tasks/new">create a new task</Link>.</p>
          </div>
        )}

        {sortedResults.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <h3>Search Results ({sortedResults.length})</h3>
              <Link to="/" className="btn btn-secondary">View All Tasks</Link>
            </div>
            
            <div className="results-table-container">
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
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((task) => (
                    <tr 
                      key={task.id} 
                      className={`task-row ${isOverdue(task) ? 'overdue' : ''} ${selected?.id === task.id ? 'selected' : ''}`}
                      onClick={() => setSelected(task)}
                    >
                      <td>{task.tasknum || task.id}</td>
                      <td>
                        <Link to={`/tasks/${task.id}`} className="task-link">
                          {task.title}
                        </Link>
                        {isOverdue(task) && <span className="overdue-badge">OVERDUE</span>}
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(task.status) }}
                        >
                          {task.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={isOverdue(task) ? 'due-date overdue' : 'due-date'}>
                        {formatDisplayDate(getDueDate(task))}
                      </td>
                      <td className="description-cell">
                        {task.description ? (
                          <span title={task.description}>
                            {task.description.length > 50 
                              ? `${task.description.substring(0, 50)}...` 
                              : task.description
                            }
                          </span>
                        ) : (
                          <em>No description</em>
                        )}
                      </td>
                      <td>
                        <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-view">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
