import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { currentUserIsAdmin } from "@/lib/audit-submissions";
import { generateGroupAnalysis } from "@/lib/audit-ai.functions";

export const Route = createFileRoute("/admin/group")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin · Workshop-Gesamtanalyse" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GroupAnalysisPage,
});

// Minimal markdown renderer (subset)
function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactElement[] = [];
  let i = 0;
  let k = 0;
  const inline = (s: string) =>
    s
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .map((part, idx) => {
        if (/^\*\*[^*]+\*\*$/.test(part))
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        if (/^\*[^*]+\*$/.test(part)) return <em key={idx}>{part.slice(1, -1)}</em>;
        return <span key={idx}>{part}</span>;
      });
  while (i < lines.length) {
    const l = lines[i];
    if (/^##\s+/.test(l)) {
      out.push(
        <h3 key={k++} className="text-base font-semibold text-primary mt-6 mb-2">
          {inline(l.replace(/^##\s+/, ""))}
        </h3>,
      );
      i++;
    } else if (/^#\s+/.test(l)) {
      out.push(
        <h2 key={k++} className="text-lg font-bold text-primary mt-6 mb-2">
          {inline(l.replace(/^#\s+/, ""))}
        </h2>,
      );
      i++;
    } else if (/^[-*]\s+/.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      out.push(
        <ul key={k++} className="list-disc pl-5 space-y-1 my-2 text-sm">
          {items.map((it, idx) => (
            <li key={idx}>{inline(it)}</li>
          ))}
        </ul>,
      );
    } else if (l.trim() === "") {
      i++;
    } else {
      out.push(
        <p key={k++} className="text-sm leading-relaxed my-2">
          {inline(l)}
        </p>,
      );
      i++;
    }
  }
  return <div>{out}</div>;
}

function GroupAnalysisPage() {
  const navigate = useNavigate();
  const generate = useServerFn(generateGroupAnalysis);
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth" });
        return;
      }
      const admin = await currentUserIsAdmin();
      if (cancelled) return;
      setAllowed(admin);
      setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const run = async () => {
    setLoading(true);
    setError(null);
    setText(null);
    try {
      const res = await generate({ data: {} });
      setText(res.text);
      setCount(res.participantCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler bei der Analyse.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Wird geladen …
      </div>
    );
  }
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p>Kein Zugriff.</p>
          <Link to="/admin" className="text-sm underline mt-2 inline-block">
            Zurück
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-5 print:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Link to="/admin" className="text-xs underline opacity-80 hover:opacity-100">
              ← Zurück zur Liste
            </Link>
            <h1 className="text-lg font-semibold mt-1">
              🧭 Workshop-Gesamtanalyse
            </h1>
            <p className="text-xs opacity-75">
              KI-basierte Auswertung aller Einreichungen für die Workshop-Vorbereitung
            </p>
          </div>
          <div className="flex gap-2">
            {text && (
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                🖨️ Drucken / PDF
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={run} disabled={loading}>
              {loading ? "Wird erstellt …" : text ? "Neu generieren" : "Analyse starten"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!text && !loading && !error && (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Erstelle eine Gesamtbewertung der Teilnehmergruppe inkl. Stärken,
            Engpässen und Empfehlungen für die drei Workshop-Schwerpunkte.
            <div className="mt-4">
              <Button onClick={run}>Analyse starten</Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground italic">
            Analyse wird erstellt … das kann bis zu einer Minute dauern.
          </div>
        )}

        {text && (
          <article className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {count !== null && (
              <p className="text-xs text-muted-foreground mb-4">
                Basis: {count} Einreichung{count === 1 ? "" : "en"}
              </p>
            )}
            <Markdown text={text} />
          </article>
        )}
      </main>
    </div>
  );
}
