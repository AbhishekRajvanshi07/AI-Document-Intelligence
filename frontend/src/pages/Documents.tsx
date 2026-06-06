import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { listDocuments, deleteDocument } from '../utils/api'

const typeStyle: Record<string, { bg: string; color: string }> = {
  pdf: { bg: '#2a0d0d', color: '#f87171' },
  image: { bg: '#0d1e2a', color: '#60a5fa' },
  docx: { bg: '#0d2550', color: '#3d8bff' },
  unknown: { bg: 'var(--surface3)', color: 'var(--text2)' },
}
const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  completed: { bg: 'var(--green-dim)', color: 'var(--green)', label: '● Complete' },
  processing: { bg: 'var(--amber-dim)', color: 'var(--amber)', label: '⟳ Processing' },
  queued: { bg: 'var(--surface3)', color: 'var(--text2)', label: '◌ Queued' },
  error: { bg: '#250d0d', color: '#f87171', label: '✕ Error' },
}

export default function Documents() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['documents', filter],
    queryFn: () => listDocuments(filter !== 'all' ? { status: filter, limit: 50 } : { limit: 50 }),
    refetchInterval: 8000,
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); toast.success('Document deleted') },
    onError: () => toast.error('Delete failed'),
  })

  const docs: any[] = data?.data?.items || []

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Document Library</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>All documents stored in Neon PostgreSQL · Files in Cloudflare R2</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'completed', 'processing', 'queued', 'error'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: '1px solid', fontFamily: 'var(--sans)',
              borderColor: filter === f ? 'var(--teal)' : 'var(--border)',
              background: filter === f ? 'var(--teal-dim)' : 'var(--surface2)',
              color: filter === f ? 'var(--teal)' : 'var(--text2)',
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <button onClick={() => navigate('/upload')} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
          + Upload New
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading from Neon...</div>
        ) : docs.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
            No documents found — <span style={{ color: 'var(--teal)', cursor: 'pointer' }} onClick={() => navigate('/upload')}>upload one</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Name', 'Type', 'Status', 'Confidence', 'Fields', 'Processed', 'Actions'].map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {docs.map((doc: any) => {
                const ts = typeStyle[doc.doc_type] || typeStyle.unknown
                const ss = statusStyle[doc.status] || statusStyle.completed
                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => navigate(`/analysis/${doc.id}`)}>
                    <td style={{ padding: '11px 14px', fontWeight: 500, fontSize: 13 }}>{doc.filename}</td>
                    <td style={{ padding: '11px 14px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: ts.bg, color: ts.color }}>{doc.doc_type.toUpperCase()}</span></td>
                    <td style={{ padding: '11px 14px' }}><span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                    <td style={{ padding: '11px 14px' }}>
                      {doc.confidence > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ height: 4, width: 70, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${doc.confidence * 100}%`, background: 'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text3)' }}>{(doc.confidence * 100).toFixed(1)}%</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 12 }}>{doc.fields_extracted || '—'}</td>
                    <td style={{ padding: '11px 14px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
                      {doc.processed_at ? new Date(doc.processed_at).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => navigate(`/analysis/${doc.id}`)} style={{ padding: '4px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text2)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--sans)' }}>View</button>
                        <button onClick={() => deleteMut.mutate(doc.id)} style={{ padding: '4px 10px', background: '#250d0d', border: '1px solid #3a1010', borderRadius: 5, color: '#f87171', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--sans)' }}>Delete</button>
                      </div>
                    </td>
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
