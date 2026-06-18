import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  currentUserIsAdmin,
  listSubmissions,
  type SubmissionRow,
} from "@/lib/audit-submissions";

export const Route = createFileRoute("/admin")({
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
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            Dein Konto ({email}) ist noch nicht als Admin freigeschaltet. Teile die User-ID mit dem Trainer, damit die Rolle gesetzt werden kann.
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

      <main className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
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
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/admin/$id"
                          params={{ id: r.id }}
                          className="text-primary underline text-xs"
                        >
                          Öffnen
                        </Link>
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
