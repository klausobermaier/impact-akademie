import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MODULES } from "./data";
import type { AnswerValue } from "./data";
import { generateAuditEvaluation } from "@/lib/audit-ai.functions";

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
};

function buildQuestionnaireCopy(d: ResultsData) {
  let txt = `==================================================\nSTARTUP MARKETING AUDIT – IHRE ANTWORTEN\n==================================================\n`;
  txt += `Teilnehmer/in: ${d.name}\n`;
  txt += `Unternehmen: ${d.company || "–"}\n`;
  txt += `Gründungsphase: ${d.stageLabel}\n`;
  txt += `Datum: ${d.dateLabel}\n\n`;
  MODULES.forEach((mod) => {
    txt += `\n── Modul ${mod.id}: ${mod.title} ──\n`;
    mod.questions.forEach((q) => {
      const val = d.answers[q.id];
      const display = val === undefined ? "–" : val === "na" ? "N/A" : String(val);
      txt += `${q.id}  ${q.title}\n   Antwort: ${display}\n`;
    });
  });
  txt += `\n── Drei größte Herausforderungen ──\n`;
  if (d.challenges.length > 0) {
    d.challenges.forEach((id, i) => {
      const m = MODULES.find((x) => x.id === id);
      txt += `${i + 1}. Modul ${id}: ${m?.title ?? ""}\n`;
    });
  } else txt += `(keine Auswahl)\n`;
  txt += `\n── Offene Antwort ──\n${d.openAnswer || "(keine Antwort)"}\n`;
  return txt;
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

export function ResultsPanel({ data }: { data: ResultsData }) {
  const [copied, setCopied] = useState(false);
  const questionnaireText = useMemo(() => buildQuestionnaireCopy(data), [data]);

  const generate = useServerFn(generateAuditEvaluation);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);

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
        "Die KI-Auswertung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-start evaluation when results appear
  useEffect(() => {
    runEvaluation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const copyQuestionnaire = async () => {
    try {
      await navigator.clipboard.writeText(questionnaireText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };


  return (
    <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <header className="bg-primary text-primary-foreground px-6 py-5">
        <h2 className="text-xl font-semibold">📈 Auswertung</h2>
        <p className="text-sm opacity-80 mt-1">
          {data.name} · {data.company || "–"} · {data.stageLabel} · {data.dateLabel}
        </p>
      </header>

      <div className="p-6 space-y-6">
        <div className="space-y-3">
          {data.moduleStats.map((s) => {
            const badgeCls =
              s.avg === null
                ? "bg-muted text-foreground"
                : s.avg < 1.5
                  ? "bg-scale-0-soft text-scale-0"
                  : s.avg < 2.5
                    ? "bg-scale-2-soft text-scale-2"
                    : "bg-scale-4-soft text-scale-4";
            return (
              <div key={s.modId} className="rounded-lg border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">
                    Modul {s.modId}: {s.title}
                  </div>
                  <span className={cn("text-sm font-bold px-2.5 py-0.5 rounded-full", badgeCls)}>
                    Ø {s.avg !== null ? s.avg : "N/A"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>📊 {s.answered}/{s.total} beantwortet</span>
                  <span>🔴 {s.redPct}% kritisch (0–1)</span>
                  <span>⬜ {s.naPct}% N/A</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* KI-Kurzauswertung */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-primary">🤖 Ihre persönliche KI-Kurzauswertung</h3>
            {!aiLoading && aiText && (
              <Button variant="outline" size="sm" onClick={runEvaluation}>
                Neu generieren
              </Button>
            )}
          </div>

          {aiLoading && (
            <p className="text-sm text-muted-foreground italic">
              Auswertung wird erstellt … das kann einige Sekunden dauern.
            </p>
          )}

          {aiError && (
            <div className="text-sm text-destructive">
              {aiError}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={runEvaluation}>
                  Erneut versuchen
                </Button>
              </div>
            </div>
          )}

          {aiText && <MarkdownView text={aiText} />}
        </div>

        {/* Fragebogen-Kopie */}
        <div className="rounded-lg border border-border bg-muted/40 p-5">
          <h3 className="font-semibold text-primary mb-1">📄 Ihre Fragebogen-Kopie</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Alle Ihre Antworten zum Nachlesen, Speichern oder Ausdrucken.
          </p>
          <Textarea
            readOnly
            value={questionnaireText}
            className="font-mono text-xs h-64 bg-background"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" onClick={copyQuestionnaire}>
              {copied ? "✅ Kopiert!" : "📋 Kopieren"}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              🖨️ Drucken / Als PDF speichern
            </Button>
          </div>
        </div>

        {data.openAnswer && (
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-sm text-primary mb-2">💬 Ihre offene Antwort</h4>
            <p className="text-sm whitespace-pre-wrap text-foreground/90">{data.openAnswer}</p>
          </div>
        )}
      </div>
    </section>
  );
}
