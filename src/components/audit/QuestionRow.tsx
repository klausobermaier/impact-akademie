import { cn } from "@/lib/utils";
import { SCALE_LABELS, SCALE_VALS, type AnswerValue, type Question } from "./data";

const SOFT_BG = [
  "bg-scale-0-soft",
  "bg-scale-1-soft",
  "bg-scale-2-soft",
  "bg-scale-3-soft",
  "bg-scale-4-soft",
];
const BORDER = [
  "border-scale-0",
  "border-scale-1",
  "border-scale-2",
  "border-scale-3",
  "border-scale-4",
];
const TEXT = [
  "text-scale-0",
  "text-scale-1",
  "text-scale-2",
  "text-scale-3",
  "text-scale-4",
];

export function QuestionRow({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (val: AnswerValue) => void;
}) {
  const answered = value !== undefined;
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-border/60 last:border-b-0 transition-colors",
        answered && "bg-accent/40",
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[11px] font-bold text-primary bg-accent px-1.5 py-0.5 rounded shrink-0 mt-0.5">
          {question.id}
        </span>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground flex flex-wrap items-center gap-2">
            {question.title}
            {question.isNew && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-accent px-1.5 py-0.5 rounded-full">
                Neu
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">{question.text}</div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {SCALE_VALS.map((v, i) => {
          const selected = value === v;
          const isNa = v === "na";
          return (
            <button
              key={String(v)}
              type="button"
              onClick={() => onChange(v)}
              className={cn(
                "flex-1 min-w-[52px] py-2 px-1 rounded-md border-[1.5px] text-sm font-semibold transition-colors text-center select-none",
                "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent",
                selected && !isNa && SOFT_BG[i],
                selected && !isNa && BORDER[i],
                selected && !isNa && TEXT[i],
                selected && isNa && "bg-muted border-muted-foreground/40 text-foreground",
              )}
            >
              <div>{isNa ? "N/A" : v}</div>
              <div className="text-[10px] font-normal opacity-80 leading-tight">
                {SCALE_LABELS[i]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
