"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ROLE_LABEL } from "@/lib/i18n/it";
import type { UserRole } from "@/lib/types/domain";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  role: UserRole;
}

export function UsersAdmin({ users, selfId }: { users: UserRow[]; selfId: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState<"" | UserRole>("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filterRole && u.role !== filterRole) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle)
      );
    });
  }, [users, q, filterRole]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Utenti</h1>
        <Button onClick={() => setModalOpen(true)}>+ Nuovo Utente</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Cerca per nome o email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as "" | UserRole)}
          className="max-w-xs"
        >
          <option value="">Tutti i ruoli</option>
          {(["admin", "manager", "developer", "sales"] as UserRole[]).map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-line bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Nome</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Ruolo</th>
              <th className="px-4 py-2 font-medium">Stato</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-surface-2">
                <td className="px-4 py-2 font-medium text-primary">
                  {u.full_name}
                  {u.id === selfId && <span className="ml-2 text-[10px] text-faint">(tu)</span>}
                </td>
                <td className="px-4 py-2 text-muted">{u.email}</td>
                <td className="px-4 py-2 text-primary">{ROLE_LABEL[u.role]}</td>
                <td className="px-4 py-2">
                  <Badge tone={u.is_active ? "ok" : "muted"}>
                    {u.is_active ? "Attivo" : "Disattivo"}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs text-muted hover:text-primary"
                  >
                    Modifica →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  Nessun utente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>

      <NewUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function NewUserModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("sales");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    setBusy(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, email, password, role }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Errore" }));
      setErr(error ?? "Errore");
      return;
    }
    setFullName(""); setEmail(""); setPassword(""); setRole("sales");
    onCreated();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuovo Utente">
      <div className="space-y-3">
        <Field label="Nome completo">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password temporanea (min 8 caratteri)">
          <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Ruolo">
          <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            {(["admin", "manager", "developer", "sales"] as UserRole[]).map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </Select>
        </Field>
        {err && (
          <div className="rounded-md border border-alert-ring bg-alert-soft px-3 py-1.5 text-xs text-alert">
            {err}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Annulla</Button>
          <Button
            onClick={submit}
            disabled={busy || fullName.length < 2 || password.length < 8 || !email.includes("@")}
          >
            {busy ? "..." : "Crea"}
          </Button>
        </div>
      </div>
    </Modal>
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
