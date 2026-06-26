-- Huellas a Salvo — Esquema base
-- Ejecutar en el SQL Editor de Supabase

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Mascotas perdidas / encontradas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mascotas_reportadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_reporte TEXT NOT NULL CHECK (tipo_reporte IN ('PERDIDO', 'ENCONTRADO')),
  especie TEXT NOT NULL,
  nombre_mascota TEXT,
  caracteristicas TEXT NOT NULL,
  ubicacion_zona TEXT NOT NULL,
  contacto_telefono TEXT NOT NULL,
  foto_url TEXT,
  estado TEXT NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'RESUELTO')),
  token_edicion TEXT NOT NULL UNIQUE,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mascotas_reportadas_ubicacion_zona
  ON mascotas_reportadas (ubicacion_zona);

CREATE INDEX IF NOT EXISTS idx_mascotas_reportadas_estado
  ON mascotas_reportadas (estado);

CREATE INDEX IF NOT EXISTS idx_mascotas_reportadas_creado_el
  ON mascotas_reportadas (creado_el DESC);

-- ---------------------------------------------------------------------------
-- Red de voluntarios (veterinarios, hogares temporales, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS red_voluntarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_ayuda TEXT NOT NULL CHECK (tipo_ayuda IN ('VETERINARIO', 'HOGAR_TEMPORAL', 'RESCATISTA', 'TRANSPORTE')),
  nombre_o_clinica TEXT NOT NULL,
  ubicacion_zona TEXT NOT NULL,
  contacto_telefono TEXT NOT NULL,
  disponibilidad TEXT NOT NULL DEFAULT 'DISPONIBLE' CHECK (disponibilidad IN ('DISPONIBLE', 'LLENO/NO_DISPONIBLE')),
  token_edicion TEXT NOT NULL UNIQUE,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_red_voluntarios_ubicacion_zona
  ON red_voluntarios (ubicacion_zona);

CREATE INDEX IF NOT EXISTS idx_red_voluntarios_disponibilidad
  ON red_voluntarios (disponibilidad);

CREATE INDEX IF NOT EXISTS idx_red_voluntarios_creado_el
  ON red_voluntarios (creado_el DESC);

-- ---------------------------------------------------------------------------
-- Centros de acopio de insumos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS acopio_mascotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_centro TEXT NOT NULL,
  ubicacion_zona TEXT NOT NULL,
  direccion_exacta TEXT NOT NULL,
  contacto_telefono TEXT NOT NULL,
  necesidades_urgentes TEXT NOT NULL,
  estado_stock TEXT NOT NULL DEFAULT 'MODERADO' CHECK (estado_stock IN ('CRITICO', 'MODERADO', 'ABASTECIDO')),
  token_edicion TEXT NOT NULL UNIQUE,
  creado_el TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acopio_mascotas_ubicacion_zona
  ON acopio_mascotas (ubicacion_zona);

CREATE INDEX IF NOT EXISTS idx_acopio_mascotas_estado_stock
  ON acopio_mascotas (estado_stock);

CREATE INDEX IF NOT EXISTS idx_acopio_mascotas_creado_el
  ON acopio_mascotas (creado_el DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security (lectura pública, escritura vía API con service role)
-- ---------------------------------------------------------------------------
ALTER TABLE mascotas_reportadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE red_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE acopio_mascotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública mascotas activas"
  ON mascotas_reportadas FOR SELECT
  USING (true);

CREATE POLICY "Lectura pública voluntarios"
  ON red_voluntarios FOR SELECT
  USING (true);

CREATE POLICY "Lectura pública acopio"
  ON acopio_mascotas FOR SELECT
  USING (true);
