import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MODULES } from "./data";
import type { AuditState } from "./useAuditState";

type ModuleStat = {
  mod: (typeof MODULES)[number];
  avg: number | null;
  redPct: number;
  naPct: number;
  answered: number;
  total: number;
};

function buildExportText(
  state: AuditState,
  moduleStats: ModuleStat[],
  meta: { name: string; company: string; stageLabel: string; today: string },
) {
  const { name, company, stageLabel, today } = meta;
  let txt = `==================================================\nSTARTUP MARKETING AUDIT – ERGEBNISSE\n==================================================\n`;
  txt += `Teilnehmer/in: ${name}\n`;
  txt += `Unternehmen: ${company}\n`;
  txt += `Gründungsphase: ${stageLabel}\n`;
  txt += `Datum: ${today}\n\n`;
  txt += `--------------------------------------------------\nMODUL-ÜBERSICHT (Kennzahlen für Trainer)\n--------------------------------------------------\n`;
  txt += `Format: Modul | Ø Wert | Anteil 0-1 (kritisch) | Anteil N/A\n\n`;
  moduleStats.forEach((s) => {
    txt += `[M${s.mod.id}] ${s.mod.title}\n`;
    txt += `  Ø ${s.avg !== null ? s.avg : "n/a"} | 🔴 ${s.redPct}% kritisch | ⬜ ${s.naPct}% N/A\n`;
  });
  txt += `\n--------------------------------------------------\nEINZELNE ANTWORTEN\n--------------------------------------------------\n`;
  MODULES.forEach((mod) => {
    txt += `\n[Modul ${mod.id}: ${mod.title}]\n`;
    mod.questions.forEach((q) => {
      const val = state.answers[q.id];
      const display = val === undefined ? "–" : val === "na" ? "N/A" : val;
      txt += `  ${q.id} ${q.title}: ${display}\n`;
    });
  });
  txt += `\n--------------------------------------------------\nSELBSTEINSCHÄTZUNG – GRÖßTE HERAUSFORDERUNGEN\n--------------------------------------------------\n`;
  if (state.challenges.length > 0) {
    state.challenges.forEach((id, i) => {
      const m = MODULES.find((x) => x.id === id);
      txt += `  ${i + 1}. Modul ${id}: ${m?.title ?? ""}\n`;
    });
  } else {
    txt += "  (keine Auswahl)\n";
  }
  txt += `\n--------------------------------------------------\nOFFENE FRAGE\n--------------------------------------------------\n`;
  txt += state.openAnswer || "(keine Antwort)\n";
  txt += `\n\n==================================================\nANALYSE-ANFRAGE FÜR KI (bitte einschließen)\n==================================================\n`;
  txt += `Bitte analysiere diese Startup-Audit-Ergebnisse und erstelle:\n\n`;
  txt += `1. PRIORITÄTEN: Die drei kritischsten Module mit dem größten Handlungsbedarf (begründet durch Ø-Wert und Anteil kritischer Antworten)\n\n`;
  txt += `2. WORKSHOP-SCHWERPUNKTE: Konkrete Empfehlung, welche Themen im Workshop intensiv behandelt werden sollten – basierend auf den Selbsteinschätzungen und den Datenpunkten\n\n`;
  txt += `3. QUICK WINS: 3 Maßnahmen, die die teilnehmende Person sofort nach dem Workshop umsetzen kann\n\n`;
  txt += `4. WARNSIGNALE: Gibt es strukturelle Probleme (z. B. fehlende Marktvalidierung trotz Marketing-Investitionen), die explizit angesprochen werden sollten?\n\n`;
  txt += `5. STÄRKEN: Was läuft bereits gut und sollte im Workshop bestätigt/gestärkt werden?\n`;
  return txt;
}

export function ResultsPanel({
  state,
  moduleStats,
  stageLabel,
}: {
  state: AuditState;
  moduleStats: ModuleStat[];
  stageLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const name = state.name || "Teilnehmer/in";
  const company = state.company || "–";
  const today = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const exportText = buildExportText(state, moduleStats, {
    name,
    company,
    stageLabel,
    today,
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const downloadJSON = () => {
    const data = {
      meta: { name, company, stage: stageLabel, date: today },
      answers: state.answers,
      selfRatedChallenges: state.challenges,
      openAnswer: state.openAnswer,
      moduleScores: moduleStats.map((s) => ({
        module: `M${s.mod.id}`,
        title: s.mod.title,
        average: s.avg,
        criticalPct: s.redPct,
        naPct: s.naPct,
        answeredCount: s.answered,
        totalCount: s.total,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `startup-audit-${(name || "teilnehmer").replace(/\s+/g, "-").toLowerCase()}-${today.replace(/\./g, "")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <header className="bg-primary text-primary-foreground px-6 py-5">
        <h2 className="text-xl font-semibold">📈 Ihre Auswertung</h2>
        <p className="text-sm opacity-80 mt-1">
          {name} · {company} · {stageLabel} · {today}
        </p>
      </header>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          {moduleStats.map((s) => {
            const badgeCls =
              s.avg === null
                ? "bg-muted text-foreground"
                : s.avg < 1.5
                  ? "bg-scale-0-soft text-scale-0"
                  : s.avg < 2.5
                    ? "bg-scale-2-soft text-scale-2"
                    : "bg-scale-4-soft text-scale-4";
            return (
              <div
                key={s.mod.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">
                    Modul {s.mod.id}: {s.mod.title}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-bold px-2.5 py-0.5 rounded-full",
                      badgeCls,
                    )}
                  >
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

        {state.challenges.length > 0 && (
          <div className="rounded-lg border border-border bg-accent/50 p-4">
            <h3 className="font-semibold text-sm text-primary mb-3">
              🎯 Priorisierte Workshop-Themen
            </h3>
            <ul className="space-y-2">
              {state.challenges.map((id, i) => {
                const m = MODULES.find((x) => x.id === id);
                const stat = moduleStats.find((s) => s.mod.id === id);
                return (
                  <li key={id} className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-b-0">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="text-sm">
                      <strong>
                        Modul {id}: {m?.title}
                      </strong>
                      {stat && stat.avg !== null && (
                        <div className="text-xs text-muted-foreground">
                          Durchschnitt: Ø {stat.avg} · Kritische Fragen: {stat.redPct}%
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <h4 className="font-semibold text-sm text-primary mb-1">
            🤖 KI-Auswertung für Trainer
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Kopieren Sie den Text und fügen Sie ihn in Claude oder ChatGPT ein,
            um sofort eine detaillierte Analyse zu erhalten.
          </p>
          <Textarea
            readOnly
            value={exportText}
            className="font-mono text-xs h-56 bg-background"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" onClick={copy}>
              {copied ? "✅ Kopiert!" : "📋 Text kopieren"}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              🖨️ Drucken / Als PDF speichern
            </Button>
            <Button variant="outline" onClick={downloadJSON}>
              ⬇️ Als JSON exportieren
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
