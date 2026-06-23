import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ModuleCard } from "./ModuleCard";
import { ChallengeSelector } from "./ChallengeSelector";
import { ResultsPanel, type ResultsData, type ModuleStat } from "./ResultsPanel";
import { MODULES, STAGE_OPTIONS } from "./data";
import { useAuditState } from "./useAuditState";
import { submitAudit } from "@/lib/audit-submissions";


export function AuditPage() {
  const {
    state,
    setAnswer,
    setNumericAnswer,
    toggleChallenge,
    updateField,
    reset,
    totalQuestions,
    answeredCount,
    progressPct,
    moduleStats,
  } = useAuditState();

  const [submitting, setSubmitting] = useState(false);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const stageLabel =
    STAGE_OPTIONS.find((s) => s.value === state.stage)?.label ?? "–";

  const handleGenerate = async () => {
    if (!state.name.trim()) {
      setWarning("⚠️ Bitte geben Sie Ihren Namen an, damit die Auswertung zugeordnet werden kann.");
      return;
    }
    if (answeredCount < totalQuestions * 0.5) {
      setWarning(
        `⚠️ Bitte beantworten Sie mindestens 50% der Fragen (aktuell: ${answeredCount}/${totalQuestions}).`,
      );
      return;
    }
    setWarning(null);
    setSubmitting(true);

    const compactStats: ModuleStat[] = moduleStats.map((s) => ({
      modId: s.mod.id,
      title: s.mod.title,
      avg: s.avg,
      redPct: s.redPct,
      naPct: s.naPct,
      answered: s.answered,
      total: s.total,
    }));

    try {
      const submitted = await submitAudit({
        name: state.name,
        company: state.company,
        industry: state.industry,
        stage: state.stage,
        answers: state.answers,
        challenges: state.challenges,
        openAnswer: state.openAnswer,
        moduleStats: compactStats,
        answeredCount,
        totalQuestions,
      });

      const today = new Date().toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      setResultsData({
        name: state.name,
        company: state.company,
        stageLabel,
        dateLabel: today,
        answers: state.answers,
        challenges: state.challenges,
        openAnswer: state.openAnswer,
        moduleStats: compactStats,
        submissionId: submitted?.id,
      });

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      console.error(err);
      setWarning("⚠️ Übermittlung fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">📊 Impact Akademie:&nbsp;<br />Marketing & Vertrieb</h1>
        <p className="mt-2 text-sm opacity-80 max-w-xl mx-auto">
          Bitte fülle dieses Self-Assessment bis spätestens zum <span className="text-red-600 font-bold">30. Juni 2026</span> aus.<br />
          Die Inhalte des Workshops basieren dann exakt auf Euren Herausforderungen, die sich aus dem Self-Assement ergeben.
        </p>
      </header>

      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-3 print:hidden">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              {answeredCount} von {totalQuestions} Fragen beantwortet
            </span>
            <span>{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pb-16 space-y-5 pt-5">
        {resultsData && (
          <div className="rounded-xl border border-scale-4 bg-scale-4-soft px-5 py-4 text-sm text-foreground">
            ✅ Vielen Dank, Ihre Antworten wurden übermittelt. Unten finden Sie Ihre persönliche Auswertung.
          </div>
        )}


        <section className="rounded-xl border border-border bg-card shadow-sm p-6">
          <h2 className="font-semibold text-primary mb-4">👤 Angaben zur Person</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="p-name">Name *</Label>
              <Input
                id="p-name"
                placeholder="Vor- und Nachname"
                value={state.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="p-company">Unternehmen / Startup</Label>
              <Input
                id="p-company"
                placeholder="Name des Unternehmens"
                value={state.company}
                onChange={(e) => updateField("company", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-industry">Branche</Label>
              <Input
                id="p-industry"
                placeholder="z. B. SaaS, E-Commerce, Beratung …"
                value={state.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="p-stage">Gründungszeitraum</Label>
              <select
                id="p-stage"
                value={state.stage}
                onChange={(e) => updateField("stage", e.target.value)}
                className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {MODULES.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            answers={state.answers}
            numericInputs={state.numericInputs}
            onAnswer={setAnswer}
            onNumericAnswer={setNumericAnswer}
          />
        ))}

        <section className="rounded-xl border border-border bg-card shadow-sm p-6">
          <h3 className="text-base font-semibold text-primary">
            🎯 Die drei größten Herausforderungen
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Bitte markiere die <strong>drei Bereiche</strong>, in denen Du aktuell den
            größten Unterstützungsbedarf siehst:
          </p>
          <ChallengeSelector selected={state.challenges} onToggle={toggleChallenge} />

          <div className="border-t border-border my-6" />

          <h3 className="text-base font-semibold text-primary">💬 Offene Frage</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Wenn Du im Workshop&nbsp;<strong>drei Themen intensiv bearbeiten</strong> könnten:
            Welche wären das und warum?
          </p>
          <Textarea
            placeholder="Ihre Antwort hier …"
            value={state.openAnswer}
            onChange={(e) => updateField("openAnswer", e.target.value)}
            className="min-h-[120px]"
          />

          <div className="text-center mt-6 space-y-2 print:hidden">
            <Button size="lg" onClick={handleGenerate} disabled={submitting}>
              {submitting ? "Wird übermittelt …" : resultsData ? "Erneut übermitteln" : "✅ Auswertung erstellen & senden"}
            </Button>
            {warning && <p className="text-xs text-destructive">{warning}</p>}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Alle Antworten zurücksetzen?")) {
                    reset();
                    setResultsData(null);
                  }
                }}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                Antworten zurücksetzen
              </button>
            </div>
          </div>
        </section>

        <div ref={resultsRef}>
          {resultsData && <ResultsPanel data={resultsData} />}
        </div>
      </main>
    </div>
  );
}
