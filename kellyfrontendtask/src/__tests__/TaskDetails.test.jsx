import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import TaskDetails from '../pages/TaskDetails'
import * as api from '../api/tasks'

// Mock the API
vi.mock('../api/tasks', () => ({
  getTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  updateStatus: vi.fn()
}))

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate
  }
})

function renderTaskDetails() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TaskDetails />
    </BrowserRouter>
  )
}

describe('TaskDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.confirm
    Object.defineProperty(window, 'confirm', {
      value: vi.fn(() => true),
      writable: true
    })
  })

  it('renders task details correctly', async () => {
    const mockTask = {
      id: 1,
      tasknum: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: '2025-09-25T10:00:00'
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    // Check for the status badge specifically by looking for the element with the status-badge class
    const statusBadge = document.querySelector('.status-badge')
    expect(statusBadge).toHaveTextContent('NEW')
    // Check for the task ID in the task header specifically (not breadcrumb)
    const taskId = document.querySelector('.task-id')
    expect(taskId).toHaveTextContent('Task #T001')
  })

  it('shows loading state initially', () => {
    api.getTask.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderTaskDetails()
    
    expect(screen.getByText('Loading task details...')).toBeInTheDocument()
  })

  it('shows error state when task not found', async () => {
    const error = new Error('Not found')
    error.response = { status: 404 }
    api.getTask.mockRejectedValueOnce(error)
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    expect(screen.getByText('Task not found')).toBeInTheDocument()
    expect(screen.getByText('Back to Tasks')).toBeInTheDocument()
  })

  it('shows generic error for other API failures', async () => {
    api.getTask.mockRejectedValueOnce(new Error('Network error'))
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    expect(screen.getByText('Failed to load task details')).toBeInTheDocument()
  })

  it('displays overdue badge for overdue tasks', async () => {
    const mockTask = {
      id: 1,
      tasknum: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: '2024-01-01T10:00:00' // Past date to make it overdue
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    expect(screen.getByText('(Overdue)')).toBeInTheDocument()
  })

  it('shows breadcrumb navigation', async () => {
    const mockTask = {
      id: 1,
      tasknum: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: '2025-09-25T10:00:00'
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    const breadcrumb = screen.getByRole('navigation')
    expect(breadcrumb).toBeInTheDocument()
    
    // Check breadcrumb links - be more specific about which element we're checking
    expect(screen.getByText('All Tasks')).toBeInTheDocument()
    
    // Check for breadcrumb current item specifically
    const breadcrumbCurrent = breadcrumb.querySelector('.current')
    expect(breadcrumbCurrent).toHaveTextContent('Task #T001')
  })

  it('enters edit mode when edit button is clicked', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
    const mockTask = {
      id: 1,
      tasknum: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: futureDate.toISOString()
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    const editButton = screen.getByText('Edit Task')
    fireEvent.click(editButton)
    
    // Should show edit form
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('updates task when save is clicked in edit mode', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
    const mockTask = {
      id: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: futureDate.toISOString()
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    api.updateTask.mockResolvedValueOnce({ ...mockTask, title: 'Updated Task' })
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit Task'))
    
    // Change title
    const titleInput = screen.getByDisplayValue('Test Task')
    fireEvent.change(titleInput, { target: { value: 'Updated Task' } })
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'))
    
    await waitFor(() => {
      expect(api.updateTask).toHaveBeenCalledWith({
        id: 'T001',
        title: 'Updated Task',
        description: 'Test description',
        status: 'NEW',
        dueDate: futureDate.toISOString()
      })
    })
  })

  it('cancels edit mode when cancel is clicked', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
    const mockTask = {
      id: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: futureDate.toISOString()
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit Task'))
    
    // Should show edit form
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument()
    
    // Cancel editing
    fireEvent.click(screen.getByText('Cancel'))
    
    // Should return to view mode
    expect(screen.queryByDisplayValue('Test Task')).not.toBeInTheDocument()
    expect(screen.getByText('Edit Task')).toBeInTheDocument()
  })

  it('deletes task when delete button is clicked', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
    const mockTask = {
      id: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: futureDate.toISOString()
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    api.deleteTask.mockResolvedValueOnce()
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    const deleteButton = screen.getByText('Delete Task')
    fireEvent.click(deleteButton)
    
    await waitFor(() => {
      expect(api.deleteTask).toHaveBeenCalledWith('T001')
    })
    
    // Should navigate away after deletion
    expect(mockNavigate).toHaveBeenCalledWith('/', {
      state: { message: 'Task "Test Task" deleted successfully' }
    })
  })

  it('updates task status via dropdown', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
    const mockTask = {
      id: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: futureDate.toISOString()
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    api.updateStatus.mockResolvedValueOnce({ ...mockTask, status: 'COMPLETED' })
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    const statusSelect = screen.getByDisplayValue('NEW')
    fireEvent.change(statusSelect, { target: { value: 'COMPLETED' } })
    
    await waitFor(() => {
      expect(api.updateStatus).toHaveBeenCalledWith('T001', 'COMPLETED')
    })
  })

  it('shows validation errors in edit mode', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7) // 7 days from now
    const mockTask = {
      id: 'T001',
      title: 'Test Task',
      description: 'Test description',
      status: 'NEW',
      dueDate: futureDate.toISOString()
    }
    
    api.getTask.mockResolvedValueOnce(mockTask)
    
    renderTaskDetails()
    
    await waitFor(() => expect(api.getTask).toHaveBeenCalled())
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit Task'))
    
    // Clear title
    const titleInput = screen.getByDisplayValue('Test Task')
    fireEvent.change(titleInput, { target: { value: '' } })
    
    // Try to save
    fireEvent.click(screen.getByText('Save Changes'))
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })
})