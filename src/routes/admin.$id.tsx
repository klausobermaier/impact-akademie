import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  currentUserIsAdmin,
  getSubmission,
  type SubmissionRow,
} from "@/lib/audit-submissions";
import { ResultsPanel, type ResultsData } from "@/components/audit/ResultsPanel";
import { STAGE_OPTIONS } from "@/components/audit/data";

export const Route = createFileRoute("/admin/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin · Einreichung" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDetailPage,
});

function AdminDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<SubmissionRow | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (admin) {
        try {
          const r = await getSubmission(id);
          if (!cancelled) setRow(r);
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : "Fehler");
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading) {
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

  if (!row) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p>{error ?? "Einreichung nicht gefunden."}</p>
          <Link to="/admin" className="text-sm underline mt-2 inline-block">
            Zurück zur Liste
          </Link>
        </div>
      </div>
    );
  }

  const stageLabel =
    STAGE_OPTIONS.find((s) => s.value === row.stage)?.label ?? "–";
  const dateLabel = new Date(row.created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const data: ResultsData = {
    name: row.name,
    company: row.company ?? "",
    stageLabel,
    dateLabel,
    answers: row.answers,
    challenges: row.challenges,
    openAnswer: row.open_answer ?? "",
    moduleStats: row.module_stats,
    submissionId: row.id,
    initialAiText: row.ai_evaluation,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-5 print:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <Link to="/admin" className="text-sm underline opacity-80 hover:opacity-100">
            ← Zurück zur Liste
          </Link>
          <span className="text-xs opacity-75">ID: {row.id}</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="font-semibold">{row.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Unternehmen</div>
              <div className="font-semibold">{row.company ?? "–"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Branche</div>
              <div>{row.industry ?? "–"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Gründungsphase</div>
              <div>{stageLabel}</div>
            </div>
          </div>
        </div>
        <ResultsPanel data={data} />
      </main>
    </div>
  );
}
