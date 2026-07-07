// app/api/apuestas/route.js
import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getBandera } from '@/lib/equipos'

// GET /api/apuestas — returns all bets ordered by newest first
export async function GET() {
  try {
    const apuestas = await sql`
      SELECT id, participante, equipo, bandera_emoji, created_at
      FROM apuestas
      ORDER BY created_at DESC
    `
    return NextResponse.json({ apuestas }, { status: 200 })
  } catch (error) {
    console.error('[GET /api/apuestas]', error)
    return NextResponse.json(
      { error: 'Error al obtener las apuestas.' },
      { status: 500 }
    )
  }
}

// POST /api/apuestas — creates a new bet (no updates, no deletes)
export async function POST(request) {
  try {
    const body = await request.json()
    const { participante, equipo } = body

    // --- Validation ---
    if (!participante || typeof participante !== 'string') {
      return NextResponse.json(
        { error: 'El nombre del participante es obligatorio.' },
        { status: 400 }
      )
    }
    if (!equipo || typeof equipo !== 'string') {
      return NextResponse.json(
        { error: 'Debes seleccionar un equipo.' },
        { status: 400 }
      )
    }

    const nombreLimpio = participante.trim().slice(0, 100)
    const equipoLimpio = equipo.trim().slice(0, 100)

    if (nombreLimpio.length === 0) {
      return NextResponse.json(
        { error: 'El nombre del participante no puede estar vacío.' },
        { status: 400 }
      )
    }

    // --- Duplicate check (participante y equipo, case-insensitive) ---
    // Optimizamos realizando una sola consulta a la BD para ambas validaciones
    const existing = await sql`
      SELECT participante, equipo FROM apuestas
      WHERE LOWER(participante) = LOWER(${nombreLimpio})
         OR LOWER(equipo) = LOWER(${equipoLimpio})
      LIMIT 2
    `

    if (existing.length > 0) {
      // 1. Validar si el participante ya existe
      const participanteDuplicado = existing.find(
        (row) => row.participante.toLowerCase() === nombreLimpio.toLowerCase()
      )
      if (participanteDuplicado) {
        return NextResponse.json(
          { error: `"${nombreLimpio}" ya tiene una apuesta registrada. No se permiten duplicados.` },
          { status: 409 }
        )
      }

      // 2. Validar si el equipo ya fue seleccionado por alguien más
      const equipoDuplicado = existing.find(
        (row) => row.equipo.toLowerCase() === equipoLimpio.toLowerCase()
      )
      if (equipoDuplicado) {
        return NextResponse.json(
          { error: `El equipo "${equipoLimpio}" ya fue seleccionado por otro participante. Por favor elige otro.` },
          { status: 409 }
        )
      }
    }

    // --- Resolve emoji from server-side data (prevents client manipulation) ---
    const bandera_emoji = getBandera(equipoLimpio)

    // --- Insert ---
    const [nueva] = await sql`
      INSERT INTO apuestas (participante, equipo, bandera_emoji)
      VALUES (${nombreLimpio}, ${equipoLimpio}, ${bandera_emoji})
      RETURNING id, participante, equipo, bandera_emoji, created_at
    `

    return NextResponse.json({ apuesta: nueva }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/apuestas]', error)
    return NextResponse.json(
      { error: 'Error al guardar la apuesta. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}