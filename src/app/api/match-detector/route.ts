import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 300;

const SITE_BASE_URL = "https://huellasasalvo.org";

const ZONE_STOPWORDS = new Set([
  "sector",
  "calle",
  "av",
  "av.",
  "avenida",
  "residencia",
  "edificio",
  "de",
  "del",
  "la",
  "el",
  "en",
  "y",
  "los",
  "las",
]);

const DESCRIPTION_STOPWORDS = new Set([
  "de",
  "con",
  "el",
  "la",
  "es",
  "un",
  "una",
  "en",
  "y",
  "a",
  "por",
  "su",
  "se",
  "al",
  "del",
  "lo",
  "le",
  "que",
  "muy",
  "mas",
  "más",
]);

type MascotaRow = {
  id: string;
  nombre_mascota: string | null;
  caracteristicas: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  estado: string;
  tipo_reporte?: string;
};

type TextMatchResult = {
  match: boolean;
  confianza: "alta" | "media";
  palabrasEnComun: string[];
  zoneMatch: boolean;
  descriptionMatch: boolean;
};

type SupabaseWebhookPayload = {
  type?: string;
  table?: string;
  record?: Record<string, unknown>;
  old_record?: Record<string, unknown>;
};

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Faltan credenciales de Supabase en variables de entorno.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s,./\-()]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
}

function getSignificantWords(text: string, stopwords: Set<string>): string[] {
  return tokenize(text).filter((word) => !stopwords.has(word));
}

function getFirstTwoSignificantWords(text: string, stopwords: Set<string>): string[] {
  return getSignificantWords(text, stopwords).slice(0, 2);
}

function getCommonWords(wordsA: string[], wordsB: string[]): string[] {
  const setB = new Set(wordsB);
  return [...new Set(wordsA.filter((word) => setB.has(word)))];
}

function getZoneMatch(a: MascotaRow, b: MascotaRow): { match: boolean; common: string[] } {
  const wordsA = getFirstTwoSignificantWords(a.ubicacion_zona, ZONE_STOPWORDS);
  const wordsB = getFirstTwoSignificantWords(b.ubicacion_zona, ZONE_STOPWORDS);
  const allZoneWordsA = getSignificantWords(a.ubicacion_zona, ZONE_STOPWORDS);
  const allZoneWordsB = getSignificantWords(b.ubicacion_zona, ZONE_STOPWORDS);
  const common = getCommonWords(
    [...new Set([...wordsA, ...allZoneWordsA])],
    [...new Set([...wordsB, ...allZoneWordsB])],
  );

  return { match: common.length > 0, common };
}

function getDescriptionMatch(
  a: MascotaRow,
  b: MascotaRow,
): { match: boolean; common: string[] } {
  const wordsA = getSignificantWords(a.caracteristicas, DESCRIPTION_STOPWORDS);
  const wordsB = getSignificantWords(b.caracteristicas, DESCRIPTION_STOPWORDS);
  const common = getCommonWords(wordsA, wordsB);

  return { match: common.length >= 2, common };
}

function compareMascotasByText(a: MascotaRow, b: MascotaRow): TextMatchResult {
  const zone = getZoneMatch(a, b);
  const description = getDescriptionMatch(a, b);

  if (!zone.match && !description.match) {
    return {
      match: false,
      confianza: "media",
      palabrasEnComun: [],
      zoneMatch: false,
      descriptionMatch: false,
    };
  }

  const palabrasEnComun = [...new Set([...zone.common, ...description.common])];
  const confianza = zone.match && description.match ? "alta" : "media";

  return {
    match: true,
    confianza,
    palabrasEnComun,
    zoneMatch: zone.match,
    descriptionMatch: description.match,
  };
}

function getEstadoLabel(mascota: MascotaRow): string {
  const estado = mascota.estado;
  const tipo = mascota.tipo_reporte;

  if (estado === "PERDIDO") return "Perdido";
  if (estado === "EN_RESGUARDO") return "En Resguardo";
  if (estado === "EN_CASA") return "En Casa";
  if (estado === "ADOPCION" || tipo === "ADOPCION") return "Adopción";
  if (estado === "RESUELTO") return "En Casa";
  if (estado === "ACTIVO") {
    if (tipo === "ADOPCION") return "Adopción";
    return tipo === "ENCONTRADO" ? "En Resguardo" : "Perdido";
  }

  return estado;
}

function parseWebhookMascotaId(body: SupabaseWebhookPayload): string | null {
  const record = (body.record ?? body) as Record<string, unknown>;
  const id = record.id;

  if (typeof id === "string" && id.length > 0) {
    return id;
  }

  return null;
}

async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("[match-detector] Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID");
    return;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    },
  );

  if (!response.ok) {
    console.error("[match-detector] Error Telegram:", await response.text());
  }
}

function formatMatchMessage(
  a: MascotaRow,
  b: MascotaRow,
  confianza: string,
  palabrasEnComun: string[],
): string {
  const formatMascota = (mascota: MascotaRow) =>
    `Nombre: ${mascota.nombre_mascota ?? "Sin nombre"}
Estado: ${getEstadoLabel(mascota)}
Zona: ${mascota.ubicacion_zona}
Descripción: ${mascota.caracteristicas}
Teléfono: ${mascota.contacto_telefono}
Ver reporte: ${SITE_BASE_URL}/mascota/${mascota.id}`;

  return `🐾 POSIBLE MATCH DETECTADO (análisis por texto)

MASCOTA A:
${formatMascota(a)}

MASCOTA B:
${formatMascota(b)}

Confianza: ${confianza}
Palabras en común: ${palabrasEnComun.join(", ") || "—"}`;
}

async function getNotifiedMatchIds(
  supabase: SupabaseClient,
  mascotaId: string,
): Promise<Set<string>> {
  const excluded = new Set<string>([mascotaId]);

  const { data, error } = await supabase
    .from("matches_notificados")
    .select("mascota_id, match_mascota_id")
    .or(`mascota_id.eq.${mascotaId},match_mascota_id.eq.${mascotaId}`);

  if (error) {
    console.error("[match-detector] Error leyendo matches_notificados:", error.message);
    return excluded;
  }

  for (const row of data ?? []) {
    if (row.mascota_id === mascotaId && typeof row.match_mascota_id === "string") {
      excluded.add(row.match_mascota_id);
    }
    if (row.match_mascota_id === mascotaId && typeof row.mascota_id === "string") {
      excluded.add(row.mascota_id);
    }
  }

  return excluded;
}

async function registerNotifiedPair(
  supabase: SupabaseClient,
  mascotaAId: string,
  mascotaBId: string,
): Promise<void> {
  const { error } = await supabase.from("matches_notificados").insert([
    { mascota_id: mascotaAId, match_mascota_id: mascotaBId },
    { mascota_id: mascotaBId, match_mascota_id: mascotaAId },
  ]);

  if (error) {
    console.error("[match-detector] Error registrando par notificado:", error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SupabaseWebhookPayload;

    if (body.table && body.table !== "mascotas_reportadas") {
      return NextResponse.json({ ok: true, skipped: "tabla_no_aplicable" });
    }

    const mascotaId = parseWebhookMascotaId(body);
    if (!mascotaId) {
      console.error("[match-detector] Webhook sin ID de mascota válido");
      return NextResponse.json({ ok: true, skipped: "sin_id" });
    }

    const supabase = getSupabase();

    const { data: triggerMascota, error: triggerError } = await supabase
      .from("mascotas_reportadas")
      .select(
        "id, nombre_mascota, caracteristicas, ubicacion_zona, contacto_telefono, estado, tipo_reporte",
      )
      .eq("id", mascotaId)
      .maybeSingle();

    if (triggerError || !triggerMascota) {
      console.error(
        "[match-detector] No se pudo cargar la mascota disparadora:",
        triggerError?.message,
      );
      return NextResponse.json({ ok: true, skipped: "mascota_no_encontrada" });
    }

    const { data: allMascotas, error: listError } = await supabase
      .from("mascotas_reportadas")
      .select(
        "id, nombre_mascota, caracteristicas, ubicacion_zona, contacto_telefono, estado, tipo_reporte",
      )
      .neq("id", mascotaId);

    if (listError) {
      console.error("[match-detector] Error listando candidatos:", listError.message);
      return NextResponse.json({ ok: true, error: "listado_fallido" });
    }

    const excludedIds = await getNotifiedMatchIds(supabase, mascotaId);
    const candidates = (allMascotas ?? []).filter(
      (candidate) => !excludedIds.has(candidate.id),
    );

    let matchesFound = 0;

    for (const candidate of candidates) {
      try {
        const result = compareMascotasByText(triggerMascota, candidate);

        if (!result.match) {
          continue;
        }

        await sendTelegramMessage(
          formatMatchMessage(
            triggerMascota,
            candidate,
            result.confianza,
            result.palabrasEnComun,
          ),
        );

        await registerNotifiedPair(supabase, triggerMascota.id, candidate.id);
        matchesFound += 1;
      } catch (candidateError) {
        console.error(
          `[match-detector] Error procesando candidato ${candidate.id}:`,
          candidateError,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      processed: candidates.length,
      matchesFound,
    });
  } catch (error) {
    console.error("[match-detector] Error general:", error);
    return NextResponse.json({ ok: true, error: "internal_handled" });
  }
}
