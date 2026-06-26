import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getAdminEnv(): { url: string; serviceRoleKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan credenciales de servidor. Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local",
    );
  }

  return { url, serviceRoleKey };
}

let adminClient: SupabaseClient | null = null;

/** Cliente con service role — solo para Server Actions (nunca exponer al cliente). */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const { url, serviceRoleKey } = getAdminEnv();
    adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return adminClient;
}
