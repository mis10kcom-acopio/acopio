"use server";

import { randomUUID } from "crypto";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ActionState } from "@/types/actions";
import type { TipoAyuda, TipoReporte } from "@/types/database";

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

function parseTipoAyuda(value: string): TipoAyuda {
  const valid: TipoAyuda[] = [
    "VETERINARIO",
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

    const { error } = await supabase.from("mascotas_reportadas").insert({
      tipo_reporte: parseTipoReporte(getRequired(formData, "tipo_reporte")),
      especie: getRequired(formData, "especie"),
      nombre_mascota: getOptional(formData, "nombre_mascota"),
      caracteristicas: getRequired(formData, "caracteristicas"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
      foto_url: getOptional(formData, "foto_url"),
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
      tipo_ayuda: parseTipoAyuda(getRequired(formData, "tipo_ayuda")),
      nombre_o_clinica: getRequired(formData, "nombre_o_clinica"),
      ubicacion_zona: getRequired(formData, "ubicacion_zona"),
      contacto_telefono: getRequired(formData, "contacto_telefono"),
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
