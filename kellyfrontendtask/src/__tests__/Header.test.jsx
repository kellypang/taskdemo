import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../components/Header'

// Mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/' }))
  }
})

function renderWithRouter(component) {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  )
}

describe('Header', () => {
  it('renders brand and navigation links', () => {
    renderWithRouter(<Header />)
    
    // Check brand
    expect(screen.getByText('TaskManager')).toBeInTheDocument()
    
    // Check navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
  })

  it('renders correct navigation link hrefs', () => {
    renderWithRouter(<Header />)
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    const createLink = screen.getByRole('link', { name: /create/i })
    const searchLink = screen.getByRole('link', { name: /search/i })
    
    expect(dashboardLink).toHaveAttribute('href', '/')
    expect(createLink).toHaveAttribute('href', '/tasks/new')
    expect(searchLink).toHaveAttribute('href', '/tasks/search')
  })

  it('shows active state for dashboard route by default', () => {
    renderWithRouter(<Header />)
    
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink).toHaveClass('active')
  })
})
