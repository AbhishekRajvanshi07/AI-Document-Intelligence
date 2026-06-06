import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { FileText, LayoutDashboard, Upload, Cpu, Code2, GitBranch, Settings, Zap } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/analysis', icon: Cpu, label: 'Analysis' },
  { to: '/api-docs', icon: Code2, label: 'API Docs' },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const S: Record<string, React.CSSProperties> = {
  shell: { display: 'grid', gridTemplateColumns: '220px 1fr', gridTemplateRows: '56px 1fr', height: '100vh' },
  topbar: { gridColumn: '1/-1', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12 },
  sidebar: { background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '16px 0', overflowY: 'auto' },
  main: { overflowY: 'auto', background: 'var(--bg)' },
}

export default function Layout() {
  const navigate = useNavigate()
  return (
    <div style={S.shell}>
      {/* Topbar */}
      <div style={S.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#00d4aa,#3d8bff)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={14} color="white" />
          </div>
          DocIntel
          <span style={{ padding: '2px 8px', background: 'var(--teal-dim)', color: 'var(--teal)', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)' }}>v2.4.1</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulse 2s ease-in-out infinite' }} />
          Cloud: Neon · Upstash · R2 · Render
        </div>
        <button onClick={() => navigate('/upload')} style={{ marginLeft: 12, padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
          Upload
        </button>
        <button onClick={() => navigate('/analysis')} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--teal)', background: 'var(--teal)', color: '#000', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={12} /> New Analysis
        </button>
      </div>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{ padding: '0 12px 8px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.5px', color: 'var(--text3)', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>Navigation</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7,
              cursor: 'pointer', fontSize: 13, color: isActive ? 'var(--teal)' : 'var(--text2)',
              background: isActive ? 'var(--teal-dim)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(0,212,170,.15)' : 'transparent'}`,
              marginBottom: 2, textDecoration: 'none', transition: '.15s',
            })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Cloud services footer */}
        <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Cloud Services</div>
          {[
            ['Neon', 'PostgreSQL', '#22c55e'],
            ['Upstash', 'Redis', '#f0a500'],
            ['Cloudflare R2', 'Storage', '#3d8bff'],
            ['Render', 'Backend', '#a78bfa'],
            ['Vercel', 'Frontend', '#00d4aa'],
          ].map(([name, role, color]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 10, fontFamily: 'var(--mono)', marginBottom: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
              <span style={{ color: 'var(--text2)', flex: 1 }}>{name}</span>
              <span style={{ color: 'var(--text3)' }}>{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={S.main}>
        <Outlet />
      </div>
    </div>
  )
}
