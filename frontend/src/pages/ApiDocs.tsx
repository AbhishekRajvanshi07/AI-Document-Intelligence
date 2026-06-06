import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const endpoints = [
  { method: 'POST', path: '/documents/upload', desc: 'Upload & process document → R2 + OCR + NLP + Neon',
    code: `curl -X POST ${BASE}/api/v1/documents/upload \\
  -F "file=@invoice.pdf" \\
  -F "lang=eng"` },
  { method: 'GET', path: '/documents', desc: 'List all documents from Neon',
    code: `curl ${BASE}/api/v1/documents?limit=20&offset=0` },
  { method: 'GET', path: '/documents/{id}', desc: 'Get document + R2 presigned download URL',
    code: `curl ${BASE}/api/v1/documents/{id}` },
  { method: 'GET', path: '/documents/{id}/export', desc: 'Download structured JSON',
    code: `curl ${BASE}/api/v1/documents/{id}/export -o output.json` },
  { method: 'DELETE', path: '/documents/{id}', desc: 'Delete from Neon + R2',
    code: `curl -X DELETE ${BASE}/api/v1/documents/{id}` },
  { method: 'POST', path: '/analyze/ocr', desc: 'Run OCR on base64 image',
    code: `curl -X POST ${BASE}/api/v1/analyze/ocr \\
  -H "Content-Type: application/json" \\
  -d '{"image_b64":"<base64>","lang":"eng"}'` },
  { method: 'POST', path: '/analyze/nlp', desc: 'Run NLP on raw text',
    code: `curl -X POST ${BASE}/api/v1/analyze/nlp \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Invoice #INV-2024..."}'` },
  { method: 'GET', path: '/health', desc: 'Health check',
    code: `curl ${BASE}/api/v1/health` },
]

const methodStyle: Record<string, { bg: string; color: string }> = {
  GET: { bg: '#0d2520', color: '#34d399' },
  POST: { bg: '#0d1e2a', color: '#60a5fa' },
  DELETE: { bg: '#250d0d', color: '#f87171' },
}

export default function ApiDocs() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>API Documentation</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>
        FastAPI on Render · Base URL: <code style={{ fontFamily: 'var(--mono)', color: 'var(--teal)', background: 'var(--teal-dim)', padding: '2px 7px', borderRadius: 4 }}>{BASE}/api/v1</code>
      </div>
      <a href={`${BASE}/docs`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)', marginBottom: 24, display: 'inline-block' }}>Open Swagger UI ↗</a>
      <div style={{ marginTop: 16 }}>
        {endpoints.map((ep, i) => {
          const ms = methodStyle[ep.method] || methodStyle.GET
          return (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
              <div onClick={() => setOpen(open === i ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', cursor: 'pointer' }}>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', background: ms.bg, color: ms.color }}>{ep.method}</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 500, flex: 1 }}>{ep.path}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{ep.desc}</span>
                <ChevronDown size={14} color="var(--text3)" style={{ transition: '.2s', transform: open === i ? 'rotate(180deg)' : '' }} />
              </div>
              {open === i && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                  <pre style={{ background: 'var(--bg)', borderRadius: 7, padding: 12, fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.7, color: 'var(--text2)', overflowX: 'auto', margin: 0 }}>{ep.code}</pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
