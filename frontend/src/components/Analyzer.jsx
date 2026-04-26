import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

const OPINION_STYLE = {
  Support:    { color: '#1a5c1a', bg: 'rgba(240,255,240,0.93)', border: '#6abf6a', icon: '✅' },
  Oppose:     { color: '#6b3000', bg: 'rgba(255,245,235,0.93)', border: '#c87a30', icon: '❌' },
  Neutral:    { color: '#5a4a00', bg: 'rgba(255,252,225,0.93)', border: '#b8982a', icon: '⚖️' },
  Irrelevant: { color: '#5a5a5a', bg: 'rgba(245,245,245,0.93)', border: '#aaaaaa', icon: '🚫' }
}

const REASON_STYLE = {
  Political:  { color: '#3a1a6a', bg: 'rgba(245,240,255,0.93)', border: '#8a60c4', icon: '🏛️' },
  Economic:   { color: '#5a3a00', bg: 'rgba(255,248,225,0.93)', border: '#b89040', icon: '💰' },
  Security:   { color: '#0a2a6a', bg: 'rgba(235,242,255,0.93)', border: '#5080c4', icon: '🛡️' },
  Emotional:  { color: '#6a1a3a', bg: 'rgba(255,235,245,0.93)', border: '#c45080', icon: '❤️' }
}

const ENTITY_STYLE = {
  GPE:    { color: '#0a3a5a', bg: '#e8f4ff', border: '#5aaad4' },
  ORG:    { color: '#5a2a00', bg: '#fff4e8', border: '#d4905a' },
  PERSON: { color: '#1a4a1a', bg: '#eaffe8', border: '#5ab05a' },
  NORP:   { color: '#3a1a6a', bg: '#f4eeff', border: '#9060d4' }
}

export default function Analyzer() {
  const [text, setText]       = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const wordCount = text.split(' ').filter(Boolean).length

  const analyze = async () => {
    if (!text.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await axios.post(`${API}/analyze`, { text })
      setResult(res.data)
    } catch {
      setError('Backend not running. Open terminal in backend folder and run: uvicorn main:app --reload --port 8000')
    }
    setLoading(false)
  }

  const opinion  = result?.opinion
  const opStyle  = opinion ? OPINION_STYLE[opinion] : null
  const maxScore = result?.highlights?.length ? Math.max(...result.highlights.map(h => h.score)) : 1

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      backgroundImage: 'url(/pic1.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* lighter overlay — more image visible */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(245,240,230,0.60) 0%, rgba(245,240,230,0.72) 100%)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1050px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Title */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'Cinzel', fontSize: '2rem', fontWeight: 700,
            color: '#1a0800', letterSpacing: '0.04em', marginBottom: '0.4rem',
            textShadow: '0 2px 16px rgba(255,255,255,0.9)'
          }}>
            Comment Analyzer
          </h1>
          <p style={{ color: '#4a2e10', fontSize: '0.88rem', fontStyle: 'italic',
            textShadow: '0 1px 8px rgba(255,255,255,0.8)' }}>
            Paste a Reddit comment — classify opinion, extract reasons, and visualize explainability
          </p>
        </div>

        {/* Input Card */}
        <div className="war-card" style={{ padding: '1.8rem', marginBottom: '1.8rem', borderTop: '4px solid #6b4c1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>📰</span>
              <span style={{ fontWeight: 700, color: '#2a1a08', fontSize: '0.95rem', fontFamily: 'Cinzel' }}>
                Enter War-Related Comment
              </span>
            </div>
            <span style={{
              background: wordCount > 30 ? '#fff8e0' : '#f5f0e8',
              border: `1px solid ${wordCount > 30 ? '#c8a84b' : '#c9b89a'}`,
              color: wordCount > 30 ? '#7a5c1e' : '#888',
              padding: '0.2rem 0.8rem', borderRadius: '20px',
              fontSize: '0.78rem', fontWeight: 600
            }}>
              {wordCount} words {wordCount > 30 ? '· Will summarize' : ''}
            </span>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder='e.g. "These sanctions are destroying the economy while innocent civilians suffer. NATO must intervene..."'
            rows={5}
            style={{
              width: '100%', background: 'rgba(255,252,245,0.97)',
              color: '#1a0800', border: '1.5px solid #c9b89a',
              borderRadius: '10px', padding: '1rem 1.1rem',
              fontSize: '0.95rem', resize: 'vertical',
              fontFamily: 'Inter', outline: 'none', lineHeight: 1.7
            }}
            onFocus={e => e.target.style.borderColor = '#6b4c1e'}
            onBlur={e  => e.target.style.borderColor = '#c9b89a'}
          />

          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.1rem' }}>
            <button onClick={analyze} disabled={loading || !text.trim()} style={{
              background: loading ? '#ccc' : 'linear-gradient(135deg, #3a2208, #6b4c1e)',
              color: '#f5e6c8', border: 'none',
              padding: '0.65rem 2.2rem', borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '0.95rem',
              boxShadow: loading ? 'none' : '0 3px 12px rgba(107,76,30,0.35)',
              transition: 'all 0.2s'
            }}>
              {loading ? '⏳ Analyzing...' : '⚔️ Analyze'}
            </button>
            <button onClick={() => { setText(''); setResult(null); setError('') }} style={{
              background: 'transparent', color: '#6b5d4f',
              border: '1px solid #c9b89a', padding: '0.65rem 1.2rem',
              borderRadius: '8px', cursor: 'pointer', fontSize: '0.88rem'
            }}>Clear</button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,245,235,0.95)', border: '1px solid #c87a30', color: '#6b3000', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ display: 'grid', gap: '1.2rem' }}>

            {/* Summary */}
            {result.summarized && (
              <div className="war-card" style={{ padding: '1.3rem', borderLeft: '4px solid #b89040', background: 'rgba(255,252,235,0.94)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.7rem' }}>
                  <span>📝</span>
                  <span style={{ fontWeight: 700, color: '#5a3a00', fontSize: '0.9rem' }}>
                    Long Comment Detected — Summarized for Analysis
                  </span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid #c8a84b', borderRadius: '8px', padding: '0.9rem', color: '#1a0800', fontStyle: 'italic', fontSize: '0.93rem', lineHeight: 1.7 }}>
                  "{result.summary}"
                </div>
              </div>
            )}

            {/* Irrelevant */}
            {!result.relevant && (
              <div className="war-card" style={{ padding: '2.5rem', textAlign: 'center', borderTop: '4px solid #aaa' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🚫</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#5a5a5a', marginBottom: '0.5rem', fontFamily: 'Cinzel' }}>
                  Not War-Related
                </h3>
                <p style={{ color: '#888', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                  This comment does not appear to be related to war, conflict, or geopolitical events. No opinion classification is performed.
                </p>
                <div style={{ marginTop: '1.2rem', display: 'inline-block', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px', padding: '0.5rem 1.5rem' }}>
                  <span style={{ color: '#888' }}>Opinion: </span>
                  <span style={{ color: '#555', fontWeight: 700 }}>Irrelevant</span>
                </div>
              </div>
            )}

            {/* Relevant */}
            {result.relevant && (
              <>
                {/* 3 Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                  <div className="war-card" style={{ padding: '1.4rem', textAlign: 'center', borderTop: `4px solid ${opStyle.border}`, background: opStyle.bg }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{opStyle.icon}</div>
                    <div style={{ color: '#6b5d4f', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Opinion</div>
                    <div style={{ color: opStyle.color, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Cinzel' }}>{opinion}</div>
                  </div>

                  {result.reason && (() => {
                    const rs = REASON_STYLE[result.reason]
                    return (
                      <div className="war-card" style={{ padding: '1.4rem', textAlign: 'center', borderTop: `4px solid ${rs.border}`, background: rs.bg }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{rs.icon}</div>
                        <div style={{ color: '#6b5d4f', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Reason</div>
                        <div style={{ color: rs.color, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Cinzel' }}>{result.reason}</div>
                      </div>
                    )
                  })()}

                  <div className="war-card" style={{ padding: '1.4rem', textAlign: 'center', borderTop: '4px solid #5080c4', background: 'rgba(235,242,255,0.93)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>📊</div>
                    <div style={{ color: '#6b5d4f', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Confidence</div>
                    <div style={{ color: '#0a2a6a', fontSize: '1.5rem', fontWeight: 800 }}>{result.confidence}%</div>
                  </div>
                </div>

                {/* XAI */}
                <div className="war-card" style={{ padding: '1.6rem', borderLeft: '4px solid #6b4c1e' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span>🧠</span>
                    <h3 style={{ fontWeight: 700, color: '#2a1a08', fontSize: '1rem', fontFamily: 'Cinzel' }}>
                      Explainable AI — Attention Highlights
                    </h3>
                  </div>
                  <p style={{ color: '#6b5d4f', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    Words that most influenced the model's decision. Higher score = more attention.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {result.highlights.map((h, i) => {
                      const intensity = h.score / maxScore
                      const isSupport = opinion === 'Support'
                      const bg  = isSupport
                        ? `rgba(26,92,26,${0.1 + intensity * 0.45})`
                        : opinion === 'Oppose'
                        ? `rgba(107,76,30,${0.1 + intensity * 0.45})`
                        : `rgba(90,74,0,${0.1 + intensity * 0.45})`
                      const col = isSupport ? '#1a5c1a' : opinion === 'Oppose' ? '#5a3000' : '#4a3a00'
                      return (
                        <span key={i} style={{
                          background: bg, color: col,
                          border: `1px solid ${col}44`,
                          padding: '0.35rem 0.9rem', borderRadius: '20px',
                          fontSize: '0.85rem', fontWeight: 600,
                          fontFamily: 'JetBrains Mono'
                        }}>
                          {h.word}
                          <span style={{ opacity: 0.6, fontSize: '0.72rem', marginLeft: '4px' }}>({h.score.toFixed(3)})</span>
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Entities */}
                {result.entities.length > 0 && (
                  <div className="war-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                      <span>🗺️</span>
                      <h3 style={{ fontWeight: 700, color: '#2a1a08', fontSize: '1rem', fontFamily: 'Cinzel' }}>Named Entities</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                      {result.entities.map((e, i) => {
                        const es = ENTITY_STYLE[e.label] || { color: '#444', bg: '#f5f5f5', border: '#ccc' }
                        return (
                          <span key={i} style={{ background: es.bg, border: `1px solid ${es.border}`, color: es.color, padding: '0.3rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                            {e.text}
                            <span style={{ opacity: 0.6, fontSize: '0.72rem', marginLeft: '4px' }}>[{e.label}]</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Noun Chunks */}
                {result.noun_chunks.length > 0 && (
                  <div className="war-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                      <span>🔗</span>
                      <h3 style={{ fontWeight: 700, color: '#2a1a08', fontSize: '1rem', fontFamily: 'Cinzel' }}>Key Noun Phrases</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                      {result.noun_chunks.map((chunk, i) => (
                        <span key={i} style={{ background: 'rgba(245,240,230,0.92)', border: '1px solid #c9b89a', color: '#4a2e10', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                          {chunk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}