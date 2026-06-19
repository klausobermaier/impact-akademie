import { useEffect, useState, type ReactElement } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
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
  submissionId?: string;
  initialAiText?: string | null;
};


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

          {aiText && <MarkdownView text={aiText} />}

          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-primary/10">
            Diese Auswertung wurde mit Hilfe einer KI erstellt.
          </p>
        </div>

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
