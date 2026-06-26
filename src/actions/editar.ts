"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { buscarRegistroPorIdentificador } from "@/lib/editar-identificador";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ActionState } from "@/types/actions";
import type {
  AcopioMascota,
  EstadoStock,
  MascotaReportada,
  RedVoluntario,
} from "@/types/database";

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

export async function cambiarMascotaAEncontrada(
  identificador: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarMascotaPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }
    if (registro.tipo_reporte === "ENCONTRADO") {
      return {
        error: "Este reporte ya está marcado como encontrado.",
        success: null,
      };
    }

    const { data, error } = await supabase
      .from("mascotas_reportadas")
      .update({ tipo_reporte: "ENCONTRADO" })
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
      "Reporte actualizado a ENCONTRADO.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function marcarMascotaResuelta(
  identificador: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();
    const registro = await buscarMascotaPorIdentificador(identificador);

    if (!registro) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    const { data, error } = await supabase
      .from("mascotas_reportadas")
      .update({ estado: "RESUELTO" })
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
      "¡Marcado como resuelto! El caso ya no aparecerá en el listado público.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
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
