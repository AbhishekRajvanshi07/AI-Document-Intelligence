import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Upload from './pages/Upload'
import Analysis from './pages/Analysis'
import ApiDocs from './pages/ApiDocs'
import Pipeline from './pages/Pipeline'
import Settings from './pages/Settings'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#151c2e', color: '#e8edf5', border: '1px solid #1e2d4a' },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysis/:id?" element={<Analysis />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  )
}
