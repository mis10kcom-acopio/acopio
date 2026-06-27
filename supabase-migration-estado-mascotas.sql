-- Migración: estados de mascotas (ACTIVO/RESUELTO → PERDIDO/EN_RESGUARDO/EN_CASA)
-- Ejecutar COMPLETO en el SQL Editor de Supabase (todo el bloque de una vez).

-- 1) Diagnóstico (opcional): revisa qué valores hay hoy
-- SELECT estado, tipo_reporte, COUNT(*) AS total
-- FROM mascotas_reportadas
-- GROUP BY estado, tipo_reporte
-- ORDER BY total DESC;

-- 2) Quitar el constraint viejo (obligatorio antes de corregir filas)
ALTER TABLE mascotas_reportadas
  DROP CONSTRAINT IF EXISTS mascotas_reportadas_estado_check;

-- 3) Normalizar TODAS las filas a los 3 valores válidos
UPDATE mascotas_reportadas
SET estado = CASE
  WHEN estado IN ('PERDIDO', 'EN_RESGUARDO', 'EN_CASA') THEN estado
  WHEN UPPER(TRIM(COALESCE(estado, ''))) IN ('RESUELTO', 'EN_CASA', 'CASA') THEN 'EN_CASA'
  WHEN UPPER(TRIM(COALESCE(estado, ''))) IN ('EN_RESGUARDO', 'ENCONTRADO', 'RESGUARDO') THEN 'EN_RESGUARDO'
  WHEN UPPER(TRIM(COALESCE(estado, ''))) = 'ACTIVO'
       AND UPPER(TRIM(COALESCE(tipo_reporte, ''))) = 'ENCONTRADO' THEN 'EN_RESGUARDO'
  ELSE 'PERDIDO'
END
WHERE estado IS NULL
   OR TRIM(estado) = ''
   OR estado NOT IN ('PERDIDO', 'EN_RESGUARDO', 'EN_CASA');

-- 4) Verificación: no debe devolver ninguna fila
-- SELECT id, estado, tipo_reporte
-- FROM mascotas_reportadas
-- WHERE estado NOT IN ('PERDIDO', 'EN_RESGUARDO', 'EN_CASA');

-- 5) Recrear el constraint solo cuando todas las filas son válidas
ALTER TABLE mascotas_reportadas
  ADD CONSTRAINT mascotas_reportadas_estado_check
  CHECK (estado IN ('PERDIDO', 'EN_RESGUARDO', 'EN_CASA'));

ALTER TABLE mascotas_reportadas
  ALTER COLUMN estado SET DEFAULT 'PERDIDO';

ALTER TABLE mascotas_reportadas
  ADD COLUMN IF NOT EXISTS contacto_whatsapp TEXT;
