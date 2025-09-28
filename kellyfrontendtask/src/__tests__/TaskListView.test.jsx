import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import TaskListView from '../pages/TaskListView'
import * as api from '../api/tasks'

// Mock the API
vi.mock('../api/tasks', () => ({
  listTasks: vi.fn(),
  deleteTask: vi.fn(),
  updateStatus: vi.fn()
}))

// Mock react-router-dom's useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({ pathname: '/', state: null })
  }
})

const future = () => new Date(Date.now() + 86400000).toISOString()

function renderTaskListView() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TaskListView />
    </BrowserRouter>
  )
}

describe('TaskListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task dashboard with statistics', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'NEW', dueDate: future() },
      { id: 2, title: 'Task 2', status: 'IN_PROGRESS', dueDate: future() },
      { id: 3, title: 'Task 3', status: 'COMPLETED', dueDate: future() }
    ]
    
    api.listTasks.mockResolvedValueOnce(mockTasks)
    
    renderTaskListView()
    
    await waitFor(() => expect(api.listTasks).toHaveBeenCalled())
    
    // Check dashboard elements
    expect(screen.getByText('Task Management Dashboard')).toBeInTheDocument()
    expect(screen.getByText('+ Create New Task')).toBeInTheDocument()
    
    // Check statistics - use more specific selector
    expect(screen.getByText('Total Tasks')).toBeInTheDocument()
    const statsSection = screen.getByText('Total Tasks').closest('.stat-card')
    expect(statsSection.querySelector('.stat-number')).toHaveTextContent('3')
    
    // Check task table
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    api.listTasks.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderTaskListView()
    
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
  })

  it('shows error state when loading fails', async () => {
    api.listTasks.mockRejectedValueOnce(new Error('Network error'))
    
    renderTaskListView()
    
    await waitFor(() => expect(api.listTasks).toHaveBeenCalled())
    
    expect(screen.getByText('Failed to load tasks')).toBeInTheDocument()
  })

  it('shows empty state when no tasks exist', async () => {
    api.listTasks.mockResolvedValueOnce([])
    
    renderTaskListView()
    
    await waitFor(() => expect(api.listTasks).toHaveBeenCalled())
    
    expect(screen.getByText('No tasks found.')).toBeInTheDocument()
    expect(screen.getByText('Create your first task')).toBeInTheDocument()
  })

  it('filters tasks by status', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'NEW', dueDate: '2025-09-25' },
      { id: 2, title: 'Task 2', status: 'COMPLETED', dueDate: '2025-09-25' }
    ]
    api.listTasks.mockResolvedValueOnce(mockTasks)
    
    renderTaskListView()
    
    await waitFor(() => expect(api.listTasks).toHaveBeenCalled())
    
    // Initially shows both tasks
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    
    // Filter by NEW status
    const statusFilter = screen.getByDisplayValue('All Tasks')
    fireEvent.change(statusFilter, { target: { value: 'NEW' } })
    
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
  })

  it('searches tasks by title', async () => {
    const mockTasks = [
      { id: 1, title: 'Buy groceries', status: 'NEW', dueDate: '2025-09-25' },
      { id: 2, title: 'Walk the dog', status: 'NEW', dueDate: '2025-09-25' }
    ]
    api.listTasks.mockResolvedValueOnce(mockTasks)
    
    renderTaskListView()
    
    await waitFor(() => expect(api.listTasks).toHaveBeenCalled())
    
    // Initially shows both tasks
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()
    
    // Search for "groceries"
    const searchInput = screen.getByPlaceholderText('Search tasks by title or description...')
    fireEvent.change(searchInput, { target: { value: 'groceries' } })
    
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.queryByText('Walk the dog')).not.toBeInTheDocument()
  })

  it('sorts tasks by title', async () => {
    const mockTasks = [
      { id: 1, title: 'Zebra task', status: 'NEW', dueDate: '2025-09-25' },
      { id: 2, title: 'Alpha task', status: 'NEW', dueDate: '2025-09-25' }
    ]
    api.listTasks.mockResolvedValueOnce(mockTasks)
    
    renderTaskListView()
    
    await waitFor(() => expect(api.listTasks).toHaveBeenCalled())
    
    // Click title sort button
    const titleSortButton = screen.getByText('Title')
    fireEvent.click(titleSortButton)
    
    // Check if tasks are sorted alphabetically
    await waitFor(() => {
      const taskLinks = screen.getAllByRole('link', { name: /task/ })
      expect(taskLinks[0]).toHaveTextContent('Alpha task')
      expect(taskLinks[1]).toHaveTextContent('Zebra task')
    })
  })

  it('deletes a task', async () => {
    const mockTasks = [
      { id: 1, title: 'Task to delete', status: 'NEW', dueDate: '2025-09-25' }
    ]
    api.listTasks.mockResolvedValueOnce(mockTasks)
    api.deleteTask.mockResolvedValueOnce()
    api.listTasks.mockResolvedValueOnce([]) // After deletion
    
    // Mock window.confirm to return true
    window.confirm = vi.fn(() => true)
    
    renderTaskListView()
    
    await waitFor(() => expect(api.listTasks).toHaveBeenCalled())
    
    expect(screen.getByText('Task to delete')).toBeInTheDocument()
    
    // Click delete button
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    await waitFor(() => expect(api.deleteTask).toHaveBeenCalledWith(1))
    await waitFor(() => expect(api.listTasks).toHaveBeenCalledTimes(2))
  })

  it('updates task status', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'NEW', dueDate: '2025-09-25' }
    ]
    api.listTasks.mockResolvedValueOnce(mockTasks)
    api.updateStatus.mockResolvedValueOnce({ id: 1, status: 'COMPLETED' })
    
    renderTaskListView()
    
    await waitFor(() => expect(api.listTasks).toHaveBeenCalled())
    
    // Change status via dropdown
    const statusSelect = screen.getByDisplayValue('NEW')
    fireEvent.change(statusSelect, { target: { value: 'COMPLETED' } })
    
    await waitFor(() => expect(api.updateStatus).toHaveBeenCalledWith(1, 'COMPLETED'))
  })
})