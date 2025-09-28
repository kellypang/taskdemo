import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import { loadStatuses } from './models/task'
import { listStatuses } from './api/tasks'
import CreateTask from './pages/CreateTask.jsx'
import TaskDetails from './pages/TaskDetails.jsx'
import TaskListView from './pages/TaskListView.jsx'
import SearchTasks from './pages/SearchTasks.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ padding: '12px 16px', flex: '1 0 auto' }}>
        {children}
      </div>
      <Footer />
    </div>
  )
}

function Boot() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let mounted = true
    loadStatuses(listStatuses).finally(() => { if (mounted) setReady(true) })
    return () => { mounted = false }
  }, [])
  if (!ready) {
    return <div style={{ padding: 24, fontFamily: 'sans-serif' }}>Loading…</div>
  }
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout><TaskListView /></Layout>} />
        <Route path="/tasks" element={<Layout><TaskListView /></Layout>} />
        <Route path="/tasks/new" element={<Layout><CreateTask /></Layout>} />
        <Route path="/tasks/search" element={<Layout><SearchTasks /></Layout>} />
        <Route path="/tasks/:id" element={<Layout><TaskDetails /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Boot />
  </React.StrictMode>
)
