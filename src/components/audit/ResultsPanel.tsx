import { useEffect, useState, type ReactElement } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { MODULES, SCALE_LABELS } from "./data";
import type { AnswerValue } from "./data";
import { generateAuditEvaluation } from "@/lib/audit-ai.functions";

// Normalisiert alte, in „Sie"-Form gespeicherte KI-Auswertungen auf „Du"-Form.
function toDuForm(text: string): string {
  const rules: Array<[RegExp, string]> = [
    [/\bIhrer aktuellen Situation\b/g, "Deiner aktuellen Situation"],
    [/\bIhre Ergebnisse\b/g, "Deine Ergebnisse"],
    [/\bIhre größten Stärken\b/g, "Deine größten Stärken"],
    [/\bIhre größten Entwicklungsfelder\b/g, "Deine größten Entwicklungsfelder"],
    [/\bIhres Unternehmens\b/g, "Deines Unternehmens"],
    [/\bIhrem Unternehmen\b/g, "Deinem Unternehmen"],
    [/\bIhr Unternehmen\b/g, "Dein Unternehmen"],
    [/\bIhre\b/g, "Deine"],
    [/\bIhrer\b/g, "Deiner"],
    [/\bIhren\b/g, "Deinen"],
    [/\bIhrem\b/g, "Deinem"],
    [/\bIhres\b/g, "Deines"],
    [/\bIhr\b/g, "Dein"],
    [/\bIhnen\b/g, "Dir"],
    [/\bSie sich\b/g, "Du Dich"],
    [/\bhaben Sie\b/g, "hast Du"],
    [/\bsind Sie\b/g, "bist Du"],
    [/\bkönnen Sie\b/g, "kannst Du"],
    [/\bsollten Sie\b/g, "solltest Du"],
    [/\bwollen Sie\b/g, "willst Du"],
    [/\bmüssen Sie\b/g, "musst Du"],
    [/\bwerden Sie\b/g, "wirst Du"],
    [/\bdürfen Sie\b/g, "darfst Du"],
    [/\bSie\b/g, "Du"],
  ];
  let out = text;
  for (const [re, rep] of rules) out = out.replace(re, rep);
  return out;
}

export type ModuleStat = {
  modId: number;
  title: string;
  avg: number | null;
  redPct: number;
  naPct: number;
  answered: number;
  total: number;
};

export type ResultsData = {
  name: string;
  company: string;
  stageLabel: string;
  dateLabel: string;
  answers: Record<string, AnswerValue>;
  challenges: number[];
  openAnswer: string;
  moduleStats: ModuleStat[];
  submissionId?: string;
  initialAiText?: string | null;
};


// Entfernt einen evtl. von der KI erzeugten Block „Ihre/Deine Ergebnisse im Überblick".
// Die Übersicht wird jetzt deterministisch im Code gerendert.
function stripOverviewSection(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let inOverview = false;
  for (const line of lines) {
    if (/^##\s*(Ihre|Deine)\s+Ergebnisse\s+im\s+Überblick/i.test(line)) {
      inOverview = true;
      continue;
    }
    if (inOverview && /^##\s/.test(line)) inOverview = false;
    if (!inOverview) out.push(line);
  }
  return out.join("\n").trim();
}

function formatNum(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

function ModuleOverview({ stats }: { stats: ModuleStat[] }) {
  const rated = stats.filter((s) => s.avg !== null);
  const overallAvg =
    rated.length > 0
      ? rated.reduce((acc, s) => acc + (s.avg as number), 0) / rated.length
      : null;

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-primary">📊 Modul-Übersicht</h3>
        {overallAvg !== null && (
          <div className="text-sm text-muted-foreground">
            Gesamtdurchschnitt:{" "}
            <span className="font-semibold text-foreground">
              {formatNum(overallAvg)} / 4
            </span>{" "}
            (Mittel über {rated.length} bewertete Module)
          </div>
        )}
      </div>
      <ul className="divide-y divide-border">
        {stats.map((s) => (
          <li
            key={s.modId}
            className="py-2.5 flex items-center justify-between gap-3 flex-wrap"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">
                Modul {s.modId}: {s.title}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {s.answered}/{s.total} beantwortet · {s.redPct}% kritisch (Score 0–1) · {s.naPct}% N/A
              </div>
            </div>
            <div className="text-sm font-semibold whitespace-nowrap rounded-md border border-border bg-muted px-2.5 py-1">
              {s.avg !== null ? `Ø ${formatNum(s.avg)} / 4` : "Nicht bewertet"}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Skala 0–4: 0 = nicht vorhanden, 4 = exzellent etabliert. Module mit
        100% N/A fließen nicht in den Gesamtdurchschnitt ein.
      </p>
    </div>
  );
}

function buildAnswersTextForAi(d: ResultsData) {
  let s = "";
  MODULES.forEach((mod) => {
    s += `\n[Modul ${mod.id}: ${mod.title}]\n`;
    mod.questions.forEach((q) => {
      const val = d.answers[q.id];
      const display = val === undefined ? "–" : val === "na" ? "N/A" : String(val);
      s += `  ${q.id} ${q.title}: ${display}\n`;
    });
  });
  return s;
}

// Tiny markdown renderer (headings, bold, italic, lists, tables, paragraphs)
function MarkdownView({ text }: { text: string }) {
  const renderInline = (s: string) => {
    const parts: (string | ReactElement)[] = [];
    const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let key = 0;
    while ((m = regex.exec(s)) !== null) {
      if (m.index > last) parts.push(s.slice(last, m.index));
      if (m[1]) parts.push(<strong key={key++}>{m[1]}</strong>);
      else if (m[2]) parts.push(<em key={key++}>{m[2]}</em>);
      last = regex.lastIndex;
    }
    if (last < s.length) parts.push(s.slice(last));
    return parts;
  };

  const lines = text.split("\n");
  const blocks: ReactElement[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^##\s+/.test(line)) {
      blocks.push(
        <h3 key={k++} className="text-base font-semibold text-primary mt-5 mb-2">
          {renderInline(line.replace(/^##\s+/, ""))}
        </h3>,
      );
      i++;
    } else if (/^#\s+/.test(line)) {
      blocks.push(
        <h2 key={k++} className="text-lg font-bold text-primary mt-5 mb-2">
          {renderInline(line.replace(/^#\s+/, ""))}
        </h2>,
      );
      i++;
    } else if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*-/.test(lines[i + 1])) {
      const header = line.split("|").map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(lines[i].split("|").map((c) => c.trim()).filter(Boolean));
        i++;
      }
      blocks.push(
        <div key={k++} className="overflow-x-auto my-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted">
                {header.map((h, idx) => (
                  <th key={idx} className="border border-border px-2 py-1 text-left font-semibold">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="border border-border px-2 py-1">
                      {renderInline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={k++} className="list-disc pl-5 space-y-1 my-2 text-sm">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
    } else if (line.trim() === "") {
      i++;
    } else {
      blocks.push(
        <p key={k++} className="text-sm leading-relaxed my-2">
          {renderInline(line)}
        </p>,
      );
      i++;
    }
  }
  return <div>{blocks}</div>;
}

export function ResultsPanel({
  data,
  showQuestionDetails = false,
}: {
  data: ResultsData;
  showQuestionDetails?: boolean;
}) {
  const generate = useServerFn(generateAuditEvaluation);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string | null>(data.initialAiText ?? null);

  const runEvaluation = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiText(null);
    try {
      const challenges = data.challenges.map((id) => ({
        id,
        title: MODULES.find((m) => m.id === id)?.title ?? "",
      }));
      const res = await generate({
        data: {
          submissionId: data.submissionId,
          name: data.name,
          company: data.company,
          stageLabel: data.stageLabel,
          moduleStats: data.moduleStats,
          challenges,
          openAnswer: data.openAnswer,
          answersText: buildAnswersTextForAi(data),
        },
      });
      setAiText(res.text);
    } catch (err) {
      console.error(err);
      setAiError(
        "Die KI-Auswertung konnte nicht erstellt werden. Bitte versuche es erneut.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-start evaluation when results appear (but skip if we already have a cached one)
  useEffect(() => {
    if (data.initialAiText) {
      setAiText(data.initialAiText);
      return;
    }
    runEvaluation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <header className="bg-primary text-primary-foreground px-6 py-5">
        <h2 className="text-xl font-semibold">📈 Auswertung</h2>
        <p className="text-sm opacity-80 mt-1">
          {data.name} · {data.company || "–"} · {data.stageLabel} · {data.dateLabel}
        </p>
      </header>

      <div className="p-6 space-y-6">
        <ModuleOverview stats={data.moduleStats} />

        {/* KI-Auswertung */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-primary">🤖 Deine persönliche Auswertung</h3>
          </div>

          {aiLoading && (
            <p className="text-sm text-muted-foreground italic">
              Auswertung wird erstellt … das kann einige Sekunden dauern.
            </p>
          )}

          {aiError && (
            <div className="text-sm text-destructive">
              {aiError}
            </div>
          )}

          {aiText && <MarkdownView text={stripOverviewSection(toDuForm(aiText))} />}

          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-primary/10">
            Diese Auswertung wurde mit Hilfe einer KI erstellt.
          </p>
        </div>

        {showQuestionDetails && (
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">📋 Einzelauswertung der Fragen</h3>
            {MODULES.map((mod) => (
              <div key={mod.id} className="rounded-lg border border-border bg-card p-4">
                <h4 className="font-semibold text-sm text-primary mb-3">
                  Modul {mod.id}: {mod.title}
                </h4>
                <ul className="space-y-2">
                  {mod.questions.map((q) => {
                    const val = data.answers[q.id];
                    let label: string;
                    if (val === undefined) label = "–";
                    else if (val === "na") label = q.naLabel ?? "N/A";
                    else if (q.kind === "number") {
                      const raw = data.answers[q.id];
                      label = `${raw} (Score ${val})`;
                    } else {
                      label = `${val} – ${SCALE_LABELS[val as number] ?? ""}`;
                    }
                    return (
                      <li
                        key={q.id}
                        className="flex items-start justify-between gap-3 text-sm border-b border-border/50 pb-2 last:border-b-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-foreground/90">
                            {q.id} {q.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{q.text}</div>
                        </div>
                        <div className="text-sm font-semibold text-primary whitespace-nowrap">
                          {label}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Drucken / PDF */}
        <div className="rounded-lg border border-border bg-muted/40 p-5">
          <h3 className="font-semibold text-primary mb-1">📄 Fragebogen & KI-Auswertung</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Speichere deine Antworten und die KI-Auswertung als PDF.
          </p>
          <Button variant="outline" onClick={() => window.print()}>
            🖨️ Drucken / Als PDF speichern
          </Button>
        </div>

        {data.openAnswer && (
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-sm text-primary mb-2">💬 Deine offene Antwort</h4>
            <p className="text-sm whitespace-pre-wrap text-foreground/90">{data.openAnswer}</p>
          </div>
        )}
      </div>
    </section>
  );
}
