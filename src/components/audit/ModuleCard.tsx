import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuestionRow } from "./QuestionRow";
import type { AnswerValue, Module } from "./data";

export function ModuleCard({
  module: mod,
  answers,
  numericInputs,
  onAnswer,
  onNumericAnswer,
}: {
  module: Module;
  answers: Record<string, AnswerValue>;
  numericInputs: Record<string, number>;
  onAnswer: (qid: string, val: AnswerValue) => void;
  onNumericAnswer: (qid: string, n: number | null) => void;
}) {
  const answered = mod.questions.filter((q) => answers[q.id] !== undefined).length;
  const pct = Math.round((answered / mod.questions.length) * 100);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <header className="px-5 py-4 bg-primary text-primary-foreground flex items-center gap-3">
        <span className="bg-primary-foreground/15 rounded-md px-2 py-0.5 text-xs font-bold shrink-0">
          Modul {mod.id}
        </span>
        <h2 className="text-base font-semibold flex-1">{mod.title}</h2>
      </header>

      {mod.subtitle && (
        <p className="px-5 py-2.5 bg-accent/60 border-b border-border text-sm text-primary italic">
          ℹ️ {mod.subtitle}
        </p>
      )}
      {mod.note && (
        <p className="px-5 py-2.5 bg-scale-2-soft border-b border-border text-sm text-foreground/80">
          {mod.note}
        </p>
      )}

      <div className="px-5 py-2 bg-muted/50 border-b border-border flex items-center gap-3 text-xs text-muted-foreground">
        <span className="whitespace-nowrap">
          {answered}/{mod.questions.length} beantwortet
        </span>
        <Progress value={pct} className="h-1.5 flex-1" />
      </div>

      <div>
        {mod.questions.map((q) => (
          <QuestionRow
            key={q.id}
            question={q}
            value={answers[q.id]}
            numericValue={numericInputs[q.id]}
            onChange={(v) => onAnswer(q.id, v)}
            onNumericChange={(n) => onNumericAnswer(q.id, n)}
          />
        ))}
      </div>
    </section>
  );
}
