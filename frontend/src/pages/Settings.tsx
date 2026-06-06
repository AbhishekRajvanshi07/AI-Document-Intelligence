export default function Settings() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Settings</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Cloud configuration overview</div>
      {[
        { title: 'Backend (Render)', items: [['API URL', apiUrl], ['Runtime', 'Python 3.12'], ['Workers', '4 (uvicorn)'], ['OCR', 'Tesseract 5.3 + LSTM'], ['OpenCV', '4.10.0-headless']] },
        { title: 'Database (Neon)', items: [['Provider', 'Neon Serverless PostgreSQL'], ['Version', 'PostgreSQL 16'], ['Storage', '3 GB (free tier)'], ['Connection', 'asyncpg + SQLAlchemy 2.0'], ['SSL', 'Required']] },
        { title: 'File Storage (Cloudflare R2)', items: [['Provider', 'Cloudflare R2'], ['Free Storage', '10 GB'], ['Egress', 'Free (zero egress fees)'], ['SDK', 'boto3 (S3-compatible)'], ['Presigned URLs', '1 hour expiry']] },
        { title: 'Cache (Upstash Redis)', items: [['Provider', 'Upstash Serverless Redis'], ['Free Commands', '10,000/day'], ['TLS', 'Enabled (rediss://)'], ['Use', 'Rate limiting / queuing']] },
      ].map(section => (
        <div key={section.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 12 }}>{section.title}</div>
          {section.items.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)', minWidth: 120 }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
