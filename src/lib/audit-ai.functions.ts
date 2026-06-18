import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

type ModuleStatInput = {
  modId: number;
  title: string;
  avg: number | null;
  redPct: number;
  naPct: number;
  answered: number;
  total: number;
};

type EvalInput = {
  name: string;
  company: string;
  stageLabel: string;
  moduleStats: ModuleStatInput[];
  challenges: Array<{ id: number; title: string }>;
  openAnswer: string;
  answersText: string;
};

const SYSTEM_PROMPT = `Du bist ein erfahrener Startup-, Marketing- und Vertriebsberater der Impact Akademie.

Deine Aufgabe ist es, die Antworten eines Teilnehmers des „Startup Marketing Audits" auszuwerten und ihm eine kurze, praxisnahe Rückmeldung zu geben.

WICHTIGE REGELN
- Sei konstruktiv, konkret und ehrlich.
- Vermeide allgemeine Motivationssprüche.
- Bewerte die Situation ausschließlich auf Basis der vorliegenden Antworten.
- Berücksichtige die Gründungsphase des Teilnehmers.
- Berücksichtige die Antwortoption „N/A" und werte diese nicht negativ.
- Identifiziere die größten Hebel für die nächsten 90 Tage.
- Priorisiere Wirkung vor Vollständigkeit.
- Empfiehl maximal drei Schwerpunktthemen für den Workshop.

AUSWERTUNGSLOGIK
- Berechne für jedes Modul den Durchschnittswert (ist bereits vorberechnet).
- Ermittle die drei Module mit den niedrigsten Durchschnittswerten (ohne N/A).
- Berücksichtige zusätzlich die vom Teilnehmer genannten „drei größten Herausforderungen".
- Prüfe auf offensichtliche Engpässe:
  - Marktvalidierung vor Marketing
  - Leadgenerierung vor Automatisierung
  - Vertrieb vor Reichweitenaufbau
  - Kundengewinnung vor Kundenbindung
- Gib keine Empfehlungen für fortgeschrittene Themen, wenn grundlegende Themen noch ungelöst sind.

ERSTELLE DIE AUSWERTUNG IN FOLGENDEM FORMAT (Markdown):

## Ihre Ergebnisse im Überblick
Tabelle mit Modul | Durchschnittswert

## Ihre größten Stärken
Nenne die 2–3 Module mit den höchsten Werten. Beschreibe in wenigen Sätzen, was bereits gut entwickelt ist, welche Vorteile daraus entstehen und warum dies eine gute Grundlage für weiteres Wachstum darstellt.

## Ihre größten Entwicklungsfelder
Nenne die 2–3 Module mit den niedrigsten Werten. Beschreibe Risiken, Auswirkungen auf Marketing/Vertrieb/Wachstum und warum diese Themen aktuell wichtiger sind als andere.

## Einschätzung Ihrer aktuellen Situation
Kurze Analyse (max. 250 Wörter): Wo steht das Unternehmen? Welche Muster sind erkennbar? Welcher Engpass verhindert aktuell wahrscheinlich das stärkste Wachstum?

## Empfehlung für den Workshop
Maximal drei Themenbereiche:
**Priorität 1: [Thema]** — Warum dieses Thema aktuell den größten Nutzen bringt. *Konkretes Ziel:* [1 Satz]
**Priorität 2: [Thema]** — Warum dieses Thema aktuell relevant ist. *Konkretes Ziel:* [1 Satz]
**Priorität 3: [Thema]** — Warum dieses Thema aktuell relevant ist. *Konkretes Ziel:* [1 Satz]

## Nächster sinnvoller Schritt
Eine konkrete Handlungsempfehlung, die der Teilnehmer innerhalb der nächsten sieben Tage umsetzen kann.

MAXIMALE LÄNGE DER GESAMTEN AUSWERTUNG: 800 Wörter.`;

function buildUserPrompt(d: EvalInput): string {
  let s = `TEILNEHMER\n`;
  s += `Name: ${d.name}\n`;
  s += `Unternehmen: ${d.company || "–"}\n`;
  s += `Gründungsphase: ${d.stageLabel}\n\n`;
  s += `MODUL-DURCHSCHNITTE\n`;
  d.moduleStats.forEach((m) => {
    s += `- Modul ${m.modId} (${m.title}): Ø ${m.avg !== null ? m.avg : "n/a"} | ${m.answered}/${m.total} beantwortet | ${m.redPct}% kritisch | ${m.naPct}% N/A\n`;
  });
  s += `\nDREI GRÖSSTE HERAUSFORDERUNGEN (Selbsteinschätzung)\n`;
  if (d.challenges.length === 0) s += `(keine Auswahl)\n`;
  else d.challenges.forEach((c, i) => (s += `${i + 1}. Modul ${c.id}: ${c.title}\n`));
  s += `\nOFFENE ANTWORT (Wunsch-Workshop-Themen)\n${d.openAnswer || "(keine Antwort)"}\n\n`;
  s += `EINZELANTWORTEN\n${d.answersText}\n`;
  return s;
}

export const generateAuditEvaluation = createServerFn({ method: "POST" })
  .inputValidator((input: EvalInput) => input)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(data),
    });
    return { text };
  });
