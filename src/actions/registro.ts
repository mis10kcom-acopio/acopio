"use server";

import { randomUUID } from "crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ActionState } from "@/types/actions";
import type { TipoAyuda, TipoReporte } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_FOTO_SIZE_BYTES = 5 * 1024 * 1024;
const MASCOTAS_BUCKET = "mascotas";

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function buildStorageFileName(originalName: string): string {
  const parts = originalName.split(".");
  const extension =
    parts.length > 1 ? parts.pop()?.toLowerCase() ?? "jpg" : "jpg";
  const baseName = parts.join(".") || "foto";
  const cleanBase = sanitizeFileName(baseName) || "foto";
  return `${Date.now()}-${cleanBase}.${extension}`;
}

async function uploadFotoMascota(
  supabase: SupabaseClient,
  file: File,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen (JPG, PNG, WebP, etc.).");
  }

  if (file.size > MAX_FOTO_SIZE_BYTES) {
    throw new Error("La foto no puede superar 5 MB. Intenta con una imagen más liviana.");
  }

  const fileName = buildStorageFileName(file.name);

  const { error } = await supabase.storage
    .from(MASCOTAS_BUCKET)
    .upload(fileName, file, { upsert: false, contentType: file.type });

  if (error) {
    throw new Error(`Error al subir la foto: ${error.message}`);
  }

  const { data } = supabase.storage.from(MASCOTAS_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

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

function parseTipoReporte(value: string): TipoReporte {
  if (value === "PERDIDO" || value === "ENCONTRADO") {
    return value;
  }
  throw new Error("Selecciona un tipo de reporte válido.");
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

export async function registrarMascota(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const token = randomUUID();

    const file = formData.get("foto");
    let fotoUrl: string | null = null;

    if (file instanceof File && file.size > 0) {
      try {
        fotoUrl = await uploadFotoMascota(supabase, file);
      } catch {
        fotoUrl = null;
      }
    }

    const { error } = await supabase.from("mascotas_reportadas").insert({
      tipo_reporte: parseTipoReporte(getRequired(formData, "tipo_reporte")),
      especie: getRequired(formData, "especie"),
      nombre_mascota: getOptional(formData, "nombre_mascota"),
      caracteristicas: getRequired(formData, "caracteristicas"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
      contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
      foto_url: fotoUrl,
      estado: "ACTIVO",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    redirect(`/exito?token=${token}`);
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

    const { error } = await supabase.from("red_voluntarios").insert({
      tipo_ayuda: parseTipoAyudaVoluntario(getRequired(formData, "tipo_ayuda")),
      nombre_o_clinica: getRequired(formData, "nombre_o_clinica"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
      contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
      disponibilidad: "DISPONIBLE",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    redirect(`/exito?token=${token}`);
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

    const { error } = await supabase.from("red_voluntarios").insert({
      tipo_ayuda: "VETERINARIO",
      nombre_o_clinica: getRequired(formData, "nombre_o_clinica"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
      contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
      disponibilidad: "DISPONIBLE",
      token_edicion: token,
    });

    if (error) {
      return { error: error.message, success: null };
    }

    redirect(`/exito?token=${token}`);
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

    redirect(`/exito?token=${token}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}
