import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  
  function isActive(path) {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/tasks'
    }
    return location.pathname.startsWith(path)
  }
  
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">📋</span>
            <span className="brand-text">TaskManager</span>
          </Link>
        </div>
        
        <nav className="header-navigation">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            title="View all tasks"
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/tasks/new" 
            className={`nav-link ${isActive('/tasks/new') ? 'active' : ''}`}
            title="Create new task"
          >
            <span className="nav-icon">➕</span>
            <span>Create</span>
          </Link>
          
          <Link 
            to="/tasks/search" 
            className={`nav-link ${isActive('/tasks/search') ? 'active' : ''}`}
            title="Search and filter tasks"
          >
            <span className="nav-icon">🔍</span>
            <span>Search</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}