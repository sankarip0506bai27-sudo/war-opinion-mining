import { useState } from 'react'
import Analyzer  from './components/Analyzer'
import Dashboard from './components/Dashboard'
import './index.css'

export default function App() {
  const [page, setPage] = useState('analyzer')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(20,12,4,0.96)',
        borderBottom: '2px solid #6b4c1e',
        padding: '0 2.5rem',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
          <span style={{ fontSize: '1.4rem' }}>⚔️</span>
          <span style={{
            fontFamily: 'Cinzel', fontWeight: 700,
            fontSize: '1.05rem', color: '#e8d5b0',
            letterSpacing: '0.07em'
          }}>
            WarOpinion<span style={{ color: '#c8a05a' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'analyzer',  label: '🔍 Analyzer'  },
            { id: 'dashboard', label: '📊 Dashboard' }
          ].map(p => (
            <button key={p.id} onClick={() => setPage(p.id)} style={{
              background: page === p.id ? '#6b4c1e' : 'transparent',
              color:  page === p.id ? '#f5e6c8' : '#a08060',
              border: page === p.id ? '1px solid #8b6530' : '1px solid #3a2a14',
              padding: '0.42rem 1.3rem',
              borderRadius: '7px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              transition: 'all 0.2s'
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ flex: 1 }}>
        {page === 'analyzer'  && <Analyzer />}
        {page === 'dashboard' && <Dashboard />}
      </div>

    </div>
  )
}