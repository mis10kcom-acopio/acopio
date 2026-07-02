import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 300;

const SITE_BASE_URL = "https://huellasasalvo.org";

type EspecieCategoria = "perro" | "gato" | "otro";

const GENERIC_STOPWORDS = new Set([
  "de",
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "con",
  "en",
  "al",
  "del",
  "sector",
  "calle",
  "av",
  "av.",
  "avenida",
  "res",
  "residencia",
  "edificio",
  "edif",
  "urb",
  "urbanizacion",
  "cerca",
  "frente",
  "y",
  "a",
  "por",
  "su",
  "se",
  "lo",
  "le",
  "que",
]);

const DESCRIPTION_EXTRA_STOPWORDS = new Set([
  "es",
  "tiene",
  "muy",
  "poco",
  "mas",
  "más",
]);

const CONDITIONAL_DESCRIPTION_STOPWORDS = new Set([
  "grande",
  "grandes",
  "pequeno",
  "pequena",
  "pequenos",
  "pequenas",
]);

const PERRO_KEYWORDS = [
  "perro",
  "can",
  "cachorro",
  "poodle",
  "labrador",
  "pastor",
  "bulldog",
  "chihuahua",
  "yorkshire",
  "beagle",
  "husky",
  "dalmata",
  "pug",
  "golden",
  "retriever",
  "boxer",
  "schnauzer",
  "maltes",
  "salchicha",
  "teckel",
  "pitbull",
  "rottweiler",
];

const GATO_KEYWORDS = [
  "gato",
  "felino",
  "gatito",
  "siames",
  "persa",
  "angora",
  "minino",
];

const OTRO_ESPECIFICO_KEYWORDS = [
  "loro",
  "cotorra",
  "periquito",
  "guacamaya",
  "guacamayo",
  "ave",
  "pajaro",
  "conejo",
  "hamster",
  "tortuga",
  "cobaya",
  "huron",
  "iguana",
  "serpiente",
  "caballo",
  "cerdo",
  "capibara",
];

const ZONE_STOPWORDS = GENERIC_STOPWORDS;

const DESCRIPTION_STOPWORDS = new Set([
  ...GENERIC_STOPWORDS,
  ...DESCRIPTION_EXTRA_STOPWORDS,
]);

type MascotaRow = {
  id: string;
  nombre_mascota: string | null;
  especie?: string | null;
  caracteristicas: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  estado: string;
  tipo_reporte?: string;
};

type ResolvedEspecie = {
  categoria: EspecieCategoria | null;
  otroEspecifico: string | null;
};

type TextMatchResult = {
  match: boolean;
  confianza: "alta" | "media";
  palabrasEnComun: string[];
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

function getCommonWords(wordsA: string[], wordsB: string[]): string[] {
  const setB = new Set(wordsB);
  return [...new Set(wordsA.filter((word) => setB.has(word)))];
}

function findKeywordInText(text: string, keywords: string[]): string | null {
  const normalized = normalizeText(text);
  for (const keyword of keywords) {
    if (normalized.includes(keyword)) {
      return keyword;
    }
  }
  return null;
}

function detectEspecieFromField(
  especie: string | null | undefined,
): EspecieCategoria | null {
  if (!especie?.trim()) return null;

  const normalized = normalizeText(especie.trim());

  if (
    normalized.includes("perro") ||
    normalized === "can" ||
    PERRO_KEYWORDS.some((kw) => normalized.includes(kw))
  ) {
    return "perro";
  }

  if (
    normalized.includes("gato") ||
    normalized.includes("felino") ||
    GATO_KEYWORDS.some((kw) => normalized.includes(kw))
  ) {
    return "gato";
  }

  return "otro";
}

function detectEspecieFromCaracteristicas(text: string): ResolvedEspecie {
  const perroKeyword = findKeywordInText(text, PERRO_KEYWORDS);
  if (perroKeyword) {
    return { categoria: "perro", otroEspecifico: null };
  }

  const gatoKeyword = findKeywordInText(text, GATO_KEYWORDS);
  if (gatoKeyword) {
    return { categoria: "gato", otroEspecifico: null };
  }

  const otroKeyword = findKeywordInText(text, OTRO_ESPECIFICO_KEYWORDS);
  if (otroKeyword) {
    return { categoria: "otro", otroEspecifico: otroKeyword };
  }

  return { categoria: null, otroEspecifico: null };
}

function resolveEspecie(mascota: MascotaRow): ResolvedEspecie {
  const fromField = detectEspecieFromField(mascota.especie);
  if (fromField) {
    if (fromField === "otro") {
      const fromChars = detectEspecieFromCaracteristicas(mascota.caracteristicas);
      return {
        categoria: "otro",
        otroEspecifico: fromChars.otroEspecifico,
      };
    }
    return { categoria: fromField, otroEspecifico: null };
  }

  return detectEspecieFromCaracteristicas(mascota.caracteristicas);
}

function passesSpeciesCheck(a: MascotaRow, b: MascotaRow): boolean {
  const specieA = resolveEspecie(a);
  const specieB = resolveEspecie(b);

  if (specieA.categoria === null && specieB.categoria === null) {
    return true;
  }

  if (specieA.categoria !== null && specieB.categoria !== null) {
    if (specieA.categoria === specieB.categoria) {
      return true;
    }

    if (
      (specieA.categoria === "perro" && specieB.categoria === "gato") ||
      (specieA.categoria === "gato" && specieB.categoria === "perro")
    ) {
      return false;
    }

    const perroGato = specieA.categoria === "perro" || specieA.categoria === "gato"
      ? specieA
      : specieB.categoria === "perro" || specieB.categoria === "gato"
        ? specieB
        : null;
    const otroSide = specieA.categoria === "otro" ? specieA : specieB;

    if (perroGato && otroSide.categoria === "otro" && otroSide.otroEspecifico) {
      return false;
    }

    return true;
  }

  return true;
}

function getZoneMatch(a: MascotaRow, b: MascotaRow): { match: boolean; common: string[] } {
  const wordsA = getSignificantWords(a.ubicacion_zona, ZONE_STOPWORDS);
  const wordsB = getSignificantWords(b.ubicacion_zona, ZONE_STOPWORDS);
  const common = getCommonWords(wordsA, wordsB);

  return { match: common.length >= 1, common };
}

function getDescriptionWords(text: string): string[] {
  const words = getSignificantWords(text, DESCRIPTION_STOPWORDS);
  const withoutConditional = words.filter(
    (word) => !CONDITIONAL_DESCRIPTION_STOPWORDS.has(word),
  );

  return withoutConditional.length > 0 ? withoutConditional : words;
}

function getDescriptionMatch(
  a: MascotaRow,
  b: MascotaRow,
): { match: boolean; common: string[] } {
  const wordsA = getDescriptionWords(a.caracteristicas);
  const wordsB = getDescriptionWords(b.caracteristicas);
  const common = getCommonWords(wordsA, wordsB);

  return { match: common.length >= 4, common };
}

function getDescriptionConfidence(
  commonWordCount: number,
): "alta" | "media" {
  if (commonWordCount >= 6) return "alta";
  return "media";
}

function compareMascotasByText(a: MascotaRow, b: MascotaRow): TextMatchResult {
  const noMatch: TextMatchResult = {
    match: false,
    confianza: "media",
    palabrasEnComun: [],
  };

  if (!passesSpeciesCheck(a, b)) {
    return noMatch;
  }

  const zone = getZoneMatch(a, b);
  if (!zone.match) {
    return noMatch;
  }

  const description = getDescriptionMatch(a, b);
  if (!description.match) {
    return noMatch;
  }

  const palabrasEnComun = [...new Set([...zone.common, ...description.common])];
  const confianza = getDescriptionConfidence(description.common.length);

  return {
    match: true,
    confianza,
    palabrasEnComun,
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

  try {
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
  } catch (error) {
    console.error("[match-detector] Error enviando Telegram:", error);
  }
}

function sendTelegramMessageFireAndForget(text: string): void {
  void sendTelegramMessage(text).catch((error) => {
    console.error("[match-detector] Telegram fire-and-forget:", error);
  });
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
        "id, nombre_mascota, especie, caracteristicas, ubicacion_zona, contacto_telefono, estado, tipo_reporte",
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
        "id, nombre_mascota, especie, caracteristicas, ubicacion_zona, contacto_telefono, estado, tipo_reporte",
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

        sendTelegramMessageFireAndForget(
          formatMatchMessage(
            triggerMascota,
            candidate,
            result.confianza,
            result.palabrasEnComun,
          ),
        );

        void registerNotifiedPair(supabase, triggerMascota.id, candidate.id).catch(
          (registerError) => {
            console.error(
              "[match-detector] Error registrando par notificado:",
              registerError,
            );
          },
        );
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
