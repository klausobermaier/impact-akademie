import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
  numericValue,
  onChange,
  onNumericChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  numericValue?: number;
  onChange: (val: AnswerValue) => void;
  onNumericChange?: (n: number | null) => void;
}) {
  const answered = value !== undefined;
  const isNumber = question.kind === "number";

  // Render question text. For numeric questions, replace "X" with the number or "___".
  const renderedText = isNumber
    ? question.text.replace(
        /\bX\b/,
        numericValue !== undefined ? String(numericValue) : "___",
      )
    : question.text;

  const labels = question.scaleLabels ?? SCALE_LABELS.slice(0, 5);
  const naLabel = question.naLabel ?? "N/A";
  const hasCustomLabels = !!question.scaleLabels;

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
          <div className="text-sm text-muted-foreground mt-0.5">{renderedText}</div>
        </div>
      </div>

      {isNumber ? (
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="number"
            min={0}
            inputMode="numeric"
            value={
              value === "na"
                ? ""
                : numericValue !== undefined
                  ? String(numericValue)
                  : ""
            }
            placeholder="z. B. 10"
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onNumericChange?.(null);
                return;
              }
              const n = Math.max(0, Math.floor(Number(raw)));
              if (Number.isFinite(n)) onNumericChange?.(n);
            }}
            className="w-32"
          />
          {question.numberUnit && (
            <span className="text-sm text-muted-foreground">{question.numberUnit}</span>
          )}
          <button
            type="button"
            onClick={() => onChange("na")}
            className={cn(
              "ml-auto py-2 px-3 rounded-md border-[1.5px] text-sm font-semibold transition-colors",
              "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent",
              value === "na" && "bg-muted border-muted-foreground/40 text-foreground",
            )}
          >
            {naLabel}
          </button>
        </div>
      ) : (
        <div className={cn("grid gap-1.5", hasCustomLabels ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6" : "flex flex-wrap")}> 
          {SCALE_VALS.map((v, i) => {
            const selected = value === v;
            const isNa = v === "na";
            const label = isNa ? naLabel : labels[i];
            return (
              <button
                key={String(v)}
                type="button"
                onClick={() => onChange(v)}
                title={label}
                className={cn(
                  "py-2 px-2 rounded-md border-[1.5px] text-sm font-semibold transition-colors text-center select-none",
                  !hasCustomLabels && "flex-1 min-w-[52px]",
                  "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent",
                  selected && !isNa && SOFT_BG[i],
                  selected && !isNa && BORDER[i],
                  selected && !isNa && TEXT[i],
                  selected && isNa && "bg-muted border-muted-foreground/40 text-foreground",
                )}
              >
                <div>{isNa ? "N/A" : v}</div>
                <div
                  className={cn(
                    "font-normal opacity-80 leading-tight mt-0.5",
                    hasCustomLabels ? "text-[11px]" : "text-[10px]",
                  )}
                >
                  {label}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
