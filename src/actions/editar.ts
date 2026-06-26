"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
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
  token: string,
): Promise<RegistroPorToken | null> {
  const supabase = getSupabaseAdmin();

  const [mascota, voluntario, acopio] = await Promise.all([
    supabase
      .from("mascotas_reportadas")
      .select("*")
      .eq("token_edicion", token)
      .maybeSingle(),
    supabase
      .from("red_voluntarios")
      .select("*")
      .eq("token_edicion", token)
      .maybeSingle(),
    supabase
      .from("acopio_mascotas")
      .select("*")
      .eq("token_edicion", token)
      .maybeSingle(),
  ]);

  if (mascota.data) {
    return { tipo: "mascota", registro: mascota.data };
  }
  if (voluntario.data) {
    return { tipo: "voluntario", registro: voluntario.data };
  }
  if (acopio.data) {
    return { tipo: "acopio", registro: acopio.data };
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
  token: string,
  successMessage: string,
): Promise<never> {
  revalidatePath("/");
  redirect(`/editar/${token}?ok=${encodeURIComponent(successMessage)}`);
}

export async function marcarMascotaResuelta(
  token: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("mascotas_reportadas")
      .update({ estado: "RESUELTO" })
      .eq("token_edicion", token)
      .select("id")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    return await revalidateAndRedirect(
      token,
      "¡Marcado como resuelto! El caso ya no aparecerá en el listado público.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function marcarVoluntarioNoDisponible(
  token: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("red_voluntarios")
      .update({ disponibilidad: "LLENO/NO_DISPONIBLE" })
      .eq("token_edicion", token)
      .select("id")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    return await revalidateAndRedirect(
      token,
      "Disponibilidad actualizada. Ya no aparecerás como disponible en el listado.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function marcarVoluntarioDisponible(
  token: string,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("red_voluntarios")
      .update({ disponibilidad: "DISPONIBLE" })
      .eq("token_edicion", token)
      .select("id")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    return await revalidateAndRedirect(
      token,
      "¡Disponibilidad restaurada! Vuelves a aparecer en el listado público.",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}

export async function actualizarStockAcopio(
  token: string,
  estadoStock: EstadoStock,
): Promise<ActionState> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("acopio_mascotas")
      .update({ estado_stock: estadoStock })
      .eq("token_edicion", token)
      .select("id")
      .maybeSingle();

    if (error) {
      return { error: error.message, success: null };
    }
    if (!data) {
      return { error: "Enlace no válido o registro no encontrado.", success: null };
    }

    const labels: Record<EstadoStock, string> = {
      CRITICO: "crítico",
      MODERADO: "moderado",
      ABASTECIDO: "abastecido",
    };

    return await revalidateAndRedirect(
      token,
      `Stock actualizado a: ${labels[estadoStock].toUpperCase()}`,
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return handleActionError(error);
  }
}
