# Lumina CRM

CRM interno di **Lumina Digital** — pipeline deal, follow-up automatici, commissioni e analitiche.

UI in italiano, codice in inglese. Stack: Next.js 14 (App Router) · Supabase (Postgres + Auth + Realtime + Edge Functions) · Tailwind · React Query · Zod.

## Setup locale

```bash
npm install
cp .env.example .env.local
# Aggiungi SUPABASE_SERVICE_ROLE_KEY (Project Settings -> API in Supabase)
npm run dev
```

Apri http://localhost:3000.

### Env vars richieste

| Variabile | Dove | Cosa fa |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + .env.local | URL del progetto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + .env.local | Publishable key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + .env.local | **Server-only.** Necessaria per creare utenti, reset password ed eliminare account dall'admin. |
| `CRON_SECRET` | Solo Supabase Edge Functions secrets | Token usato dal cron CRM per chiamare `follow-up-sweeper`. |

## Primo accesso

Lo schema parte vuoto. Procedi così:

1. **Crea il primo utente** dalla dashboard Supabase → Authentication → Users → "Add user". Inserisci email + password.
2. Il trigger `on_auth_user_created` crea automaticamente un record in `public.profiles` con ruolo `sales`.
3. **Promuovi a admin** eseguendo nel SQL Editor:

```sql
update public.profiles
set role_id = (select id from public.roles where name = 'admin')
where email = 'la-tua-email@lumina.it';
```

4. Login dall'app. Verrai reindirizzato a `/admin`.
5. Da Supabase puoi creare gli altri utenti e impostare `role_id` come `developer`, `manager` o `sales`.

## Ruoli e viste

| Ruolo | Landing | Cosa vede |
|-------|---------|-----------|
| `admin` | `/admin` | Tre tab: Operatività · Analitiche · Commissioni. Toggle pagamento commissioni. |
| `manager` | `/manager` | Inbox dei nuovi lead, assegnazione developer + agent, creazione nuovo lead. |
| `developer` | `/developer` | Coda dei deal `In Sviluppo`. Solo inserimento `site_url` (niente dati finanziari). |
| `sales` | `/sales` | Kanban (Pronti per il Pitch · In Attesa di Decisione · In Attesa di Pagamento), Azioni Richieste Oggi, statistiche personali, banner di handoff in tempo reale. |

## Workflow

### Handoff dev → sales

1. Manager crea il lead e assegna dev + sales.
2. L'assegnazione del dev sposta lo stato in `In Sviluppo`.
3. Il developer inserisce `site_url`. Il trigger Postgres `tg_deals_state_machine` promuove lo stato a `Pronti per il Pitch`.
4. Realtime invia notifica al sales: banner rosso con messaggio WhatsApp copiabile.

### 3-step follow-up engine

1. Sales sposta il deal in `In Attesa di Decisione` (drag-and-drop).
2. Il trigger `tg_deals_after_change` crea 3 righe in `follow_ups` a +2, +5, +7 giorni.
3. La sezione "Azioni Richieste Oggi" mostra i follow-up scaduti/in scadenza. Click "Fatto" per chiuderne uno.
4. La edge function `follow-up-sweeper` (CRON giornaliero) marca i follow-up scaduti come `missed` e cancella i deal con step 3 ignorato.

## Database

Migrations applicate:

- `crm_enums_and_core_tables` — enum, tabelle, indici, seed di ruoli + permessi
- `crm_rbac_helpers` — helper functions (poi spostate in `private`)
- `crm_triggers_and_automation` — state-machine, audit log, generazione follow-up, commission insert
- `crm_rls_policies` — policy RLS per tutte le tabelle
- `crm_security_hardening` — revoke + fix search_path
- `crm_move_helpers_to_private` — helper definer functions in schema `private` non esposto via REST

Audit log: ogni cambio di stato/assegnazione/site_url è registrato in `deal_events` (immutabile, nessuna policy di UPDATE/DELETE).

## Edge function CRON

```
follow-up-sweeper (deployed)
```

Pianifica un cron Supabase (Database → Cron Jobs) per chiamarla ogni notte:

```sql
select cron.schedule(
  'lumina-follow-up-sweeper',
  '0 3 * * *',
  $$
  select net.http_post(
    url := 'https://khbzmseeidsjjhbakhkp.supabase.co/functions/v1/follow-up-sweeper',
    headers := jsonb_build_object('x-cron-secret', current_setting('app.cron_secret'))
  );
  $$
);
```

Imposta il segreto: Project Settings → Edge Functions → Secrets → `CRON_SECRET=<random>`.

## Sicurezza

- RLS attiva su tutte le tabelle CRM con policy basate su `private.is_admin()`, `private.is_manager_or_admin()` e ownership (`assigned_sales_id`, `assigned_dev_id`).
- Validazione server-side con Zod su tutti gli API route.
- Audit log immutabile (`deal_events`, nessuna policy di mutazione).
- Helper RBAC in schema `private` — non esposti via PostgREST.
- Tutte le funzioni hanno `search_path` fissato a `public`.

## Comandi

```bash
npm run dev        # sviluppo
npm run build      # build produzione
npm run typecheck  # tsc --noEmit
npm run lint
```
