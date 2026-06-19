import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  currentUserIsAdmin,
  listSubmissions,
  type SubmissionRow,
} from "@/lib/audit-submissions";
import {
  createAppUser,
  deleteSubmission,
} from "@/lib/admin-users.functions";
import { generateDemoSubmission } from "@/lib/admin-demo.functions";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin · Einreichungen" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminListPage,
});

function AdminListPage() {
  const navigate = useNavigate();
  const createUserFn = useServerFn(createAppUser);
  const deleteSubmissionFn = useServerFn(deleteSubmission);
  const generateDemoFn = useServerFn(generateDemoSubmission);

  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User creation form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdInfo, setCreatedInfo] = useState<
    | { email: string; password: string; role: string; loginUrl: string }
    | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth" });
        return;
      }
      if (cancelled) return;
      setEmail(userData.user.email ?? null);
      const admin = await currentUserIsAdmin();
      if (cancelled) return;
      setIsAdmin(admin);
      if (admin) {
        try {
          const data = await listSubmissions();
          if (!cancelled) setRows(data);
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : "Fehler");
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreatedInfo(null);
    try {
      const res = await createUserFn({
        data: { email: newEmail.trim(), password: newPassword, role: newRole },
      });
      setCreatedInfo({
        email: res.email,
        password: newPassword,
        role: res.role,
        loginUrl: `${window.location.origin}/auth`,
      });
      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Fehler beim Anlegen.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Diese Einreichung wirklich löschen? Das kann nicht rückgängig gemacht werden.")) {
      return;
    }
    try {
      await deleteSubmissionFn({ data: { id } });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
    }
  };

  const handleGenerateDemo = async () => {
    setGeneratingDemo(true);
    setDemoError(null);
    try {
      await generateDemoFn({ data: undefined });
      const data = await listSubmissions();
      setRows(data);
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : "Generieren fehlgeschlagen.");
    } finally {
      setGeneratingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Wird geladen …
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold">Kein Zugriff</h1>
          <p className="text-sm text-muted-foreground">
            Dein Konto ({email}) ist noch nicht als Admin freigeschaltet.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={signOut}>
              Abmelden
            </Button>
            <Link to="/" className="text-sm underline text-muted-foreground self-center">
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avg = (row: SubmissionRow) => {
    const stats = row.module_stats ?? [];
    const vals = stats.map((s) => s.avg).filter((v): v is number => v !== null);
    if (vals.length === 0) return null;
    return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold">Audit-Einreichungen</h1>
          <p className="text-xs opacity-75">{email}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/group"
            className="text-xs underline opacity-90 hover:opacity-100 font-medium"
          >
            🧭 Workshop-Gesamtanalyse
          </Link>
          <Link
            to="/audit"
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Fragebogen öffnen
          </Link>
          <Button variant="secondary" size="sm" onClick={signOut}>
            Abmelden
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* User management */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold">Nutzerverwaltung</h2>
              <p className="text-xs text-muted-foreground">
                Lege Nutzer oder Admins an. Das Passwort ist dauerhaft vorgegeben –
                Nutzer können es nicht selbst ändern.
              </p>
            </div>
            <Button
              size="sm"
              variant={showUserForm ? "outline" : "default"}
              onClick={() => {
                setShowUserForm((v) => !v);
                setCreatedInfo(null);
                setCreateError(null);
              }}
            >
              {showUserForm ? "Abbrechen" : "+ Nutzer hinzufügen"}
            </Button>
          </div>

          {showUserForm && (
            <form onSubmit={handleCreateUser} className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Label htmlFor="new-email" className="text-xs">E-Mail</Label>
                <Input
                  id="new-email"
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-password" className="text-xs">Passwort (min. 8)</Label>
                <Input
                  id="new-password"
                  type="text"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <Label htmlFor="new-role" className="text-xs">Rolle</Label>
                <select
                  id="new-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
                  className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="user">Nutzer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Wird angelegt …" : "Anlegen"}
                </Button>
              </div>
              {createError && (
                <p className="sm:col-span-4 text-sm text-destructive">{createError}</p>
              )}
            </form>
          )}

          {createdInfo && (
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
              <p className="font-semibold text-primary">
                ✅ Nutzer angelegt ({createdInfo.role})
              </p>
              <div className="grid gap-1 text-xs">
                <div><span className="text-muted-foreground">Login-Link:</span> <a href={createdInfo.loginUrl} className="underline break-all">{createdInfo.loginUrl}</a></div>
                <div><span className="text-muted-foreground">E-Mail:</span> <span className="font-mono">{createdInfo.email}</span></div>
                <div><span className="text-muted-foreground">Passwort:</span> <span className="font-mono">{createdInfo.password}</span></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Diese Zugangsdaten dem Nutzer mitteilen – sie werden hier nur einmal angezeigt.
              </p>
            </div>
          )}
        </section>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            Noch keine Einreichungen.
          </p>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Datum</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Unternehmen</th>
                  <th className="text-left px-4 py-3">Branche</th>
                  <th className="text-right px-4 py-3">Ø</th>
                  <th className="text-right px-4 py-3">Beantwortet</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const a = avg(r);
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-border hover:bg-accent/30"
                    >
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3">{r.company ?? "–"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.industry ?? "–"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {a !== null ? a : "–"}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {r.answered_count}/{r.total_questions}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          to="/admin/$id"
                          params={{ id: r.id }}
                          className="text-primary underline text-xs mr-3"
                        >
                          Öffnen
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-destructive underline text-xs"
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
