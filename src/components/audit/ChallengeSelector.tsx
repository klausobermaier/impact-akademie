import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { MODULES } from "./data";

export function ChallengeSelector({
  selected,
  onToggle,
}: {
  selected: number[];
  onToggle: (id: number) => void;
}) {
  const limitReached = selected.length >= 3;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {MODULES.map((mod) => {
        const isSelected = selected.includes(mod.id);
        const disabled = !isSelected && limitReached;
        return (
          <label
            key={mod.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg border-[1.5px] cursor-pointer transition-colors text-sm",
              isSelected
                ? "border-primary bg-accent text-primary font-semibold"
                : "border-border hover:border-primary hover:bg-accent",
              disabled && "opacity-40 cursor-not-allowed hover:border-border hover:bg-transparent",
            )}
          >
            <Checkbox
              checked={isSelected}
              disabled={disabled}
              onCheckedChange={() => onToggle(mod.id)}
            />
            <span>
              Modul {mod.id}: {mod.title}
            </span>
          </label>
        );
      })}
    </div>
  );
}
