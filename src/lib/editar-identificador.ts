import type { SupabaseClient } from "@supabase/supabase-js";

export function esUuid(valor: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    valor,
  );
}

export async function buscarRegistroPorIdentificador<T extends { id: string }>(
  supabase: SupabaseClient,
  tabla: string,
  identificador: string,
): Promise<T | null> {
  const valor = identificador.trim();

  const { data: porToken, error: errorToken } = await supabase
    .from(tabla)
    .select("*")
    .eq("token_edicion", valor)
    .maybeSingle();

  if (errorToken) {
    throw new Error(`Error al buscar en ${tabla}: ${errorToken.message}`);
  }
  if (porToken) {
    return porToken as T;
  }

  if (esUuid(valor)) {
    const { data: porId, error: errorId } = await supabase
      .from(tabla)
      .select("*")
      .eq("id", valor)
      .maybeSingle();

    if (errorId) {
      throw new Error(`Error al buscar en ${tabla}: ${errorId.message}`);
    }
    if (porId) {
      return porId as T;
    }
  }

  return null;
}
