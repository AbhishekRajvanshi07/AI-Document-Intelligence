import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Cloud, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadDocument } from '../utils/api'

export default function Upload() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return
    setUploading(true)
    setProgress(0)

    for (const file of files) {
      try {
        setStage(`Uploading ${file.name} → Cloudflare R2...`)
        setProgress(20)

        const fd = new FormData()
        fd.append('file', file)
        fd.append('lang', 'eng')

        setStage('Running OpenCV preprocessing...')
        setProgress(40)

        const res = await uploadDocument(fd)
        setProgress(80)

        setStage('Running Tesseract OCR + spaCy NLP...')
        await new Promise(r => setTimeout(r, 600))
        setProgress(95)

        setStage('Saving to Neon PostgreSQL...')
        await new Promise(r => setTimeout(r, 300))
        setProgress(100)

        toast.success(`${file.name} processed! ${res.data.fields_extracted} fields extracted.`)
      } catch (err: any) {
        toast.error(`Failed: ${err.response?.data?.detail || err.message}`)
      }
    }

    setUploading(false)
    setStage('')
    setTimeout(() => navigate('/documents'), 800)
  }, [navigate])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': [],
      'image/*': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
  })

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Upload Documents</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>
        Files go to <span style={{ color: 'var(--blue)', fontFamily: 'var(--mono)' }}>Cloudflare R2</span> → OCR on <span style={{ color: 'var(--purple)', fontFamily: 'var(--mono)' }}>Render</span> → metadata in <span style={{ color: 'var(--teal)', fontFamily: 'var(--mono)' }}>Neon PostgreSQL</span>
      </div>

      <div {...getRootProps()} style={{
        border: `2px dashed ${isDragActive ? 'var(--teal)' : 'var(--border2)'}`,
        borderRadius: 16, background: isDragActive ? 'rgba(0,212,170,.04)' : 'var(--surface)',
        padding: '48px 24px', textAlign: 'center', cursor: uploading ? 'default' : 'pointer',
        transition: '.2s', marginBottom: 24,
      }}>
        <input {...getInputProps()} disabled={uploading} />
        <div style={{ width: 52, height: 52, background: 'var(--teal-dim)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(0,212,170,.2)' }}>
          <Cloud size={26} color="var(--teal)" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
          {isDragActive ? 'Drop to upload...' : uploading ? 'Processing...' : 'Drop files or click to browse'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          PDF, PNG, JPG, TIFF, BMP, DOCX — max 50 MB each
        </div>

        {uploading && (
          <div style={{ maxWidth: 360, margin: '0 auto' }}>
            <div style={{ fontSize: 12, color: 'var(--teal)', marginBottom: 8 }}>{stage}</div>
            <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,var(--teal),var(--blue))', borderRadius: 3, transition: '.4s cubic-bezier(.22,1,.36,1)' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{progress}% complete</div>
          </div>
        )}

        {!uploading && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['PDF', 'PNG', 'JPG', 'TIFF', 'BMP', 'DOCX'].map(f => (
              <span key={f} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{f}</span>
            ))}
          </div>
        )}
      </div>

      {/* Cloud pipeline viz */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 16 }}>Cloud Processing Pipeline</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { step: '1', label: 'Upload', sub: 'Cloudflare R2', color: 'var(--blue)' },
            { step: '2', label: 'Preprocess', sub: 'OpenCV (Render)', color: 'var(--amber)' },
            { step: '3', label: 'OCR', sub: 'Tesseract 5.3', color: 'var(--teal)' },
            { step: '4', label: 'NLP', sub: 'spaCy NER', color: 'var(--purple)' },
            { step: '5', label: 'Store', sub: 'Neon PostgreSQL', color: 'var(--green)' },
          ].map((s, i, arr) => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${s.color}20`, border: `1px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: s.color, margin: '0 auto 4px' }}>{s.step}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{s.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{s.sub}</div>
              </div>
              {i < arr.length - 1 && <div style={{ color: 'var(--text3)', fontSize: 16, marginBottom: 20 }}>→</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 12 }}>OpenCV Preprocessing</div>
          {[['Deskew', 'Hough transform rotation fix'], ['Denoise', 'Gaussian blur'], ['Binarize', "Otsu's thresholding"], ['CLAHE', 'Contrast enhancement'], ['Upsample', '300 DPI minimum']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, padding: '7px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--teal)', minWidth: 72 }}>{k}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 12 }}>OCR + NLP Config</div>
          {[['Engine', 'Tesseract 5.3 + LSTM'], ['PSM Mode', 'Auto + OSD (3)'], ['Languages', 'eng + hin + ara'], ['NLP', 'spaCy en_core_web_sm'], ['Output', 'JSON + hOCR']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, padding: '7px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--blue)', minWidth: 72 }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
