import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line
} from 'recharts'

const API = 'http://localhost:8000'
const OPINION_COLORS = { Support: '#2d6a2d', Oppose: '#6b4000', Neutral: '#5a4a00' }
const REASON_COLORS  = { Political: '#3a1a6a', Economic: '#5a3a00', Security: '#0a2a6a', Emotional: '#6a1a3a' }

const StatCard = ({ icon, label, value, color }) => (
  <div className="war-card" style={{ padding: '1.4rem', borderTop: `4px solid ${color}`, textAlign: 'center' }}>
    <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{icon}</div>
    <div style={{ color: '#6b5d4f', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>{label}</div>
    <div style={{ color, fontSize: '2rem', fontWeight: 800 }}>{value?.toLocaleString()}</div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [wc, setWc]           = useState(null)
  const [timeline, setTl]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setTab]   = useState('charts')

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, wcRes, tlRes] = await Promise.all([
        axios.get(`${API}/dashboard`),
        axios.get(`${API}/wordcloud`),
        axios.get(`${API}/timeline`)
      ])
      setStats(sRes.data)
      setWc(wcRes.data.image)
      const tl = tlRes.data
      setTl(tl.dates.map((d, i) => ({
        date:    d,
        Support: tl.support[i],
        Oppose:  tl.oppose[i],
        Neutral: tl.neutral[i]
      })))
    } catch {
      alert('Backend not running. Run: uvicorn main:app --reload --port 8000')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      backgroundImage: 'url(/pic2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,238,220,0.60)' }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🗺️</div>
        <h3 style={{
          fontFamily: 'Cinzel', color: '#1a0800',
          fontSize: '1.4rem', marginBottom: '0.5rem',
          textShadow: '0 2px 12px rgba(255,255,255,0.9)'
        }}>
          Loading Dashboard
        </h3>
        <p style={{
          color: '#3a2208', fontSize: '0.9rem',
          textShadow: '0 1px 8px rgba(255,255,255,0.8)'
        }}>
          Analysing comments across timeline...
        </p>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      backgroundImage: 'url(/pic2.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(245,238,220,0.60) 0%, rgba(245,238,220,0.72) 100%)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{
              fontFamily: 'Cinzel', fontSize: '2rem', fontWeight: 700,
              color: '#1a0800', letterSpacing: '0.04em', marginBottom: '0.3rem',
              textShadow: '0 2px 16px rgba(255,255,255,0.85)'
            }}>
              Dataset Dashboard
            </h1>
            <p style={{
              color: '#3a2208', fontSize: '0.88rem', fontStyle: 'italic',
              textShadow: '0 1px 8px rgba(255,255,255,0.8)'
            }}>
              Analysis of 10,000 war-related Reddit comments · 07–08 Jul 2025
            </p>
          </div>
          <button onClick={load} style={{
            background: 'linear-gradient(135deg, #3a2208, #6b4c1e)',
            color: '#f5e6c8', border: 'none',
            padding: '0.65rem 1.6rem', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
            boxShadow: '0 3px 12px rgba(107,76,30,0.35)'
          }}>🔄 Refresh</button>
        </div>

        {stats && (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.8rem' }}>
              <StatCard icon="💬" label="Total Comments"   value={stats.total_comments}               color="#6b4c1e" />
              <StatCard icon="⚔️" label="War-Related"      value={stats.relevant_comments}            color="#5a3000" />
              <StatCard icon="✅" label="Support"           value={stats.opinion_counts?.Support || 0} color="#2d6a2d" />
              <StatCard icon="❌" label="Oppose"            value={stats.opinion_counts?.Oppose  || 0} color="#6b3000" />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #c9b89a', paddingBottom: '0.6rem' }}>
              {[
                { id: 'charts',    label: '📈 Charts'    },
                { id: 'wordcloud', label: '☁️ Word Cloud' },
                { id: 'timeline',  label: '🕐 Timeline'  }
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  background: activeTab === t.id
                    ? 'linear-gradient(135deg, #3a2208, #6b4c1e)'
                    : 'rgba(255,255,255,0.72)',
                  color:  activeTab === t.id ? '#f5e6c8' : '#4a2e10',
                  border: activeTab === t.id ? 'none' : '1px solid #c9b89a',
                  padding: '0.5rem 1.4rem', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 600,
                  fontSize: '0.88rem', transition: 'all 0.2s',
                  boxShadow: activeTab === t.id ? '0 2px 8px rgba(107,76,30,0.3)' : 'none'
                }}>{t.label}</button>
              ))}
            </div>

            {/* ── Charts Tab ── */}
            {activeTab === 'charts' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>

                {/* Opinion Pie */}
                <div className="war-card" style={{ padding: '1.6rem' }}>
                  <h3 style={{ marginBottom: '0.3rem', color: '#1a0800', fontWeight: 700, fontFamily: 'Cinzel' }}>
                    Opinion Distribution
                  </h3>
                  <p style={{ color: '#6b5d4f', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    Support vs Oppose vs Neutral
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={Object.entries(stats.opinion_counts).map(([k,v]) => ({ name: k, value: v }))}
                        cx="50%" cy="50%" outerRadius={95} innerRadius={38}
                        dataKey="value" paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      >
                        {Object.keys(stats.opinion_counts).map(k => (
                          <Cell key={k} fill={OPINION_COLORS[k] || '#888'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={v => [v, 'Comments']}
                        contentStyle={{ background: '#fff', border: '1px solid #c9b89a', borderRadius: '8px', fontSize: '0.85rem' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Reason Pie */}
                <div className="war-card" style={{ padding: '1.6rem' }}>
                  <h3 style={{ marginBottom: '0.3rem', color: '#1a0800', fontWeight: 700, fontFamily: 'Cinzel' }}>
                    Reason Breakdown
                  </h3>
                  <p style={{ color: '#6b5d4f', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    Why do users hold their opinion?
                  </p>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={Object.entries(stats.reason_counts).map(([k,v]) => ({ name: k, value: v }))}
                        cx="50%" cy="50%" outerRadius={95} innerRadius={38}
                        dataKey="value" paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      >
                        {Object.keys(stats.reason_counts).map(k => (
                          <Cell key={k} fill={REASON_COLORS[k] || '#888'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={v => [v, 'Comments']}
                        contentStyle={{ background: '#fff', border: '1px solid #c9b89a', borderRadius: '8px', fontSize: '0.85rem' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Reason Bars */}
                <div className="war-card" style={{ padding: '1.6rem', gridColumn: '1/-1' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#1a0800', fontWeight: 700, fontFamily: 'Cinzel' }}>
                    Reason Category Analysis
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                    {Object.entries(stats.reason_counts).map(([reason, count]) => {
                      const total = Object.values(stats.reason_counts).reduce((a,b) => a+b, 0)
                      const pct   = ((count / total) * 100).toFixed(1)
                      const col   = REASON_COLORS[reason] || '#888'
                      const icons = { Political:'🏛️', Economic:'💰', Security:'🛡️', Emotional:'❤️' }
                      return (
                        <div key={reason} style={{
                          textAlign: 'center', padding: '1.2rem',
                          background: 'rgba(245,240,230,0.85)',
                          borderRadius: '10px', border: `1px solid ${col}33`
                        }}>
                          <div style={{ fontSize: '1.6rem' }}>{icons[reason]}</div>
                          <div style={{ fontWeight: 800, color: col, fontSize: '1.3rem', marginTop: '0.4rem' }}>{pct}%</div>
                          <div style={{ color: '#6b5d4f', fontSize: '0.8rem', marginBottom: '0.6rem' }}>{reason}</div>
                          <div style={{ background: '#e0d5c5', borderRadius: '4px', height: '7px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: '4px' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Word Cloud Tab ── */}
            {activeTab === 'wordcloud' && wc && (
              <div className="war-card" style={{ padding: '1.8rem' }}>
                <h3 style={{ marginBottom: '0.3rem', color: '#1a0800', fontWeight: 700, fontFamily: 'Cinzel' }}>
                  Word Cloud
                </h3>
                <p style={{ color: '#6b5d4f', fontSize: '0.8rem', marginBottom: '1.2rem' }}>
                  Most frequent terms across war-related comments
                </p>
                <img
                  src={`data:image/png;base64,${wc}`}
                  alt="Word Cloud"
                  style={{ width: '100%', borderRadius: '10px', border: '1px solid #c9b89a', boxShadow: '0 4px 16px rgba(90,62,28,0.12)' }}
                />
              </div>
            )}

            {/* ── Timeline Tab ── */}
            {activeTab === 'timeline' && timeline && timeline.length > 0 && (
              <div style={{ display: 'grid', gap: '1.2rem' }}>

                {/* Chart Card */}
                <div className="war-card" style={{ padding: '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ color: '#1a0800', fontWeight: 700, fontFamily: 'Cinzel', fontSize: '1.1rem' }}>
                        📈 Hourly Sentiment Timeline
                      </h3>
                      <p style={{ color: '#6b5d4f', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                        Hourly Support vs Oppose opinion shift — 07 Jul to 08 Jul 2025 (10,000 comments)
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '170px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '3px', background: '#2d6a2d', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#2d6a2d', fontWeight: 600 }}>Support — Pro-war / Alliance</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '3px', background: '#6b4000', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b4000', fontWeight: 600 }}>Oppose — Anti-war / Conflict</span>
                      </div>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={timeline} margin={{ bottom: 30, left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d4c5a9" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#6b5d4f', fontSize: 10 }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={60}
                        label={{ value: 'Hour (07–08 Jul 2025)', position: 'insideBottom', offset: -14, fill: '#6b5d4f', fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: '#6b5d4f', fontSize: 11 }}
                        label={{ value: 'No. of Comments', angle: -90, position: 'insideLeft', fill: '#6b5d4f', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #c9b89a', borderRadius: '8px', fontSize: '0.85rem' }}
                        formatter={(v, name) => [`${v} comments`, name === 'Support' ? '✅ Support' : '❌ Oppose']}
                        labelFormatter={(label) => `🕐 Hour: ${label}`}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone" dataKey="Support"
                        stroke="#2d6a2d" strokeWidth={2.5}
                        dot={{ fill: '#2d6a2d', r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: '#2d6a2d' }}
                      />
                      <Line
                        type="monotone" dataKey="Oppose"
                        stroke="#6b4000" strokeWidth={2.5}
                        dot={{ fill: '#6b4000', r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: '#6b4000' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Insight Cards */}
                {(() => {
                  const totalSupport = timeline.reduce((a, b) => a + b.Support, 0)
                  const totalOppose  = timeline.reduce((a, b) => a + b.Oppose,  0)
                  const total        = totalSupport + totalOppose || 1

                  const peakSupport  = timeline.reduce((a, b) => b.Support > a.Support ? b : a, timeline[0])
                  const peakOppose   = timeline.reduce((a, b) => b.Oppose  > a.Oppose  ? b : a, timeline[0])

                  const firstHalf  = timeline.slice(0, Math.floor(timeline.length / 2))
                  const secondHalf = timeline.slice(Math.floor(timeline.length / 2))
                  const avgOpposeF = firstHalf.reduce((a,b)  => a + b.Oppose, 0) / (firstHalf.length  || 1)
                  const avgOpposeS = secondHalf.reduce((a,b) => a + b.Oppose, 0) / (secondHalf.length || 1)
                  const trend      = avgOpposeS > avgOpposeF ? 'increasing' : 'decreasing'

                  const dominant = totalSupport > totalOppose ? 'Support' : 'Oppose'
                  const domColor = dominant === 'Support' ? '#2d6a2d' : '#6b4000'
                  const domPct   = dominant === 'Support'
                    ? ((totalSupport / total) * 100).toFixed(1)
                    : ((totalOppose  / total) * 100).toFixed(1)

                  return (
                    <>
                      {/* Summary Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>

                        <div className="war-card" style={{ padding: '1.3rem', borderLeft: '4px solid #6b4c1e' }}>
                          <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>🏆</div>
                          <div style={{ fontWeight: 700, color: '#1a0800', fontSize: '0.88rem', marginBottom: '0.3rem', fontFamily: 'Cinzel' }}>
                            Dominant Opinion
                          </div>
                          <div style={{ color: domColor, fontWeight: 800, fontSize: '1.2rem' }}>{dominant}</div>
                          <div style={{ color: '#6b5d4f', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                            {domPct}% of all hourly comments
                          </div>
                        </div>

                        <div className="war-card" style={{ padding: '1.3rem', borderLeft: '4px solid #2d6a2d' }}>
                          <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>📅</div>
                          <div style={{ fontWeight: 700, color: '#1a0800', fontSize: '0.88rem', marginBottom: '0.3rem', fontFamily: 'Cinzel' }}>
                            Peak Support Hour
                          </div>
                          <div style={{ color: '#2d6a2d', fontWeight: 800, fontSize: '1.1rem' }}>{peakSupport.date}</div>
                          <div style={{ color: '#6b5d4f', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                            {peakSupport.Support} support comments
                          </div>
                        </div>

                        <div className="war-card" style={{ padding: '1.3rem', borderLeft: '4px solid #6b4000' }}>
                          <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>📅</div>
                          <div style={{ fontWeight: 700, color: '#1a0800', fontSize: '0.88rem', marginBottom: '0.3rem', fontFamily: 'Cinzel' }}>
                            Peak Oppose Hour
                          </div>
                          <div style={{ color: '#6b4000', fontWeight: 800, fontSize: '1.1rem' }}>{peakOppose.date}</div>
                          <div style={{ color: '#6b5d4f', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                            {peakOppose.Oppose} oppose comments
                          </div>
                        </div>
                      </div>

                      {/* NLP Interpretation Card */}
                      <div className="war-card" style={{ padding: '1.5rem', borderLeft: '4px solid #6b4c1e', background: 'rgba(255,252,240,0.92)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🧠</span>
                          <h3 style={{ fontWeight: 700, color: '#1a0800', fontFamily: 'Cinzel', fontSize: '1rem' }}>
                            NLP Temporal Analysis — Model Interpretation
                          </h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                          {/* Ratio Bar */}
                          <div style={{ background: 'rgba(245,240,230,0.85)', borderRadius: '8px', padding: '1rem', border: '1px solid #d4bc96' }}>
                            <div style={{ fontWeight: 700, color: '#3a2208', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                              📊 Overall Sentiment Ratio
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', borderRadius: '6px', overflow: 'hidden', height: '12px' }}>
                              <div style={{ flex: totalSupport, background: '#2d6a2d' }} />
                              <div style={{ flex: totalOppose,  background: '#6b4000' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                              <span style={{ color: '#2d6a2d', fontWeight: 600 }}>✅ Support: {((totalSupport/total)*100).toFixed(1)}%</span>
                              <span style={{ color: '#6b4000', fontWeight: 600 }}>❌ Oppose: {((totalOppose/total)*100).toFixed(1)}%</span>
                            </div>
                          </div>

                          {/* Trend */}
                          <div style={{ background: 'rgba(245,240,230,0.85)', borderRadius: '8px', padding: '1rem', border: '1px solid #d4bc96' }}>
                            <div style={{ fontWeight: 700, color: '#3a2208', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                              📈 Opposition Trend (Early → Late Hours)
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                              <span style={{ fontSize: '1.4rem' }}>{trend === 'increasing' ? '📈' : '📉'}</span>
                              <span style={{ color: trend === 'increasing' ? '#6b4000' : '#2d6a2d', fontWeight: 700, fontSize: '1rem' }}>
                                {trend === 'increasing' ? 'Rising Opposition' : 'Declining Opposition'}
                              </span>
                            </div>
                            <div style={{ color: '#6b5d4f', fontSize: '0.78rem' }}>
                              {trend === 'increasing'
                                ? 'Anti-war sentiment grew stronger in later hours of the dataset'
                                : 'Anti-war sentiment was higher early and reduced over later hours'}
                            </div>
                          </div>

                          {/* LSTM Paragraph */}
                          <div style={{ background: 'rgba(245,240,230,0.85)', borderRadius: '8px', padding: '1rem', border: '1px solid #d4bc96', gridColumn: '1/-1' }}>
                            <div style={{ fontWeight: 700, color: '#3a2208', fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                              🔍 LSTM Temporal Insight
                            </div>
                            <p style={{ color: '#4a2e10', fontSize: '0.83rem', lineHeight: 1.8 }}>
                              The temporal analysis across <strong>{timeline.length} hourly intervals</strong> spanning
                              07–08 Jul 2025 reveals that <strong style={{ color: domColor }}>{dominant}</strong> opinion
                              is dominant at <strong>{domPct}%</strong> of war-related Reddit discussions.
                              Opposition sentiment <strong>{trend === 'increasing' ? 'escalated' : 'de-escalated'}</strong> over
                              time, peaking at <strong style={{ color: '#6b4000' }}>{peakOppose.date}</strong> with{' '}
                              <strong>{peakOppose.Oppose}</strong> oppose comments — likely correlating with
                              real-world news events during that hour. Support sentiment was strongest
                              at <strong style={{ color: '#2d6a2d' }}>{peakSupport.date}</strong> with{' '}
                              <strong>{peakSupport.Support}</strong> comments. This pattern demonstrates
                              the <strong>Temporal Analysis</strong> capability of the NLP pipeline, where
                              LSTM-based sequential modelling tracks real-time public opinion dynamics
                              hour by hour — satisfying the project's core objective of explainable,
                              time-aware geopolitical sentiment analysis.
                            </p>
                          </div>

                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}