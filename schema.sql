-- ─────────────────────────────────────────────────────────────────
-- Mundial 2026 Apuestas Familiares — Schema
-- Ejecutar en: Neon Console → SQL Editor
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS apuestas (
  id           SERIAL PRIMARY KEY,
  participante VARCHAR(100) NOT NULL,
  equipo       VARCHAR(100) NOT NULL,
  bandera_emoji VARCHAR(10) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas de duplicados (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_apuestas_participante_lower
  ON apuestas (LOWER(participante));

-- Comentario de tabla
COMMENT ON TABLE apuestas IS 'Apuestas familiares para el Mundial 2026. Solo INSERT, sin UPDATE ni DELETE.';
