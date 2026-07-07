// app/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GRUPOS,
  EQUIPOS_ELIMINADOS,
  EQUIPOS_SEGUNDA_OPORTUNIDAD,
  CAMPEON_MUNDIAL,
  getBandera,
  filtrarApuestasVivas,
  filtrarApuestasSegundaOportunidad,
  filtrarApuestasEliminadas,
} from "@/lib/equipos";

// ─── Helpers ────────────────────────────────────────────────────────────────

// ════════════════════════════════════════════════════════════════════
// 🔒 BLOQUEO MANUAL DE REGISTRO - Cambia esto a true si quieres bloquear antes
const REGISTRO_BLOQUEADO = false;
// ════════════════════════════════════════════════════════════════════

// 🔒 BLOQUEO TOTAL: Se bloquea si activas el manual O si ya hay un campeón mundial
const FORMULARIO_BLOQUEADO = REGISTRO_BLOQUEADO || Boolean(CAMPEON_MUNDIAL);

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BANDERA_MAP = Object.fromEntries(
  GRUPOS.flatMap((g) => g.equipos.map((e) => [e.nombre, e.bandera])),
);

// ─── Sub-components ─────────────────────────────────────────────────────────

function TrophyIcon() {
  return (
    <span className="text-4xl md:text-5xl leading-none select-none" aria-hidden>
      🏆
    </span>
  );
}

// ─── 👑 SECCIÓN EMOTIVA DE CAMPEÓN DEL MUNDO ─────────────────────────
function SeccionCampeon({ apuestas, campeon }) {
  if (!campeon) return null;

  const bandera = getBandera(campeon);
  const ganadores = apuestas.filter((a) => a.equipo === campeon);
  const premioTotal = apuestas.length * 200;
  const premioPorGanador =
    ganadores.length > 0 ? Math.floor(premioTotal / ganadores.length) : 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-[#FFD700] bg-gradient-to-b from-[#FFD700]/20 via-black to-black p-6 md:p-10 text-center shadow-[0_0_60px_rgba(255,215,0,0.25)] animate-fade-in my-8">
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFD700]/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD700]/20 border border-[#FFD700]/50 text-[#FFD700] text-xs md:text-sm font-black tracking-widest uppercase shadow-inner">
          <span>✨</span> AWEBOO PERROS · COPA DEL MUNDO 2026 <span>✨</span>
        </div>

        <div className="relative mt-2">
          <span className="text-4xl absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce select-none">
            👑
          </span>
          <span
            className="text-7xl md:text-8xl leading-none select-none drop-shadow-[0_10px_20px_rgba(255,215,0,0.4)] block mt-3"
            role="img"
            aria-label={campeon}
          >
            {bandera}
          </span>
        </div>

        <div>
          <p className="text-white/60 text-xs md:text-sm font-mono tracking-widest uppercase mb-1">
            Campeón Indiscutible
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF8DC] to-[#DAA520] uppercase drop-shadow-sm">
            {campeon}
          </h2>
        </div>

        <div className="gold-line w-40 my-2 opacity-60" />

        <div className="w-full max-w-2xl mt-2 bg-black/60 border border-[#FFD700]/30 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-[#FFD700] font-bold text-base md:text-lg uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
            <span>🎉</span> ¡El Oráculo de la Plebe! <span>🎉</span>
          </h3>

          {ganadores.length > 0 ? (
            <div className="space-y-4">
              <p className="text-white/80 text-sm md:text-base">
                Honor y gloria para{" "}
                {ganadores.length === 1
                  ? "el único visionario que le tuvo"
                  : "los visionarios que le tuvieron"}{" "}
                fe al campeón:
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                {ganadores.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-2.5 bg-gradient-to-r from-[#FFD700]/20 to-[#FFD700]/10 border border-[#FFD700]/60 px-4 py-2 rounded-xl text-white font-bold text-lg shadow-[0_0_15px_rgba(255,215,0,0.15)] transform hover:scale-105 transition-transform"
                  >
                    <span className="text-xl select-none">🏆</span>
                    <span>{g.participante}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-xs md:text-sm text-white/60 font-mono">
                <span>
                  💰 Apuesta Acumulada:{" "}
                  <strong className="text-green-400 font-bold">
                    ${premioTotal.toLocaleString("es-MX")}
                  </strong>
                </span>
                <span className="hidden sm:inline">·</span>
                <span>
                  🔥 Premio:{" "}
                  <strong className="text-[#FFD700] font-bold">
                    ${premioPorGanador.toLocaleString("es-MX")}
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-2">
              <p className="text-white/70 font-medium text-base">
                ⚡ ¡Increíble! Ningún participante apostó por{" "}
                <strong className="text-white">{campeon}</strong>.
              </p>
              <p className="text-white/40 text-xs font-mono">
                La apuesta acumulada de ${premioTotal.toLocaleString("es-MX")}{" "}
                se va intacta para el fondo de la próxima carnita asada
                familiar. 🥩🍺
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ApuestaCard({ apuesta, isNew, isSegundaOportunidad }) {
  const isEliminado = EQUIPOS_ELIMINADOS.includes(apuesta.equipo);
  const isCampeon = CAMPEON_MUNDIAL && apuesta.equipo === CAMPEON_MUNDIAL;

  return (
    <div
      className={`card-apuesta p-5 flex flex-col gap-3 animate-slide-up ${
        isNew ? "card-new" : ""
      } ${isEliminado ? "opacity-50 grayscale" : ""} ${
        isCampeon
          ? "border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.2)] bg-gradient-to-b from-[#FFD700]/10 to-transparent"
          : ""
      } ${
        !isCampeon && isSegundaOportunidad
          ? "border-purple-500/40 bg-purple-950/10"
          : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="text-4xl leading-none select-none"
            role="img"
            aria-label={apuesta.equipo}
          >
            {apuesta.bandera_emoji}
          </span>
          <div>
            <p
              className={`${
                isEliminado
                  ? "text-red-400 line-through"
                  : isCampeon
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFF8DC] font-black"
                    : isSegundaOportunidad
                      ? "text-purple-300"
                      : "text-[#FFD700]"
              } font-bold text-lg leading-tight transition-colors`}
            >
              {apuesta.equipo}
            </p>
            <p className="text-white/50 text-xs font-mono mt-0.5">
              {isSegundaOportunidad ? "⭐ Segunda Oportunidad" : "Mi selección"}
            </p>
          </div>
        </div>

        {isCampeon && (
          <span className="bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/60 text-[10px] uppercase font-black px-2 py-1 rounded shadow-sm">
            👑 Campeón
          </span>
        )}
        {!isCampeon && isEliminado && (
          <span className="bg-red-950/80 text-red-400 border border-red-500/30 text-[10px] uppercase font-bold px-2 py-1 rounded">
            Eliminado
          </span>
        )}
      </div>

      <div
        className={`${isEliminado ? "bg-red-500/20" : isCampeon ? "bg-[#FFD700]/50" : isSegundaOportunidad ? "bg-purple-500/30" : "gold-line"} h-px w-full`}
      />

      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
            Participante
          </p>
          <p className="text-white font-semibold text-base">
            {apuesta.participante}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">
            Registrado
          </p>
          <p className="text-white/60 text-xs font-mono">
            {formatDate(apuesta.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  message = "Aún no hay apuestas registradas.",
  subMessage = "¡Sé el primero en apostar!",
}) {
  return (
    <div className="col-span-full text-center py-12 flex flex-col items-center gap-3 animate-fade-in">
      <span className="text-5xl select-none">⚽</span>
      <p className="text-white/40 text-base font-medium">{message}</p>
      <p className="text-white/25 text-sm">{subMessage}</p>
    </div>
  );
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
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [apuestas, setApuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newId, setNewId] = useState(null);

  // Form state
  const [participante, setParticipante] = useState("");
  const [equipo, setEquipo] = useState("");
  const [banderaPreview, setBanderaPreview] = useState("");

  // Feedback
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Data fetching ──
  const fetchApuestas = useCallback(async () => {
    try {
      const res = await fetch("/api/apuestas", { cache: "no-store" });
      const data = await res.json();
      if (data.apuestas) setApuestas(data.apuestas);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApuestas();
  }, [fetchApuestas]);

  useEffect(() => {
    setBanderaPreview(equipo ? (BANDERA_MAP[equipo] ?? "") : "");
  }, [equipo]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 6000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(""), 6000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // ── Form submit ──
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (FORMULARIO_BLOQUEADO) {
      setErrorMsg(
        "🔒 El registro está cerrado. ¡El torneo ha finalizado o está inhabilitado!",
      );
      return;
    }

    if (!participante.trim()) {
      setErrorMsg("⚠️ El nombre del participante es obligatorio.");
      return;
    }
    if (!equipo) {
      setErrorMsg("⚠️ Debes seleccionar un equipo.");
      return;
    }

    // 🔒 Validación: Solo permitir los 7 equipos de la Segunda Oportunidad
    if (!EQUIPOS_SEGUNDA_OPORTUNIDAD.includes(equipo)) {
      setErrorMsg(
        "⚠️ Este equipo no está disponible en la segunda oportunidad.",
      );
      return;
    }

    // 🔒 Validación: Que el equipo no haya sido elegido ya por nadie en toda la bolsa principal
    if (apuestas.some((a) => a.equipo === equipo)) {
      setErrorMsg(
        "⚠️ Este equipo ya fue elegido o ganado por otro participante.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/apuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participante: participante.trim(), equipo }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Ocurrió un error. Intenta de nuevo.");
        return;
      }

      setSuccessMsg(
        "✅ ¡Segunda oportunidad registrada en la apuesta principal!",
      );
      setNewId(data.apuesta.id);
      setParticipante("");
      setEquipo("");
      setBanderaPreview("");

      await fetchApuestas();
      setTimeout(() => setNewId(null), 3000);
    } catch {
      setErrorMsg("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Dividir la bolsa principal para las vistas de las listas ──
  const apuestasVivas = filtrarApuestasVivas(apuestas);
  const apuestasSegundaOportunidad =
    filtrarApuestasSegundaOportunidad(apuestas);
  const apuestasEliminadas = filtrarApuestasEliminadas(apuestas);

  // ── Total real de equipos vivos (1ra vuelta + 2da oportunidad) ──
  const totalEquiposVivos =
    apuestasVivas.length + apuestasSegundaOportunidad.length;

  // ── Render ──
  return (
    <main className="min-h-screen bg-black pb-20">
      <header className="relative overflow-hidden border-b border-[rgba(255,215,0,0.15)]">
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

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-10">
        {/* ── Form Section: Segunda Oportunidad en Apuesta Principal ── */}
        <section>
          <div className="max-w-lg mx-auto">
            <h2 className="text-[#FFD700] font-bold text-lg mb-1 flex items-center gap-2">
              <span>⭐</span> Segunda Oportunidad (Apuesta Principal)
            </h2>
            <p className="text-white/40 text-sm mb-5">
              Si tu equipo fue eliminado, elige uno de los 7 equipos disponibles
              para continuar compitiendo por la bolsa principal.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  className={`input-gold ${FORMULARIO_BLOQUEADO ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="Ej. Tetogol"
                  value={participante}
                  onChange={(e) => setParticipante(e.target.value)}
                  maxLength={100}
                  disabled={submitting || FORMULARIO_BLOQUEADO}
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="equipo"
                  className="block text-sm font-medium text-white/70 mb-1.5"
                >
                  Equipo para tu segunda oportunidad{" "}
                  <span className="text-[#FFD700]">*</span>
                </label>

                <div className="flex items-center gap-3">
                  <div
                    className="shrink-0 w-12 h-12 flex items-center justify-center rounded-lg border transition-all duration-200"
                    style={{
                      borderColor: banderaPreview
                        ? "rgba(255,215,0,0.5)"
                        : "rgba(255,255,255,0.1)",
                      background: banderaPreview
                        ? "rgba(255,215,0,0.08)"
                        : "rgba(255,255,255,0.03)",
                    }}
                  >
                    {banderaPreview ? (
                      <span className="text-2xl leading-none select-none">
                        {banderaPreview}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xl select-none">
                        🏳️
                      </span>
                    )}
                  </div>

                  <select
                    id="equipo"
                    className={`input-gold flex-1 ${FORMULARIO_BLOQUEADO ? "opacity-50 cursor-not-allowed" : ""}`}
                    value={equipo}
                    onChange={(e) => setEquipo(e.target.value)}
                    disabled={submitting || FORMULARIO_BLOQUEADO}
                  >
                    <option value="">
                      — Selecciona uno de los 7 equipos —
                    </option>
                    {GRUPOS.map((grupo) => {
                      // 1. Filtrar solo los 7 equipos permitidos en esta fase
                      const equiposDisponibles = grupo.equipos.filter((eq) =>
                        EQUIPOS_SEGUNDA_OPORTUNIDAD.includes(eq.nombre),
                      );
                      if (equiposDisponibles.length === 0) return null;

                      return (
                        <optgroup key={grupo.grupo} label={`⚽ ${grupo.grupo}`}>
                          {equiposDisponibles.map((eq) => {
                            // 2. Deshabilitamos si cualquier participante ya eligió este equipo
                            const yaElegido = apuestas.some(
                              (a) => a.equipo === eq.nombre,
                            );
                            return (
                              <option
                                key={eq.nombre}
                                value={eq.nombre}
                                disabled={yaElegido}
                              >
                                {eq.bandera} {eq.nombre}{" "}
                                {yaElegido ? "(Ya elegido)" : ""}
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </div>

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

              {!FORMULARIO_BLOQUEADO && (
                <p className="text-white/30 text-xs flex items-start gap-1.5">
                  <span>🔒</span>
                  <span>
                    Solo quedan disponibles los equipos de la segunda
                    oportunidad que no hayan sido elegidos previamente por
                    ningún participante.
                  </span>
                </p>
              )}

              {/* 🔒 Mensaje de bloqueo si se marcó al campeón o se cerró manualmente */}
              {FORMULARIO_BLOQUEADO && (
                <div className="rounded-lg border border-[#FFD700]/30 bg-[rgba(255,215,0,0.05)] px-4 py-3 text-center">
                  <p className="text-[#FFD700]/70 text-sm font-medium">
                    {CAMPEON_MUNDIAL
                      ? `👑 ¡Ya tenemos campeón (${CAMPEON_MUNDIAL})! El torneo ha concluido.`
                      : "🏁 Las apuestas están cerradas"}
                  </p>
                  <p className="text-white/30 text-xs mt-1">
                    ¡Gracias a todos por participar en la quiniela!
                  </p>
                </div>
              )}

              <button
                type="submit"
                className={`btn-gold w-full ${FORMULARIO_BLOQUEADO ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={submitting || FORMULARIO_BLOQUEADO}
              >
                {submitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : FORMULARIO_BLOQUEADO ? (
                  <>
                    <span>🔒</span>
                    Registro cerrado
                  </>
                ) : (
                  <>
                    <span>⭐</span>
                    Registrar Segunda Oportunidad
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* ── Stats Badges (Bolsa Única Principal) ── */}
        {!loading && apuestas.length > 0 && (
          <div className="flex justify-center items-center gap-3 animate-fade-in flex-wrap">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.25)",
                color: "#FFD700",
              }}
            >
              <span>👥</span>
              Total: {apuestas.length} selecciones
            </div>

            {/* ⭐ MÉTRICA UNIFICADA DE VIVOS (Suma 1ra vuelta + 2da Oportunidad) */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#4ade80",
              }}
            >
              <span>🟢</span>
              Vivos: {totalEquiposVivos}
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              <span>🔴</span>
              Eliminados: {apuestasEliminadas.length}
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#4ade80",
              }}
            >
              <span>💰</span>
              Apuesta Acumulada: $
              {(apuestas.length * 200).toLocaleString("es-MX")}
            </div>
          </div>
        )}

        {!loading && (
          <SeccionCampeon apuestas={apuestas} campeon={CAMPEON_MUNDIAL} />
        )}

        {/* ── SECCIÓN 1: EQUIPOS VIVOS (1RA APUESTA) ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-green-500/30" />
            <h3 className="text-green-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
              <span>🟢</span> Equipos Vivos $200
            </h3>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-green-500/30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <LoadingGrid />
            ) : apuestasVivas.length === 0 ? (
              <EmptyState
                message="No hay equipos vivos de la primera vuelta."
                subMessage="Revisa la segunda oportunidad o los eliminados."
              />
            ) : (
              apuestasVivas.map((a) => (
                <ApuestaCard
                  key={a.id}
                  apuesta={a}
                  isNew={a.id === newId}
                  isSegundaOportunidad={false}
                />
              ))
            )}
          </div>
        </div>

        {/* ── SECCIÓN 2: SEGUNDA OPORTUNIDAD (MISMA APUESTA PRINCIPAL) ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-500/30" />
            <h3 className="text-purple-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
              <span>⭐</span> Segunda Oportunidad $400
            </h3>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-purple-500/30" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <LoadingGrid />
            ) : apuestasSegundaOportunidad.length === 0 ? (
              <EmptyState
                message="Nadie ha tomado la segunda oportunidad aún."
                subMessage="¡Sé el primero en elegir entre los 7 equipos disponibles!"
              />
            ) : (
              apuestasSegundaOportunidad.map((a) => (
                <ApuestaCard
                  key={a.id}
                  apuesta={a}
                  isNew={a.id === newId}
                  isSegundaOportunidad={true}
                />
              ))
            )}
          </div>
        </div>

        {/* ── SECCIÓN 3: APUESTAS ELIMINADAS ── */}
        {apuestasEliminadas.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-red-500/30" />
              <h3 className="text-red-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                <span>🔴</span> Equipos Eliminados
              </h3>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-red-500/30" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {apuestasEliminadas.map((a) => (
                <ApuestaCard
                  key={a.id}
                  apuesta={a}
                  isNew={a.id === newId}
                  isSegundaOportunidad={EQUIPOS_SEGUNDA_OPORTUNIDAD.includes(
                    a.equipo,
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="max-w-5xl mx-auto px-4 mt-20 text-center">
          <div className="gold-line mb-6" />
          <p className="text-white/20 text-xs">
            🌍 FIFA World Cup 2026 · Apuestas familiares · Hecho con ❤️ en
            México
          </p>
        </footer>
      </div>
    </main>
  );
}
