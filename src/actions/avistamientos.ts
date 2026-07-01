"use server";

import {
  assertAvistamientoRateLimit,
  recordSuccessfulAvistamiento,
} from "@/lib/avistamiento-rate-limit";
import {
  sanitizeAvistamientoComment,
  sanitizeAvistamientoOptionalText,
} from "@/lib/avistamiento-security";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { AvistamientoActionState } from "@/types/actions";
import type { Avistamiento } from "@/types/database";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readFormValue(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseMascotaId(formData: FormData): string {
  const mascotaId = readFormValue(formData, "mascota_id");
  if (!mascotaId || !UUID_PATTERN.test(mascotaId)) {
    throw new Error("No se pudo identificar la mascota del reporte.");
  }
  return mascotaId;
}

export async function publicarAvistamiento(
  _prevState: AvistamientoActionState,
  formData: FormData,
): Promise<AvistamientoActionState> {
  try {
    const rateLimit = await assertAvistamientoRateLimit();
    if (!rateLimit.ok) {
      return {
        error: rateLimit.message,
        success: null,
        avistamiento: null,
      };
    }

    const mascotaId = parseMascotaId(formData);
    const comentario = sanitizeAvistamientoComment(
      readFormValue(formData, "comentario") ?? "",
    );
    const nombreUsuario = sanitizeAvistamientoOptionalText(
      readFormValue(formData, "nombre_usuario"),
      "El nombre",
    );
    const zonaAvistamiento = sanitizeAvistamientoOptionalText(
      readFormValue(formData, "zona_avistamiento"),
      "La zona del avistamiento",
    );

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("avistamientos")
      .insert({
        mascota_id: mascotaId,
        nombre_usuario: nombreUsuario,
        comentario,
        zona_avistamiento: zonaAvistamiento,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(
        error?.message ?? "No se pudo guardar la pista. Intenta de nuevo.",
      );
    }

    await recordSuccessfulAvistamiento();

    return {
      error: null,
      success: "Gracias. Tu pista fue publicada.",
      avistamiento: data as Avistamiento,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ocurrió un error inesperado. Intenta de nuevo.";
    return {
      error: message,
      success: null,
      avistamiento: null,
    };
  }
}
