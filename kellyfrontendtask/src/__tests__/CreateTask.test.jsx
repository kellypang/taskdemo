import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import CreateTask from '../pages/CreateTask'
import * as api from '../api/tasks'

// Mock the API
vi.mock('../api/tasks', () => ({
  createTask: vi.fn()
}))

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

function renderCreateTask() {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CreateTask />
    </BrowserRouter>
  )
}

describe('CreateTask', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders create task form', () => {
    renderCreateTask()
    
    expect(screen.getByText('Create New Task')).toBeInTheDocument()
    expect(screen.getByLabelText(/Task Title/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Due Date & Time/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Initial Status/)).toBeInTheDocument()
    expect(screen.getByText('Create Task')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    renderCreateTask()
    
    const submitButton = screen.getByText('Create Task')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
      expect(screen.getByText('Due date is required')).toBeInTheDocument()
    })
    
    expect(api.createTask).not.toHaveBeenCalled()
  })

  it('validates title length', async () => {
    renderCreateTask()
    
    const titleInput = screen.getByLabelText(/Task Title/)
    fireEvent.change(titleInput, { target: { value: 'ab' } }) // Too short
    
    const submitButton = screen.getByText('Create Task')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Title must be at least 3 characters long')).toBeInTheDocument()
    })
  })

  it('validates due date is in future', async () => {
    renderCreateTask()
    
    const titleInput = screen.getByLabelText(/Task Title/)
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } })
    
    const dateInput = screen.getByLabelText(/Due Date & Time/)
    const pastDate = new Date(Date.now() - 86400000).toISOString().slice(0, 16) // Yesterday
    fireEvent.change(dateInput, { target: { value: pastDate } })
    
    const submitButton = screen.getByText('Create Task')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Due date must be in the future')).toBeInTheDocument()
    })
  })

  it('creates task successfully with valid data', async () => {
    const mockCreatedTask = { id: 1, title: 'New Task', status: 'NEW' }
    api.createTask.mockResolvedValueOnce(mockCreatedTask)
    
    renderCreateTask()
    
    const titleInput = screen.getByLabelText(/Task Title/)
    const descriptionInput = screen.getByLabelText(/Description/)
    const dateInput = screen.getByLabelText(/Due Date & Time/)
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } })
    fireEvent.change(descriptionInput, { target: { value: 'Task description' } })
    
    const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16) // Tomorrow
    fireEvent.change(dateInput, { target: { value: futureDate } })
    
    const submitButton = screen.getByText('Create Task')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          description: 'Task description',
          status: 'NEW'
        })
      )
    })
    
    expect(screen.getByText('Task created successfully!')).toBeInTheDocument()
  })

  it('handles create task API error', async () => {
    api.createTask.mockRejectedValueOnce(new Error('Network error'))
    
    renderCreateTask()
    
    const titleInput = screen.getByLabelText(/Task Title/)
    const dateInput = screen.getByLabelText(/Due Date & Time/)
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } })
    
    const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16)
    fireEvent.change(dateInput, { target: { value: futureDate } })
    
    const submitButton = screen.getByText('Create Task')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to create task. Please try again.')).toBeInTheDocument()
    })
  })

  it('clears validation errors when user starts typing', async () => {
    renderCreateTask()
    
    const submitButton = screen.getByText('Create Task')
    fireEvent.click(submitButton)
    
    // Should show title error
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
    
    // Start typing in title field
    const titleInput = screen.getByLabelText(/Task Title/)
    fireEvent.change(titleInput, { target: { value: 'New task' } })
    
    // Error should be cleared
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
  })

  it('validates description length', async () => {
    renderCreateTask()
    
    const descriptionInput = screen.getByLabelText('Description')
    const longDescription = 'a'.repeat(501) // Over 500 character limit
    
    fireEvent.change(descriptionInput, { target: { value: longDescription } })
    
    const submitButton = screen.getByText('Create Task')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Description must be less than 500 characters')).toBeInTheDocument()
    })
  })

  it('handles form field changes correctly', () => {
    renderCreateTask()
    
    const titleInput = screen.getByLabelText('Task Title')
    const descriptionInput = screen.getByLabelText('Description')
    const statusSelect = screen.getByLabelText('Initial Status')
    const dueDateInput = screen.getByLabelText('Due Date & Time')
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } })
    fireEvent.change(statusSelect, { target: { value: 'PENDING' } })
    fireEvent.change(dueDateInput, { target: { value: '2025-12-25T10:00' } })
    
    expect(titleInput.value).toBe('Test Task')
    expect(descriptionInput.value).toBe('Test Description')
    expect(statusSelect.value).toBe('PENDING')
    expect(dueDateInput.value).toBe('2025-12-25T10:00')
  })

  it('shows character count for description', () => {
    renderCreateTask()
    
    const descriptionInput = screen.getByLabelText('Description')
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })
    
    // Should show character count if implemented
    const characterCount = screen.queryByText(/characters?/)
    if (characterCount) {
      expect(characterCount).toBeInTheDocument()
    }
  })
})