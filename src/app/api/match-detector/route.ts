import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const maxDuration = 300;

const CLAUDE_MODEL = "claude-sonnet-4-6";
const SITE_BASE_URL = "https://huellasasalvo.org";

const VISION_PROMPT = `Compara estas dos mascotas y determina si podrían ser el mismo animal.
Analiza: color de pelaje, tamaño aproximado, marcas distintivas, tipo de animal.
Si alguna imagen no carga o no es válida, responde con match: false.
Responde SOLO con JSON sin markdown: {"match": true/false, "confianza": "alta/media/baja", "razon": "explicación breve en español"}`;

type MascotaRow = {
  id: string;
  nombre_mascota: string | null;
  especie?: string | null;
  caracteristicas: string;
  ubicacion_zona: string;
  contacto_telefono: string;
  foto_url: string | null;
  estado: string;
  tipo_reporte?: string;
};

type ClaudeMatchResult = {
  match: boolean;
  confianza: "alta" | "media" | "baja" | string;
  razon: string;
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

function parseClaudeJson(text: string): ClaudeMatchResult | null {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(withoutFence) as Partial<ClaudeMatchResult>;
    if (typeof parsed.match !== "boolean") return null;
    return {
      match: parsed.match,
      confianza: typeof parsed.confianza === "string" ? parsed.confianza : "baja",
      razon: typeof parsed.razon === "string" ? parsed.razon : "Sin explicación.",
    };
  } catch {
    return null;
  }
}

async function callClaude(
  content: Array<Record<string, unknown>>,
): Promise<ClaudeMatchResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[match-detector] Falta ANTHROPIC_API_KEY");
    return null;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    console.error("[match-detector] Error Claude:", await response.text());
    return null;
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const textBlock = data.content?.find((block) => block.type === "text");
  if (!textBlock?.text) return null;

  return parseClaudeJson(textBlock.text);
}

function buildTextComparisonPrompt(a: MascotaRow, b: MascotaRow): string {
  return `Compara estos dos reportes de mascotas y determina si podrían referirse al mismo animal.
Analiza: nombre, especie, características físicas, zona y cualquier detalle distintivo.

MASCOTA A:
Nombre: ${a.nombre_mascota ?? "Sin nombre"}
Especie: ${a.especie ?? "No indicada"}
Zona: ${a.ubicacion_zona}
Características: ${a.caracteristicas}

MASCOTA B:
Nombre: ${b.nombre_mascota ?? "Sin nombre"}
Especie: ${b.especie ?? "No indicada"}
Zona: ${b.ubicacion_zona}
Características: ${b.caracteristicas}

Responde SOLO con JSON sin markdown: {"match": true/false, "confianza": "alta/media/baja", "razon": "explicación breve en español"}`;
}

async function compareMascotas(
  a: MascotaRow,
  b: MascotaRow,
): Promise<ClaudeMatchResult | null> {
  const aHasPhoto = Boolean(a.foto_url);
  const bHasPhoto = Boolean(b.foto_url);

  if (aHasPhoto && bHasPhoto) {
    return callClaude([
      {
        type: "image",
        source: { type: "url", url: a.foto_url! },
      },
      {
        type: "image",
        source: { type: "url", url: b.foto_url! },
      },
      { type: "text", text: VISION_PROMPT },
    ]);
  }

  return callClaude([{ type: "text", text: buildTextComparisonPrompt(a, b) }]);
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
  razon: string,
): string {
  const formatMascota = (mascota: MascotaRow) =>
    `Nombre: ${mascota.nombre_mascota ?? "Sin nombre"}
Estado: ${getEstadoLabel(mascota)}
Zona: ${mascota.ubicacion_zona}
Descripción: ${mascota.caracteristicas}
Teléfono: ${mascota.contacto_telefono}
Ver reporte: ${SITE_BASE_URL}/mascota/${mascota.id}`;

  return `🐾 POSIBLE MATCH DETECTADO

MASCOTA A:
${formatMascota(a)}

MASCOTA B:
${formatMascota(b)}

Confianza: ${confianza}
Razón: ${razon}`;
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

function shouldNotify(result: ClaudeMatchResult): boolean {
  if (!result.match) return false;
  const confianza = result.confianza.toLowerCase();
  return confianza === "alta" || confianza === "media";
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
        "id, nombre_mascota, especie, caracteristicas, ubicacion_zona, contacto_telefono, foto_url, estado, tipo_reporte",
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
        "id, nombre_mascota, especie, caracteristicas, ubicacion_zona, contacto_telefono, foto_url, estado, tipo_reporte",
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
        const result = await compareMascotas(triggerMascota, candidate);

        if (!result || !shouldNotify(result)) {
          continue;
        }

        await sendTelegramMessage(
          formatMatchMessage(
            triggerMascota,
            candidate,
            result.confianza,
            result.razon,
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
