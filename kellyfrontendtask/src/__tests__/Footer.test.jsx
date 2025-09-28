import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

describe('Footer', () => {
  it('renders footer content', () => {
    render(<Footer />)
    
    expect(screen.getByText(/© 2025 TaskManager/)).toBeInTheDocument()
    expect(screen.getByText(/Built with React & modern web technologies/)).toBeInTheDocument()
    expect(screen.getByText(/💡 Manage your tasks efficiently/)).toBeInTheDocument()
  })

  it('has correct footer structure', () => {
    render(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveClass('app-footer')
    
    const container = footer.querySelector('.footer-container')
    expect(container).toBeInTheDocument()
    
    const content = footer.querySelector('.footer-content')
    expect(content).toBeInTheDocument()
    
    const links = footer.querySelector('.footer-links')
    expect(links).toBeInTheDocument()
  })
})