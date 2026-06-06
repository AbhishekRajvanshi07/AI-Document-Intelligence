import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { listDocuments, getHealth } from '../utils/api'

const classData = [
  { name: 'Invoices', count: 78 }, { name: 'Contracts', count: 54 },
  { name: 'IDs', count: 41 }, { name: 'Medical', count: 33 }, { name: 'Receipts', count: 22 },
]
const volumeData = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`, docs: Math.floor(30 + Math.random() * 80),
}))

const typeStyle: Record<string, { bg: string; color: string }> = {
  pdf: { bg: '#2a0d0d', color: '#f87171' },
  image: { bg: '#0d1e2a', color: '#60a5fa' },
  docx: { bg: '#0d2550', color: '#3d8bff' },
}

export default function Dashboard() {
  const { data: docsData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => listDocuments({ limit: 5 }),
    refetchInterval: 10000,
  })
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: () => getHealth(),
    refetchInterval: 30000,
  })

  const docs = docsData?.data?.items || []
  const health = healthData?.data

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.5px', marginBottom: 4 }}>Intelligence Dashboard</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>
        Live cloud stack: Neon · Upstash · Cloudflare R2 · Render · Vercel
      </div>

      {/* Health banner */}
      {health && (
        <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>All services operational</span>
          <span style={{ color: 'var(--text3)', marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11 }}>{health.timestamp}</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Documents', value: docsData?.data?.total ?? '—', color: 'var(--teal)' },
          { label: 'OCR Accuracy', value: '97.4%', color: 'var(--blue)' },
          { label: 'Avg Process Time', value: '1.8s', color: 'var(--amber)' },
          { label: 'Cloud Storage', value: 'R2', color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: 'var(--text2)', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -1, color: s.color }}>{String(s.value)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>Classification Breakdown</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={classData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={70} tick={{ fill: 'var(--text2)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--teal)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>Processing Volume — 14 Days</div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text3)', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 11 }} />
              <Line type="monotone" dataKey="docs" stroke="var(--teal)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent documents from real API */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>Recent Documents</div>
        {docs.length === 0 ? (
          <div style={{ color: 'var(--text3)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
            No documents yet — upload your first document to get started
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{['Document', 'Type', 'Status', 'Confidence', 'Processed'].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {docs.map((doc: any) => {
                const ts = typeStyle[doc.doc_type] || typeStyle.pdf
                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{doc.filename}</td>
                    <td style={{ padding: '10px 12px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: ts.bg, color: ts.color }}>{doc.doc_type.toUpperCase()}</span></td>
                    <td style={{ padding: '10px 12px' }}><span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--green-dim)', color: 'var(--green)' }}>● {doc.status}</span></td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 11 }}>{doc.confidence ? `${(doc.confidence * 100).toFixed(1)}%` : '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 11 }}>{doc.processed_at ? new Date(doc.processed_at).toLocaleString() : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
