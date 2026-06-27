"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { buscarRegistroPorIdentificador } from "@/lib/editar-identificador";
import {
  getMascotaEstado,
  parseEstadoMascota,
} from "@/lib/mascota-estado";
import { resolveOptionalFotoUrl } from "@/lib/storage-upload";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ActionState } from "@/types/actions";
import type {
  AcopioMascota,
  EstadoStock,
  MascotaReportada,
  RedVoluntario,
} from "@/types/database";

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


function tipoReporteFromEstado(estado: string): "PERDIDO" | "ENCONTRADO" {
  return parseEstadoMascota(estado) === "PERDIDO" ? "PERDIDO" : "ENCONTRADO";
}

export type RegistroPorToken =
  | { tipo: "mascota"; registro: MascotaReportada }
  | { tipo: "voluntario"; registro: RedVoluntario }
  | { tipo: "acopio"; registro: AcopioMascota };

export async function buscarPorToken(
  identificador: string,
): Promise<RegistroPorToken | null> {
  const supabase = getSupabaseAdmin();

  const [mascota, voluntario, acopio] = await Promise.all([
    buscarRegistroPorIdentificador<MascotaReportada>(
      supabase,
      "mascotas_reportadas",
      identificador,
    ),
    buscarRegistroPorIdentificador<RedVoluntario>(
      supabase,
      "red_voluntarios",
      identificador,
    ),
    buscarRegistroPorIdentificador<AcopioMascota>(
      supabase,
      "acopio_mascotas",
      identificador,
    ),
  ]);

  if (mascota) {
    return { tipo: "mascota", registro: mascota };
  }
  if (voluntario) {
    return { tipo: "voluntario", registro: voluntario };
  }
  if (acopio) {
    return { tipo: "acopio", registro: acopio };
  }

  return null;
}

function handleActionError(error: unknown): ActionState {
  const message =
    error instanceof Error
      ? error.message
      : "No se pudo actualizar. Intenta de nuevo.";
  return { error: message, success: null };
}

async function revalidateAndRedirect(
  tokenEdicion: string,
  successMessage: string,
): Promise<never> {
  revalidatePath("/");
  redirect(`/editar/${tokenEdicion}?ok=${encodeURIComponent(successMessage)}`);
}

async function buscarMascotaPorIdentificador(
  identificador: string,
): Promise<MascotaReportada | null> {
  const supabase = getSupabaseAdmin();
  return buscarRegistroPorIdentificador<MascotaReportada>(
    supabase,
    "mascotas_reportadas",
    identificador,
  );
}

async function buscarVoluntarioPorIdentificador(
  identificador: string,
): Promise<RedVoluntario | null> {
  const supabase = getSupabaseAdmin();
  return buscarRegistroPorIdentificador<RedVoluntario>(
    supabase,
    "red_voluntarios",
    identificador,
  );
}

async function buscarAcopioPorIdentificador(
  identificador: string,
): Promise<AcopioMascota | null> {
  const supabase = getSupabaseAdmin();
  return buscarRegistroPorIdentificador<AcopioMascota>(
    supabase,
    "acopio_mascotas",
    identificador,
  );
}

export async function cambiarMascotaAEnResguardo(
  identificador: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarMascotaPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }
    if (getMascotaEstado(registro) !== "PERDIDO") {
      return {
        error: "Solo los reportes en estado Perdido pueden pasar a En Resguardo.",
        success: null,
      };
    }

    const { data, error } = await supabase
      .from("mascotas_reportadas")
      .update({
        estado: "EN_RESGUARDO",
        tipo_reporte: "ENCONTRADO",
      })
      .eq("id", registro.id)
      .select("token_edicion")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "No se pudo actualizar el reporte.", success: null };
    }

    return await revalidateAndRedirect(
      data.token_edicion,
      "Reporte actualizado a En Resguardo.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

/** @deprecated Usar cambiarMascotaAEnResguardo */
export async function cambiarMascotaAEncontrada(
  identificador: string,
): Promise<ActionState> {
  return cambiarMascotaAEnResguardo(identificador);
}

export async function marcarMascotaEnCasa(
  identificador: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarMascotaPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }
    if (getMascotaEstado(registro) === "EN_CASA") {
      return {
        error: "Este reporte ya está marcado como En Casa.",
        success: null,
      };
    }

    const { data, error } = await supabase
      .from("mascotas_reportadas")
      .update({
        estado: "EN_CASA",
        tipo_reporte: "ENCONTRADO",
      })
      .eq("id", registro.id)
      .select("token_edicion")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "No se pudo actualizar el reporte.", success: null };
    }

    return await revalidateAndRedirect(
      data.token_edicion,
      "¡La mascota ya está En Casa! El caso quedó cerrado en la plataforma.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

/** @deprecated Usar marcarMascotaEnCasa */
export async function marcarMascotaResuelta(
  identificador: string,
): Promise<ActionState> {
  return marcarMascotaEnCasa(identificador);
}

export async function marcarVoluntarioNoDisponible(
  identificador: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarVoluntarioPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    const { data, error } = await supabase
      .from("red_voluntarios")
      .update({ disponibilidad: "LLENO/NO_DISPONIBLE" })
      .eq("id", registro.id)
      .select("token_edicion")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "No se pudo actualizar el registro.", success: null };
    }

    return await revalidateAndRedirect(
      data.token_edicion,
      "Disponibilidad actualizada. Ya no aparecerás como disponible en el listado.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function marcarVoluntarioDisponible(
  identificador: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarVoluntarioPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    const { data, error } = await supabase
      .from("red_voluntarios")
      .update({ disponibilidad: "DISPONIBLE" })
      .eq("id", registro.id)
      .select("token_edicion")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "No se pudo actualizar el registro.", success: null };
    }

    return await revalidateAndRedirect(
      data.token_edicion,
      "¡Disponibilidad restaurada! Vuelves a aparecer en el listado público.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function actualizarStockAcopio(
  identificador: string,
  estadoStock: EstadoStock,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarAcopioPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    const { data, error } = await supabase
      .from("acopio_mascotas")
      .update({ estado_stock: estadoStock })
      .eq("id", registro.id)
      .select("token_edicion")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "No se pudo actualizar el registro.", success: null };
    }

    const labels: Record<EstadoStock, string> = {
      CRITICO: "crítico",
      MODERADO: "moderado",
      ABASTECIDO: "abastecido",
    };

    return await revalidateAndRedirect(
      data.token_edicion,
      `Stock actualizado a: ${labels[estadoStock].toUpperCase()}`,
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function actualizarMascota(
  identificador: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarMascotaPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    const estado = parseEstadoMascota(getRequired(formData, "estado"));

    const { data, error } = await supabase
      .from("mascotas_reportadas")
      .update({
        estado,
        tipo_reporte: tipoReporteFromEstado(estado),
        especie: getRequired(formData, "especie"),
        nombre_mascota: getOptional(formData, "nombre_mascota"),
        caracteristicas: getRequired(formData, "caracteristicas"),
        ubicacion_zona: getRequired(formData, "ubicacion_zona"),
        contacto_telefono: getRequired(formData, "contacto_telefono"),
        contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
      })
      .eq("id", registro.id)
      .select("token_edicion")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "No se pudo actualizar el reporte.", success: null };
    }

    return await revalidateAndRedirect(
      data.token_edicion,
      "Datos del reporte actualizados correctamente.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function actualizarVoluntario(
  identificador: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarVoluntarioPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    const nuevaFotoUrl = await resolveOptionalFotoUrl(
      supabase,
      formData,
      "voluntarios",
    );

    const { data, error } = await supabase
      .from("red_voluntarios")
      .update({
        nombre_o_clinica: getRequired(formData, "nombre_o_clinica"),
        ubicacion_zona: getRequired(formData, "ubicacion_zona"),
        contacto_telefono: getRequired(formData, "contacto_telefono"),
        contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
        informacion_adicional: getOptional(formData, "informacion_adicional"),
        foto_url: nuevaFotoUrl ?? registro.foto_url,
      })
      .eq("id", registro.id)
      .select("token_edicion")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "No se pudo actualizar el registro.", success: null };
    }

    return await revalidateAndRedirect(
      data.token_edicion,
      "Datos actualizados correctamente.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function actualizarAcopio(
  identificador: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarAcopioPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    const { data, error } = await supabase
      .from("acopio_mascotas")
      .update({
        nombre_centro: getRequired(formData, "nombre_centro"),
        ubicacion_zona: getRequired(formData, "ubicacion_zona"),
        direccion_exacta: getRequired(formData, "direccion_exacta"),
        contacto_telefono: getRequired(formData, "contacto_telefono"),
        contacto_whatsapp: getOptional(formData, "contacto_whatsapp"),
        necesidades_urgentes: getRequired(formData, "necesidades_urgentes"),
      })
      .eq("id", registro.id)
      .select("token_edicion")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "No se pudo actualizar el registro.", success: null };
    }

    return await revalidateAndRedirect(
      data.token_edicion,
      "Datos del centro actualizados correctamente.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}
