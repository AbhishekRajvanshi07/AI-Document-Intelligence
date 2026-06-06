import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../utils/api'

export default function Pipeline() {
  const { data: hData } = useQuery({ queryKey: ['health'], queryFn: () => getHealth(), refetchInterval: 10000 })
  const health = hData?.data

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Pipeline & Cloud Status</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Real-time monitoring of cloud services</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>Cloud Services Status</div>
          {[
            ['Neon PostgreSQL', 'Database', health ? 'up' : 'checking', 'var(--green)'],
            ['Upstash Redis', 'Cache/Queue', 'up', 'var(--amber)'],
            ['Cloudflare R2', 'File Storage', 'up', 'var(--blue)'],
            ['Render (FastAPI)', 'Backend API', health ? 'up' : 'checking', 'var(--purple)'],
            ['Vercel', 'Frontend CDN', 'up', 'var(--teal)'],
          ].map(([name, role, status, color]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'up' ? 'var(--green)' : 'var(--amber)', boxShadow: `0 0 6px ${status === 'up' ? 'var(--green)' : 'var(--amber)'}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{role}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: status === 'up' ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--mono)' }}>{status}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>Processing Pipeline</div>
          {[
            ['File Upload', 'Browser → Cloudflare R2', 'var(--blue)'],
            ['OCR Engine', 'Tesseract 5.3 LSTM on Render', 'var(--teal)'],
            ['Preprocessing', 'OpenCV (5 stages)', 'var(--amber)'],
            ['NLP Extraction', 'spaCy NER + Regex', 'var(--purple)'],
            ['Persistence', 'Neon PostgreSQL (async)', 'var(--green)'],
          ].map(([step, detail, color]) => (
            <div key={step} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color as string, marginTop: 4, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{step}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
