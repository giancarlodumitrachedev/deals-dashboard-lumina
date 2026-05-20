// Pure, client-safe helpers (no server imports).

export const DEFAULT_WHATSAPP_TEMPLATE =
  "Ciao {client}, come anticipato ho preparato la bozza del tuo nuovo sito. Puoi vederla qui: {url}\n\nFammi sapere cosa ne pensi!";

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}
