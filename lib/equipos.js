// lib/equipos.js

export const GRUPOS = [
  {
    grupo: 'Grupo A',
    equipos: [
      { nombre: 'México', bandera: '🇲🇽' },
      { nombre: 'Sudáfrica', bandera: '🇿🇦' },
      { nombre: 'Corea del Sur', bandera: '🇰🇷' },
      { nombre: 'República Checa', bandera: '🇨🇿' },
    ],
  },
  {
    grupo: 'Grupo B',
    equipos: [
      { nombre: 'Canadá', bandera: '🇨🇦' },
      { nombre: 'Bosnia y Herzegovina', bandera: '🇧🇦' },
      { nombre: 'Catar', bandera: '🇶🇦' },
      { nombre: 'Suiza', bandera: '🇨🇭' },
    ],
  },
  {
    grupo: 'Grupo C',
    equipos: [
      { nombre: 'Brasil', bandera: '🇧🇷' },
      { nombre: 'Marruecos', bandera: '🇲🇦' },
      { nombre: 'Haití', bandera: '🇭🇹' },
      { nombre: 'Escocia', bandera: '🇸🇾' },
    ],
  },
  {
    grupo: 'Grupo D',
    equipos: [
      { nombre: 'Estados Unidos', bandera: '🇺🇸' },
      { nombre: 'Paraguay', bandera: '🇵🇾' },
      { nombre: 'Australia', bandera: '🇦🇺' },
      { nombre: 'Turquía', bandera: '🇹🇷' },
    ],
  },
  {
    grupo: 'Grupo E',
    equipos: [
      { nombre: 'Alemania', bandera: '🇩🇪' },
      { nombre: 'Curazao', bandera: '🇨🇼' },
      { nombre: 'Costa de Marfil', bandera: '🇨🇮' },
      { nombre: 'Ecuador', bandera: '🇪🇨' },
    ],
  },
  {
    grupo: 'Grupo F',
    equipos: [
      { nombre: 'Países Bajos', bandera: '🇳🇱' },
      { nombre: 'Japón', bandera: '🇯🇵' },
      { nombre: 'Suecia', bandera: '🇸🇪' },
      { nombre: 'Túnez', bandera: '🇹🇳' },
    ],
  },
  {
    grupo: 'Grupo G',
    equipos: [
      { nombre: 'Bélgica', bandera: '🇧🇪' },
      { nombre: 'Egipto', bandera: '🇪🇬' },
      { nombre: 'Irán', bandera: '🇮🇷' },
      { nombre: 'Nueva Zelanda', bandera: '🇳🇿' },
    ],
  },
  {
    grupo: 'Grupo H',
    equipos: [
      { nombre: 'España', bandera: '🇪🇸' },
      { nombre: 'Cabo Verde', bandera: '🇨🇻' },
      { nombre: 'Arabia Saudí', bandera: '🇸🇦' },
      { nombre: 'Uruguay', bandera: '🇺🇾' },
    ],
  },
  {
    grupo: 'Grupo I',
    equipos: [
      { nombre: 'Francia', bandera: '🇫🇷' },
      { nombre: 'Senegal', bandera: '🇸🇳' },
      { nombre: 'Irak', bandera: '🇮🇶' },
      { nombre: 'Noruega', bandera: '🇳🇴' },
    ],
  },
  {
    grupo: 'Grupo J',
    equipos: [
      { nombre: 'Argentina', bandera: '🇦🇷' },
      { nombre: 'Argelia', bandera: '🇩🇿' },
      { nombre: 'Austria', bandera: '🇦🇹' },
      { nombre: 'Jordania', bandera: '🇯🇴' },
    ],
  },
  {
    grupo: 'Grupo K',
    equipos: [
      { nombre: 'Portugal', bandera: '🇵🇹' },
      { nombre: 'Rep. Dem. del Congo', bandera: '🇨🇩' },
      { nombre: 'Uzbekistán', bandera: '🇺🇿' },
      { nombre: 'Colombia', bandera: '🇨🇴' },
    ],
  },
  {
    grupo: 'Grupo L',
    equipos: [
      { nombre: 'Inglaterra', bandera: '🇬🇧' },
      { nombre: 'Croacia', bandera: '🇭🇷' },
      { nombre: 'Ghana', bandera: '🇬🇭' },
      { nombre: 'Panamá', bandera: '🇵🇦' },
    ],
  },
]

/** Flat map: { nombre, bandera } → for quick lookups */
export const EQUIPOS_FLAT = GRUPOS.flatMap((g) => g.equipos)

/** Get bandera emoji by team name */
export function getBandera(nombreEquipo) {
  const equipo = EQUIPOS_FLAT.find((e) => e.nombre === nombreEquipo)
  return equipo ? equipo.bandera : '🏳️'
}

// ─── EQUIPOS ELIMINADOS (los que ya no están en la copa) ──────────
export const EQUIPOS_ELIMINADOS = [
  'Japón',
  'Alemania',
  'Países Bajos',
  'Portugal',
  'México',
  'Brasil',
  // 'Argentina',
  // 'Inglaterra',
  // 'Noruega',
  // 'Bélgica',
  // 'Egipto',
  // 'Suiza',
  // 'Colombia',
  // 'España',
  // 'Francia',


]

// ─── ⭐ EQUIPOS DE LA SEGUNDA OPORTUNIDAD (2DA APUESTA) ───────────
export const EQUIPOS_SEGUNDA_OPORTUNIDAD = [
  'Marruecos',
  'Noruega',
  'Bélgica',
  'Suiza',
]

// ─── FUNCIÓN: APUESTAS VIVAS (1RA OPORTUNIDAD) ────────────────────
export function filtrarApuestasVivas(apuestas) {
  return apuestas.filter((apuesta) => 
    !EQUIPOS_ELIMINADOS.includes(apuesta.equipo) &&
    !EQUIPOS_SEGUNDA_OPORTUNIDAD.includes(apuesta.equipo)
  )
}

// ─── ⭐ FUNCIÓN: APUESTAS DE SEGUNDA OPORTUNIDAD ──────────────────
export function filtrarApuestasSegundaOportunidad(apuestas) {
  return apuestas.filter((apuesta) => 
    EQUIPOS_SEGUNDA_OPORTUNIDAD.includes(apuesta.equipo) &&
    !EQUIPOS_ELIMINADOS.includes(apuesta.equipo) // <-- Ya no muestra los eliminados aquí
  )
}

// ─── FUNCIÓN: APUESTAS ELIMINADAS ─────────────────────────────────
export function filtrarApuestasEliminadas(apuestas) {
  return apuestas.filter((apuesta) => 
    EQUIPOS_ELIMINADOS.includes(apuesta.equipo) // <-- Acepta a cualquiera que pierda
  )
}

// ════════════════════════════════════════════════════════════════════
// 👑 CAMPEÓN DEL MUNDO 2026 - Control Manual
export const CAMPEON_MUNDIAL = ''
// ════════════════════════════════════════════════════════════════════