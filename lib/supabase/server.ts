import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client serveur uniquement : utilise la clé secrète (bypass RLS).
// Ne jamais importer ce fichier dans du code client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
