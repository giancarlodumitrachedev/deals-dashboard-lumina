import { createSupabaseServerClient } from "@/lib/supabase/server";

export { DEFAULT_WHATSAPP_TEMPLATE, renderTemplate } from "@/lib/template";

export async function getSetting<T = string>(key: string, fallback: T): Promise<T> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? fallback;
}
