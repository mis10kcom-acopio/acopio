"use server";

import { randomUUID } from "crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import {
  getOptionalContactPhone,
  getOptionalSanitizedEspecie,
  getOptionalSanitizedText,
  getRequiredSanitizedText,
  getRequiredSelect,
  getRequiredWhatsappPhone,
} from "@/lib/form-data-security";
import {
  assertSubmissionRateLimit,
  recordSuccessfulSubmission,
} from "@/lib/submission-rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  insertMascotaReportada,
  type MascotaInsertPayload,
} from "@/lib/mascota-db-write";
import { parseEstadoMascota } from "@/lib/mascota-estado";
import { buildEditUrl, getSiteBaseUrl } from "@/lib/site";
import {
  resolveOptionalFotoUrl,
  uploadImagenStorage,
} from "@/lib/storage-upload";
import type { ActionState } from "@/types/actions";
import type { TipoAyuda } from "@/types/database";

const MASCOTAS_FOLDER = "mascotas";
const VOLUNTARIOS_FOLDER = "voluntarios";

function parseTipoAyudaVoluntario(value: string): TipoAyuda {
  const valid: TipoAyuda[] = [
    "HOGAR_TEMPORAL",
    "RESCATISTA",
    "TRANSPORTE",
  ];
  if (valid.includes(value as TipoAyuda)) {
    return value as TipoAyuda;
  }
  throw new Error("Selecciona un tipo de ayuda válido.");
}

function handleActionError(error: unknown): ActionState {
  const message =
    error instanceof Error
      ? error.message
      : "Ocurrió un error inesperado. Intenta de nuevo.";
  return { error: message, success: null };
}

function redirectExito(token: string, telefono: string): never {
  redirect(`/exito?token=${token}&telefono=${encodeURIComponent(telefono)}`);
}

async function guardSubmissionRateLimit(): Promise<ActionState | null> {
  const rateLimit = await assertSubmissionRateLimit();
  if (!rateLimit.ok) {
    return { error: rateLimit.message, success: null };
  }
  return null;
}

export async function registrarMascota(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rateLimited = await guardSubmissionRateLimit();
    if (rateLimited) return rateLimited;

    const supabase = getSupabaseAdmin();
    const token = randomUUID();

    const estadoRaw = getRequiredSelect(formData, "estado");
    const estado = parseEstadoMascota(estadoRaw);

    const file = formData.get("foto");
    let fotoUrl: string | null = null;

    if (file instanceof File && file.size > 0) {
      try {
        fotoUrl = await uploadImagenStorage(supabase, file, MASCOTAS_FOLDER);
      } catch (uploadError) {
        const uploadMessage =
          uploadError instanceof Error
            ? uploadError.message
            : "No se pudo subir la foto.";
        return { error: uploadMessage, success: null };
      }
    }

    const payload: MascotaInsertPayload = {
      nombre_mascota: getOptionalSanitizedText(formData, "nombre_mascota"),
      especie: getOptionalSanitizedEspecie(formData, "especie"),
      caracteristicas: getRequiredSanitizedText(formData, "caracteristicas"),
      ubicacion_zona: getRequiredSanitizedText(formData, "ubicacion_zona"),
      contacto_telefono: getOptionalContactPhone(formData),
      contacto_whatsapp: getRequiredWhatsappPhone(formData),
      foto_url: fotoUrl,
      token_edicion: token,
    };

    const { error } = await insertMascotaReportada(supabase, payload, estado);

    if (error) {
      return { error, success: null };
    }

    void (async () => {
      const { data } = await supabase
        .from("mascotas_reportadas")
        .select("id")
        .eq("token_edicion", token)
        .maybeSingle();
      if (!data?.id) return;
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/match-detector`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ record: { id: data.id } }),
      }).catch(() => {});
    })().catch(() => {});

    await recordSuccessfulSubmission();

    const telefono = payload.contacto_whatsapp;
    const baseUrl = await getSiteBaseUrl();

    return {
      error: null,
      success: "Reporte guardado",
      editUrl: buildEditUrl(baseUrl, token),
      telefono,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function registrarVoluntario(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rateLimited = await guardSubmissionRateLimit();
    if (rateLimited) return rateLimited;

    const supabase = getSupabaseAdmin();
    const token = randomUUID();
    const fotoUrl = await resolveOptionalFotoUrl(
      supabase,
      formData,
      VOLUNTARIOS_FOLDER,
    );

    const contactoTelefono = getOptionalContactPhone(formData);
    const contactoWhatsapp = getRequiredWhatsappPhone(formData);

    const { error } = await supabase.from("red_voluntarios").insert({
      tipo_ayuda: parseTipoAyudaVoluntario(getRequiredSelect(formData, "tipo_ayuda")),
      nombre_o_clinica: getRequiredSanitizedText(formData, "nombre_o_clinica"),
      ubicacion_zona: getRequiredSanitizedText(formData, "ubicacion_zona"),
      contacto_telefono: contactoTelefono,
      contacto_whatsapp: contactoWhatsapp,
      informacion_adicional: getOptionalSanitizedText(
        formData,
        "informacion_adicional",
      ),
      foto_url: fotoUrl,
      disponibilidad: "DISPONIBLE",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    await recordSuccessfulSubmission();
    redirectExito(token, contactoWhatsapp);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function registrarVeterinario(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rateLimited = await guardSubmissionRateLimit();
    if (rateLimited) return rateLimited;

    const supabase = getSupabaseAdmin();
    const token = randomUUID();
    const fotoUrl = await resolveOptionalFotoUrl(
      supabase,
      formData,
      VOLUNTARIOS_FOLDER,
    );

    const contactoTelefono = getOptionalContactPhone(formData);
    const contactoWhatsapp = getRequiredWhatsappPhone(formData);

    const { error } = await supabase.from("red_voluntarios").insert({
      tipo_ayuda: "VETERINARIO",
      nombre_o_clinica: getRequiredSanitizedText(formData, "nombre_o_clinica"),
      ubicacion_zona: getRequiredSanitizedText(formData, "ubicacion_zona"),
      contacto_telefono: contactoTelefono,
      contacto_whatsapp: contactoWhatsapp,
      informacion_adicional: getOptionalSanitizedText(
        formData,
        "informacion_adicional",
      ),
      foto_url: fotoUrl,
      disponibilidad: "DISPONIBLE",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    await recordSuccessfulSubmission();
    redirectExito(token, contactoWhatsapp);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function registrarAcopio(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rateLimited = await guardSubmissionRateLimit();
    if (rateLimited) return rateLimited;

    const supabase = getSupabaseAdmin();
    const token = randomUUID();

    const contactoTelefono = getOptionalContactPhone(formData);
    const contactoWhatsapp = getRequiredWhatsappPhone(formData);

    const { error } = await supabase.from("acopio_mascotas").insert({
      nombre_centro: getRequiredSanitizedText(formData, "nombre_centro"),
      ubicacion_zona: getRequiredSanitizedText(formData, "ubicacion_zona"),
      direccion_exacta: getRequiredSanitizedText(formData, "direccion_exacta"),
      contacto_telefono: contactoTelefono,
      contacto_whatsapp: contactoWhatsapp,
      necesidades_urgentes: getRequiredSanitizedText(
        formData,
        "necesidades_urgentes",
      ),
      estado_stock: "MODERADO",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    await recordSuccessfulSubmission();
    redirectExito(token, contactoWhatsapp);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}
