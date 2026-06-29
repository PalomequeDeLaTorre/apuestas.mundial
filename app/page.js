// app/page.js
'use client'

import { useState, useEffect, useCallback } from 'react'
import { GRUPOS, EQUIPOS_ELIMINADOS } from '@/lib/equipos'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Build a lookup: nombre → bandera (client-side, from same data)
const BANDERA_MAP = Object.fromEntries(
  GRUPOS.flatMap((g) => g.equipos.map((e) => [e.nombre, e.bandera]))
)

// ─── Sub-components ─────────────────────────────────────────────────────────

function TrophyIcon() {
  return (
    <span className="text-4xl md:text-5xl leading-none select-none" aria-hidden>
      🏆
    </span>
  )
}

function ApuestaCard({ apuesta, isNew }) {
  // Comprobamos si el equipo de esta apuesta está en la lista de eliminados
  const isEliminado = EQUIPOS_ELIMINADOS.includes(apuesta.equipo)

  return (
    <div
      className={`card-apuesta p-5 flex flex-col gap-3 animate-slide-up ${
        isNew ? 'card-new' : ''
      } ${isEliminado ? 'opacity-50 grayscale' : ''}`} // <-- Bajamos opacidad y ponemos en grises si está eliminado
    >
      {/* Team flag + name */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none select-none" role="img" aria-label={apuesta.equipo}>
            {apuesta.bandera_emoji}
          </span>
          <div>
            <p 
              className={`${
                isEliminado ? 'text-red-400 line-through' : 'text-[#FFD700]'
              } font-bold text-lg leading-tight transition-colors`}
            >
              {apuesta.equipo}
            </p>
            <p className="text-white/50 text-xs font-mono mt-0.5">Mi selección</p>
          </div>
        </div>
        
        {/* Etiqueta de Eliminado */}
        {isEliminado && (
          <span className="bg-red-950/80 text-red-400 border border-red-500/30 text-[10px] uppercase font-bold px-2 py-1 rounded">
            Eliminado
          </span>
        )}
      </div>

      {/* Divider */}
      <div className={`${isEliminado ? 'bg-red-500/20' : 'gold-line'} h-px w-full`} />

      {/* Participant name */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">Participante</p>
          <p className="text-white font-semibold text-base">{apuesta.participante}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">Registrado</p>
          <p className="text-white/60 text-xs font-mono">{formatDate(apuesta.created_at)}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="col-span-full text-center py-20 flex flex-col items-center gap-4 animate-fade-in">
      <span className="text-6xl select-none">⚽</span>
      <p className="text-white/40 text-lg font-medium">Aún no hay apuestas registradas.</p>
      <p className="text-white/25 text-sm">¡Sé el primero en apostar!</p>
    </div>
  )
}

function LoadingGrid() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="card-apuesta p-5 h-36 animate-pulse"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex gap-3 items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          </div>
          <div className="h-px bg-white/5 mb-3" />
          <div className="flex justify-between">
            <div className="h-4 bg-white/5 rounded w-1/3" />
            <div className="h-4 bg-white/5 rounded w-1/4" />
          </div>
        </div>
      ))}
    </>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [apuestas, setApuestas] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newId, setNewId] = useState(null)

  // Form state
  const [participante, setParticipante] = useState('')
  const [equipo, setEquipo] = useState('')
  const [banderaPreview, setBanderaPreview] = useState('')

  // Feedback
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // ── Data fetching ──
  const fetchApuestas = useCallback(async () => {
    try {
      const res = await fetch('/api/apuestas', { cache: 'no-store' })
      const data = await res.json()
      if (data.apuestas) setApuestas(data.apuestas)
    } catch {
      // silently fail on background refresh
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApuestas()
  }, [fetchApuestas])

  // Update flag preview when team changes
  useEffect(() => {
    setBanderaPreview(equipo ? BANDERA_MAP[equipo] ?? '' : '')
  }, [equipo])

  // Clear feedback after delay
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 6000)
      return () => clearTimeout(t)
    }
  }, [successMsg])

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 6000)
      return () => clearTimeout(t)
    }
  }, [errorMsg])

  // ── Form submit ──
  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!participante.trim()) {
      setErrorMsg('⚠️ El nombre del participante es obligatorio.')
      return
    }
    if (!equipo) {
      setErrorMsg('⚠️ Debes seleccionar un equipo.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/apuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participante: participante.trim(), equipo }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Ocurrió un error. Intenta de nuevo.')
        return
      }

      // Success
      setSuccessMsg('✅ ¡Apuesta registrada! Una vez guardada ya no podrás modificarla.')
      setNewId(data.apuesta.id)
      setParticipante('')
      setEquipo('')
      setBanderaPreview('')

      // Refresh list
      await fetchApuestas()

      // Clear new highlight after animation
      setTimeout(() => setNewId(null), 3000)
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ──
  return (
    <main className="min-h-screen bg-black pb-20">

      {/* ── Header ── */}
      <header className="relative overflow-hidden border-b border-[rgba(255,215,0,0.15)]">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #FFD700 0%, transparent 50%),
                              radial-gradient(circle at 80% 50%, #FFD700 0%, transparent 50%)`,
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 py-10 md:py-14 flex flex-col items-center text-center gap-4">
          <TrophyIcon />

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
            <span className="text-gold-gradient">Apuestas de la Plebe</span>
          </h1>

          <p className="text-[#FFD700]/70 font-semibold text-base md:text-lg tracking-wide uppercase">
            Copa del Mundo 2026
          </p>

          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span>🇲🇽</span>
            <span className="text-white/20">·</span>
            <span>🇺🇸</span>
            <span className="text-white/20">·</span>
            <span>🇨🇦</span>
          </div>

          <div className="gold-line w-48 mt-2" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-10">

        {/* ── Form Section ── */}
        <section>
          <div className="max-w-lg mx-auto">
            <h2 className="text-[#FFD700] font-bold text-lg mb-1 flex items-center gap-2">
              <span>⚽</span> Registra tu apuesta
            </h2>
            <p className="text-white/40 text-sm mb-5">
              Elige tu equipo campeón. Una vez guardado, el registro es definitivo.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Participant name */}
              <div>
                <label
                  htmlFor="participante"
                  className="block text-sm font-medium text-white/70 mb-1.5"
                >
                  Tu nombre <span className="text-[#FFD700]">*</span>
                </label>
                <input
                  id="participante"
                  type="text"
                  className="input-gold"
                  placeholder="Ej. Tetogol"
                  value={participante}
                  onChange={(e) => setParticipante(e.target.value)}
                  maxLength={100}
                  disabled={submitting}
                  autoComplete="off"
                />
              </div>

              {/* Team select */}
              <div>
                <label
                  htmlFor="equipo"
                  className="block text-sm font-medium text-white/70 mb-1.5"
                >
                  Tu equipo campeón <span className="text-[#FFD700]">*</span>
                </label>

                {/* Flag preview + select row */}
                <div className="flex items-center gap-3">
                  {/* Live flag preview */}
                  <div
                    className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border transition-all duration-200"
                    style={{
                      borderColor: banderaPreview
                        ? 'rgba(255,215,0,0.5)'
                        : 'rgba(255,255,255,0.1)',
                      background: banderaPreview
                        ? 'rgba(255,215,0,0.08)'
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {banderaPreview ? (
                      <span className="text-2xl leading-none select-none">{banderaPreview}</span>
                    ) : (
                      <span className="text-white/20 text-xl select-none">🏳️</span>
                    )}
                  </div>

                  <select
                    id="equipo"
                    className="input-gold flex-1"
                    value={equipo}
                    onChange={(e) => setEquipo(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">— Selecciona un equipo —</option>
                    {GRUPOS.map((grupo) => (
                      <optgroup key={grupo.grupo} label={`⚽ ${grupo.grupo}`}>
                        {grupo.equipos.map((eq) => (
                          <option key={eq.nombre} value={eq.nombre}>
                            {eq.bandera} {eq.nombre}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Feedback messages */}
              {successMsg && (
                <div className="rounded-lg border border-[#FFD700]/40 bg-[rgba(255,215,0,0.08)] px-4 py-3 text-[#FFD700] text-sm font-medium animate-fade-in">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-red-400 text-sm font-medium animate-fade-in">
                  {errorMsg}
                </div>
              )}

              {/* Warning note */}
              <p className="text-white/30 text-xs flex items-start gap-1.5">
                <span>🔒</span>
                <span>
                  Los registros son permanentes y no pueden editarse ni eliminarse.
                  No se permiten dos apuestas del mismo participante.
                </span>
              </p>

              {/* Submit */}
              <button
                type="submit"
                className="btn-gold w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>🏆</span>
                    Guardar mi apuesta
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 gold-line" />
          <span className="text-[#FFD700]/60 text-sm font-semibold uppercase tracking-widest whitespace-nowrap">
            Apuestas registradas
          </span>
          <div className="flex-1 gold-line" />
        </div>

       {/* ── Stats badge ── */}
        {!loading && apuestas.length > 0 && (
          <div className="flex justify-center items-center gap-4 animate-fade-in flex-wrap">
            {/* Badge Participantes (Dinámico) */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: 'rgba(255,215,0,0.1)',
                border: '1px solid rgba(255,215,0,0.25)',
                color: '#FFD700',
              }}
            >
              <span>👥</span>
              {apuestas.length} {apuestas.length <= 10 ? 'de 10' : ''} {apuestas.length === 1 ? 'participante' : 'participantes'}
            </div>

            {/* Badge Premio Acumulado (Se actualiza en tiempo real) */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              style={{
                background: 'rgba(34,197,94,0.1)', 
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80',
              }}
            >
              <span>💰</span>
              Apuesta acumulada: ${(apuestas.length * 200).toLocaleString('es-MX')}
                </div>
          </div>
        )}

        {/* ── Cards Grid ── */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <LoadingGrid />
            ) : apuestas.length === 0 ? (
              <EmptyState />
            ) : (
              apuestas.map((a) => (
                <ApuestaCard
                  key={a.id}
                  apuesta={a}
                  isNew={a.id === newId}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="max-w-5xl mx-auto px-4 mt-20 text-center">
        <div className="gold-line mb-6" />
        <p className="text-white/20 text-xs">
          🌍 FIFA World Cup 2026 · Apuestas familiares · Hecho con ❤️ en México
        </p>
      </footer>
    </main>
  )
}
