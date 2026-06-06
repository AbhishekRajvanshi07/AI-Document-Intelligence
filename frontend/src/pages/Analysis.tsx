import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDocument } from '../utils/api'

const tabs = ['Extracted Fields', 'JSON Export', 'NLP Entities', 'Raw OCR']

export default function Analysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => getDocument(id!),
    enabled: !!id,
  })

  const doc = data?.data

  if (!id) return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Document Analysis</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Select a document from the library to analyze</div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
        <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 12 }}>No document selected</div>
        <button onClick={() => navigate('/documents')} style={{ padding: '8px 16px', background: 'var(--teal)', border: 'none', borderRadius: 6, color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--sans)' }}>Browse Documents</button>
      </div>
    </div>
  )

  if (isLoading) return <div style={{ padding: 24, color: 'var(--text3)' }}>Loading from Neon...</div>
  if (!doc) return <div style={{ padding: 24, color: '#f87171' }}>Document not found</div>

  const fields = doc.extracted_data || {}
  const entities = doc.nlp_entities || []

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>
        <span style={{ cursor: 'pointer', color: 'var(--teal)' }} onClick={() => navigate('/documents')}>Documents</span>
        <span>›</span><span style={{ color: 'var(--text2)' }}>{doc.filename}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Document Analysis</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>
        {doc.filename} · {doc.doc_type?.toUpperCase()} · {(doc.file_size / 1024).toFixed(1)} KB ·
        <span style={{ color: 'var(--teal)', marginLeft: 4 }}>Stored in R2 + Neon</span>
      </div>

      {/* R2 download link */}
      {doc.download_url && (
        <div style={{ background: 'var(--blue-dim)', border: '1px solid rgba(61,139,255,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{ color: 'var(--text2)' }}>File stored in Cloudflare R2 —</span>
          <a href={doc.download_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', fontWeight: 600 }}>Download original ↗</a>
          <span style={{ color: 'var(--text3)', fontSize: 11 }}>(link expires in 1 hour)</span>
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {tabs.map((t, i) => (
          <div key={t} onClick={() => setActiveTab(i)} style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            color: activeTab === i ? 'var(--teal)' : 'var(--text2)',
            borderBottom: `2px solid ${activeTab === i ? 'var(--teal)' : 'transparent'}`,
            marginBottom: -1,
          }}>{t}</div>
        ))}
      </div>

      {activeTab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>
              Extracted Fields
              <span style={{ marginLeft: 8, padding: '2px 8px', background: 'var(--teal-dim)', color: 'var(--teal)', borderRadius: 10, fontSize: 10 }}>{Object.keys(fields).length} fields</span>
            </div>
            {Object.keys(fields).length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>No fields extracted — OCR may not have found structured data</div>
            ) : Object.entries(fields).map(([k, v]: [string, any]) => (
              <div key={k} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 6 }}>
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{k}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{v?.confidence ? `${(v.confidence * 100).toFixed(1)}% conf` : ''}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{v?.value || String(v)}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>Document Info</div>
            {[
              ['ID', doc.id, 'var(--text3)'],
              ['Classification', doc.classification || '—', 'var(--teal)'],
              ['Confidence', doc.confidence ? `${(doc.confidence * 100).toFixed(1)}%` : '—', 'var(--blue)'],
              ['Processing Time', `${doc.processing_ms}ms`, 'var(--amber)'],
              ['OCR Engine', 'Tesseract 5.3 LSTM', 'var(--text)'],
              ['Storage', 'Cloudflare R2', 'var(--blue)'],
              ['Database', 'Neon PostgreSQL', 'var(--green)'],
            ].map(([k, v, c]) => (
              <div key={k} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)', minWidth: 120 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: c as string }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)' }}>JSON Export</div>
            <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(doc, null, 2)); }} style={{ padding: '4px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text2)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--sans)' }}>Copy JSON</button>
          </div>
          <pre style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.7, overflowX: 'auto', color: 'var(--text2)', maxHeight: 450, overflowY: 'auto' }}>
            {JSON.stringify(doc, null, 2)}
          </pre>
        </div>
      )}

      {activeTab === 2 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>NLP Entity Recognition</div>
          {entities.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13 }}>No entities detected</div>
          ) : entities.map((e: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--blue)', minWidth: 80 }}>{e.label}</span>
              <span style={{ fontSize: 13 }}>{e.text}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 3 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 14 }}>Raw OCR Text</div>
          <pre style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.9, color: 'var(--text2)', whiteSpace: 'pre-wrap', maxHeight: 450, overflowY: 'auto' }}>
            {doc.raw_ocr_text || 'No OCR text available for this document type'}
          </pre>
        </div>
      )}
    </div>
  )
}
