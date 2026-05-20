import type { DealStatus, FollowUpStatus, CommissionStatus, UserRole } from "@/lib/types/domain";

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  new_lead: "Nuovo Lead",
  in_development: "In Sviluppo",
  ready_to_pitch: "Pronti per il Pitch",
  decision_pending: "In Attesa di Decisione",
  payment_pending: "In Attesa di Pagamento",
  won: "Vinto",
  cancelled: "Annullato",
};

export const FOLLOW_UP_STATUS_LABEL: Record<FollowUpStatus, string> = {
  pending: "In Sospeso",
  done: "Completato",
  missed: "Mancato",
};

export const COMMISSION_STATUS_LABEL: Record<CommissionStatus, string> = {
  pending: "Da Pagare",
  paid: "Pagata",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Amministratore",
  manager: "Manager",
  developer: "Sviluppatore",
  sales: "Agente",
};

export const UI = {
  appName: "Lumina CRM",
  login: {
    title: "Accedi",
    subtitle: "Accesso riservato al team di Lumina Digital.",
    email: "Email",
    password: "Password",
    submit: "Entra",
    error: "Credenziali non valide.",
  },
  nav: {
    operativita: "Operatività",
    analitiche: "Analitiche",
    commissioni: "Commissioni",
    logout: "Esci",
  },
  actionsToday: "Azioni Richieste Oggi",
  empty: {
    noActions: "Nessuna azione richiesta oggi.",
    noDeals: "Nessun deal in questa colonna.",
    noLeads: "Nessun nuovo lead da assegnare.",
    noDevQueue: "Nessun sito da sviluppare.",
    noCommissions: "Nessuna commissione registrata.",
  },
  buttons: {
    markReady: "Segna come Pronto",
    done: "Fatto",
    save: "Salva",
    cancel: "Annulla",
    assign: "Assegna",
    copy: "Copia messaggio",
    copied: "Copiato",
    pitchSent: "Pitch Inviato",
    markPaid: "Pagamento Ricevuto",
    paymentReceived: "Segna come Pagato",
    newLead: "Nuovo Lead",
  },
  fields: {
    clientName: "Nome Cliente",
    phone: "Telefono",
    email: "Email",
    website: "Sito Web Attuale",
    job: "Settore / Lavoro",
    value: "Valore (€)",
    siteUrl: "URL del Sito",
    assignedDev: "Sviluppatore Assegnato",
    assignedSales: "Agente Assegnato",
    notes: "Note",
  },
  report: {
    title: "Segnalazione",
    typeBug: "Bug",
    typeImprovement: "Miglioramento",
    severity: "Priorità",
    sevLow: "Bassa",
    sevMedium: "Media",
    sevHigh: "Alta",
    sevCritical: "Critica",
    description: "Descrizione",
    submit: "Invia segnalazione",
    sent: "Segnalazione inviata. Grazie!",
  },
  stats: {
    conversionRate: "Tasso di Conversione",
    pendingCommissions: "Commissioni da Ricevere",
    pipelineValue: "Valore Pipeline",
    wonThisMonth: "Vinti questo Mese",
  },
  notifications: {
    siteReady: (client: string) => `Sito pronto da inviare a ${client}`,
    whatsappTemplate: (client: string, url: string) =>
      `Ciao ${client}, come anticipato ho preparato la bozza del tuo nuovo sito. Puoi vederla qui: ${url}\n\nFammi sapere cosa ne pensi!`,
  },
  alerts: {
    confirmCancel: "Sei sicuro di voler annullare questo deal?",
    confirmPaid: "Confermi che la commissione è stata pagata?",
  },
};
