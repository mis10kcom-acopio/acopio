import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeEspecieForMatch } from "@/lib/mascota-especie";
import type { MascotaReportada, TipoReporte } from "@/types/database";

const MAX_MATCHES = 4;
const CANDIDATE_LIMIT = 40;
const MAX_KEYWORD_OR_CLAUSES = 8;

const STOP_WORDS = new Set([
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "un",
  "una",
  "unos",
  "unas",
  "en",
  "con",
  "por",
  "para",
  "y",
  "o",
  "a",
  "al",
  "es",
  "que",
  "se",
  "su",
  "sus",
  "muy",
  "mas",
  "sin",
  "sobre",
  "entre",
  "como",
  "tiene",
  "tenia",
  "esta",
  "pero",
  "tambien",
  "le",
  "lo",
  "me",
  "mi",
  "no",
  "si",
  "donde",
  "cuando",
  "the",
  "and",
  "or",
]);

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export function extractMatchKeywords(description: string): string[] {
  const tokens = normalizeText(description)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  return [
    ...new Set(
      tokens.filter((word) => word.length >= 3 && !STOP_WORDS.has(word)),
    ),
  ];
}

function scoreKeywordMatches(keywords: string[], text: string): number {
  if (keywords.length === 0) return 0;
  const normalized = normalizeText(text);
  return keywords.filter((keyword) => normalized.includes(keyword)).length;
}

function oppositeTipoReporte(tipo: TipoReporte): TipoReporte {
  return tipo === "PERDIDO" ? "ENCONTRADO" : "PERDIDO";
}

type RankedMatch = MascotaReportada & { keywordScore: number };

export async function findImmediateMatches(
  supabase: SupabaseClient,
  report: MascotaReportada,
): Promise<MascotaReportada[]> {
  const especie = normalizeEspecieForMatch(report.especie);
  const zona = report.ubicacion_zona.trim();
  const keywords = extractMatchKeywords(report.caracteristicas);

  if (!zona) return [];

  let query = supabase
    .from("mascotas_reportadas")
    .select("*")
    .eq("especie", especie)
    .eq("tipo_reporte", oppositeTipoReporte(report.tipo_reporte))
    .neq("token_edicion", report.token_edicion)
    .neq("estado", "EN_CASA")
    .ilike("ubicacion_zona", `%${escapeIlike(zona)}%`);

  if (keywords.length > 0) {
    const orConditions = keywords
      .slice(0, MAX_KEYWORD_OR_CLAUSES)
      .map((keyword) => `caracteristicas.ilike.%${escapeIlike(keyword)}%`)
      .join(",");

    query = query.or(orConditions);
  }

  const { data, error } = await query
    .order("creado_el", { ascending: false })
    .limit(CANDIDATE_LIMIT);

  if (error || !data?.length) return [];

  const ranked: RankedMatch[] = data
    .map((row) => ({
      ...(row as MascotaReportada),
      keywordScore: scoreKeywordMatches(keywords, row.caracteristicas),
    }))
    .filter((row) => keywords.length === 0 || row.keywordScore > 0)
    .sort((a, b) => {
      if (b.keywordScore !== a.keywordScore) {
        return b.keywordScore - a.keywordScore;
      }
      return (
        new Date(b.creado_el).getTime() - new Date(a.creado_el).getTime()
      );
    });

  return ranked.slice(0, MAX_MATCHES).map(({ keywordScore: _, ...row }) => row);
}
