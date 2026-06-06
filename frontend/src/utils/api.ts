import axios from 'axios'

// In production (Vercel), VITE_API_URL points to Render backend
// In local dev, Vite proxy handles /api → localhost:8000
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1'

export const api = axios.create({ baseURL: BASE, timeout: 90000 })

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API error:', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

// ── Documents ───────────────────────────────────────
export const uploadDocument = (formData: FormData) =>
  api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const listDocuments = (params?: Record<string, string | number>) =>
  api.get('/documents', { params })

export const getDocument = (id: string) => api.get(`/documents/${id}`)

export const exportDocument = (id: string) => api.get(`/documents/${id}/export`)

export const deleteDocument = (id: string) => api.delete(`/documents/${id}`)

// ── Analyze ─────────────────────────────────────────
export const runOCR = (image_b64: string, lang = 'eng') =>
  api.post('/analyze/ocr', { image_b64, lang })

export const runNLP = (text: string) => api.post('/analyze/nlp', { text })

// ── Health ──────────────────────────────────────────
export const getHealth = () => api.get('/health')
