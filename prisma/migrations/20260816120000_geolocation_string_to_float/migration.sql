-- Converte geoLat/geoLong de TEXT para DOUBLE PRECISION.
--
-- Contexto: as colunas nasceram como INTEGER (migration 20250326211210_init),
-- o que arredondava as coordenadas recebidas do app e gravava a ocorrência a
-- dezenas de quilômetros do local real. A troca para TEXT em 20250829011234
-- estancou a perda de precisão, mas impede qualquer cálculo de distância.
--
-- O USING trata valores gravados com vírgula decimal e strings vazias.
-- Registros da fase INTEGER permanecem arredondados: a informação original
-- foi perdida na gravação e não é recuperável.

ALTER TABLE "public"."Occurrence"
  ALTER COLUMN "geoLat" TYPE DOUBLE PRECISION
    USING NULLIF(TRIM(REPLACE("geoLat", ',', '.')), '')::DOUBLE PRECISION,
  ALTER COLUMN "geoLong" TYPE DOUBLE PRECISION
    USING NULLIF(TRIM(REPLACE("geoLong", ',', '.')), '')::DOUBLE PRECISION;

-- Índice para consultas por região/proximidade.
CREATE INDEX IF NOT EXISTS "Occurrence_geo_idx"
  ON "public"."Occurrence" ("geoLat", "geoLong");
