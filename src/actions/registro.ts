"use server";

import { randomUUID } from "crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
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

function getRequired(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`El campo "${key}" es obligatorio.`);
  }
  return value.trim();
}

function getOptional(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  return value.trim();
}


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

function redirectExito(token: string, formData: FormData): never {
  const telefono =
    getOptional(formData, "contacto_whatsapp") ??
    getRequired(formData, "contacto_telefono");
  redirect(
    `/exito?token=${token}&telefono=${encodeURIComponent(telefono)}`,
  );
}

function getRequiredSelect(formData: FormData, key: string): string {
  const value = getRequired(formData, key);
  if (value === "" || value.toLowerCase().startsWith("selecciona")) {
    throw new Error(`Selecciona una opción válida en "${key}".`);
  }
  return value;
}

export async function registrarMascota(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const token = randomUUID();

    const estadoRaw = getRequiredSelect(formData, "estado");
    const especie = getRequiredSelect(formData, "especie");
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

    const payload = {
      tipo_reporte: estado === "PERDIDO" ? "PERDIDO" : "ENCONTRADO",
      especie,
      nombre_mascota: getOptional(formData, "nombre_mascota"),
      caracteristicas: getRequired(formData, "caracteristicas"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
      contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
      foto_url: fotoUrl,
      estado,
      token_edicion: token,
    };

    let { error } = await supabase.from("mascotas_reportadas").insert(payload);

    if (
      error?.message.includes("contacto_whatsapp") &&
      payload.contacto_whatsapp
    ) {
      const { contacto_whatsapp: _whatsapp, ...payloadSinWhatsapp } = payload;
      ({ error } = await supabase
        .from("mascotas_reportadas")
        .insert(payloadSinWhatsapp));
    }

    if (error) {
      return { error: error.message, success: null };
    }

    const telefono =
      getOptional(formData, "contacto_whatsapp") ??
      getRequired(formData, "contacto_telefono");
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
    const supabase = getSupabaseAdmin();
    const token = randomUUID();
    const fotoUrl = await resolveOptionalFotoUrl(
      supabase,
      formData,
      VOLUNTARIOS_FOLDER,
    );

    const { error } = await supabase.from("red_voluntarios").insert({
      tipo_ayuda: parseTipoAyudaVoluntario(getRequired(formData, "tipo_ayuda")),
      nombre_o_clinica: getRequired(formData, "nombre_o_clinica"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
      contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
      informacion_adicional: getOptional(formData, "informacion_adicional"),
      foto_url: fotoUrl,
      disponibilidad: "DISPONIBLE",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    redirectExito(token, formData);
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
    const supabase = getSupabaseAdmin();
    const token = randomUUID();
    const fotoUrl = await resolveOptionalFotoUrl(
      supabase,
      formData,
      VOLUNTARIOS_FOLDER,
    );

    const { error } = await supabase.from("red_voluntarios").insert({
      tipo_ayuda: "VETERINARIO",
      nombre_o_clinica: getRequired(formData, "nombre_o_clinica"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
      contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
      informacion_adicional: getOptional(formData, "informacion_adicional"),
      foto_url: fotoUrl,
      disponibilidad: "DISPONIBLE",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    redirectExito(token, formData);
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
    const supabase = getSupabaseAdmin();
    const token = randomUUID();

    const { error } = await supabase.from("acopio_mascotas").insert({
      nombre_centro: getRequired(formData, "nombre_centro"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      direccion_exacta: getRequired(formData, "direccion_exacta"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
      contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
      necesidades_urgentes: getRequired(formData, "necesidades_urgentes"),
      estado_stock: "MODERADO",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    redirectExito(token, formData);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}
