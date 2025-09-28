import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import SearchTasks from '../pages/SearchTasks'
import * as api from '../api/tasks'

vi.mock('../api/tasks', () => ({ searchTasks: vi.fn() }))

const future = () => new Date(Date.now() + 86400000).toISOString()

function renderSearchTasks() {
  return render(
    <MemoryRouter>
      <SearchTasks />
    </MemoryRouter>
  )
}

describe('SearchTasks page', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('searches by title substring', async () => {
    api.searchTasks.mockResolvedValueOnce([{ id: 1, title: 'Monthly Report', status: 'NEW', dueDate: future() }])
    renderSearchTasks()
    fireEvent.change(screen.getByPlaceholderText(/Enter keywords to search in task titles/i), { target: { value: 'report' } })
    fireEvent.click(screen.getByRole('button', { name: /search tasks/i }))
    await waitFor(() => expect(api.searchTasks).toHaveBeenCalled())
    expect(await screen.findByText('Monthly Report')).toBeInTheDocument()
  })

  it('searches by due date', async () => {
    const date = future().slice(0,10)
    api.searchTasks.mockResolvedValueOnce([{ id: 2, title: 'Due Date Match', status: 'PENDING', dueDate: `${date}T10:00:00` }])
    renderSearchTasks()
    fireEvent.change(screen.getByLabelText(/Due Date/), { target: { value: date } })
    fireEvent.click(screen.getByRole('button', { name: /search tasks/i }))
    await waitFor(() => expect(api.searchTasks).toHaveBeenCalled())
    expect(await screen.findByText('Due Date Match')).toBeInTheDocument()
  })

  it('searches by status', async () => {
    api.searchTasks.mockResolvedValueOnce([{ id: 3, title: 'Status Filtered', status: 'COMPLETED', dueDate: future() }])
    renderSearchTasks()
    fireEvent.change(screen.getByLabelText(/Status/), { target: { value: 'COMPLETED' } })
    fireEvent.click(screen.getByRole('button', { name: /search tasks/i }))
    await waitFor(() => expect(api.searchTasks).toHaveBeenCalled())
    expect(await screen.findByText('Status Filtered')).toBeInTheDocument()
  })

  it('shows no results message', async () => {
    api.searchTasks.mockResolvedValueOnce([])
    renderSearchTasks()
    fireEvent.click(screen.getByRole('button', { name: /search tasks/i }))
    await waitFor(() => expect(api.searchTasks).toHaveBeenCalled())
    expect(await screen.findByText(/No tasks match/)).toBeInTheDocument()
  })

  it('clears search filters when clear button is clicked', async () => {
    renderSearchTasks()
    
    // Fill in search form
    const titleInput = screen.getByLabelText(/title/i)
    const statusSelect = screen.getByLabelText(/status/i)
    const dueDateRangeSelect = screen.getByLabelText(/due date/i)
    
    fireEvent.change(titleInput, { target: { value: 'test task' } })
    fireEvent.change(statusSelect, { target: { value: 'COMPLETED' } })
    fireEvent.change(dueDateRangeSelect, { target: { value: 'specific' } })
    
    // Now the specific date input should appear
    const dueDateInput = screen.getByDisplayValue('')
    fireEvent.change(dueDateInput, { target: { value: '2025-09-25' } })
    
    // Clear filters
    fireEvent.click(screen.getByText('Clear Filters'))
    
    // All fields should be cleared to their default values
    expect(titleInput.value).toBe('')
    expect(statusSelect.value).toBe('')
    expect(dueDateRangeSelect.value).toBe('any')
  })

  it('handles search API errors gracefully', async () => {
    api.searchTasks.mockRejectedValueOnce(new Error('Search failed'))
    
    renderSearchTasks()
    fireEvent.click(screen.getByRole('button', { name: /search tasks/i }))
    
    await waitFor(() => expect(api.searchTasks).toHaveBeenCalled())
    
    // Should show error message
    expect(screen.getByText(/search failed/i)).toBeInTheDocument()
  })

  it('shows loading state during search', async () => {
    api.searchTasks.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderSearchTasks()
    fireEvent.click(screen.getByRole('button', { name: /search tasks/i }))
    
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })

  it('searches with combined filters', async () => {
    const mockTasks = [{ id: 1, title: 'Found task' }]
    api.searchTasks.mockResolvedValueOnce(mockTasks)
    
    renderSearchTasks()
    
    // Set multiple filters
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'important' } })
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'PENDING' } })
    fireEvent.change(screen.getByLabelText(/due date/i), { target: { value: 'specific' } })
    
    // Now set the specific date
    const dueDateInput = screen.getByDisplayValue('')
    fireEvent.change(dueDateInput, { target: { value: '2025-09-25' } })
    
    fireEvent.click(screen.getByRole('button', { name: /search tasks/i }))
    
    await waitFor(() => {
      expect(api.searchTasks).toHaveBeenCalledWith({
        title: 'important',
        status: 'PENDING',
        dueDate: '2025-09-25'
      })
    })
    
    expect(screen.getByText('Found task')).toBeInTheDocument()
  })

  it('allows searching with empty filters', async () => {
    const mockTasks = [{ id: 1, title: 'All tasks' }]
    api.searchTasks.mockResolvedValueOnce(mockTasks)
    
    renderSearchTasks()
    
    // Search without any filters - use role selector to avoid ambiguity
    fireEvent.click(screen.getByRole('button', { name: /search tasks/i }))
    
    await waitFor(() => {
      expect(api.searchTasks).toHaveBeenCalledWith({
        title: '',
        status: ''
      })
    })
  })
})