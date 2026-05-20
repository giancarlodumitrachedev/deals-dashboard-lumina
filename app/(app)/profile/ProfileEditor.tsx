"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ProfileEditor({
  fullName,
  email,
  role,
  iban,
  paymentMethod,
}: {
  fullName: string;
  email: string;
  role: string;
  iban: string;
  paymentMethod: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [ibanValue, setIbanValue] = useState(iban);
  const [payMethod, setPayMethod] = useState(paymentMethod);
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function saveName() {
    setMsg(null); setErr(null); setBusy(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: name.trim(),
        iban: ibanValue.trim(),
        payment_method: payMethod.trim(),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setMsg("Profilo aggiornato.");
    router.refresh();
  }

  async function changePw() {
    setMsg(null); setErr(null);
    if (pw.length < 8) { setErr("Password troppo corta (min 8)."); return; }
    if (pw !== pwConfirm) { setErr("Le password non coincidono."); return; }
    setBusy(true);
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setPw(""); setPwConfirm("");
    setMsg("Password aggiornata.");
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold">Dati account</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Nome completo">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={email} disabled />
          </Field>
          <Field label="Ruolo">
            <Input value={role} disabled />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={saveName} disabled={busy || name.trim().length < 2}>
            Salva
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 text-sm font-semibold">Dati di pagamento</h2>
        <p className="mb-3 text-xs text-muted">
          Usati dall&apos;amministrazione per liquidare le tue commissioni.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="IBAN">
            <Input
              value={ibanValue}
              onChange={(e) => setIbanValue(e.target.value.toUpperCase())}
              placeholder="IT60X0542811101000000123456"
            />
          </Field>
          <Field label="Metodo preferito">
            <Input
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              placeholder="Bonifico / PayPal / Revolut…"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={saveName} disabled={busy}>Salva</Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold">Cambia password</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Nuova password (min 8)">
            <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </Field>
          <Field label="Conferma password">
            <Input type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Button onClick={changePw} disabled={busy || pw.length < 8}>
            Aggiorna password
          </Button>
        </div>
      </Card>

      {msg && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-md border border-alert-ring bg-alert-soft px-3 py-2 text-xs text-alert">
          {err}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
