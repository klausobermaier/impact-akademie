import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
  submissionId?: string;
  name: string;
  company: string;
  stageLabel: string;
  moduleStats: ModuleStatInput[];
  challenges: Array<{ id: number; title: string }>;
  openAnswer: string;
  answersText: string;
};

export const AUDIT_EVAL_SYSTEM_PROMPT = `Du bist ein erfahrener Startup-, Marketing- und Vertriebsberater der Impact Akademie.

Deine Aufgabe ist es, die Antworten eines Teilnehmers der „Impact Akademie" auszuwerten und ihm eine kurze, praxisnahe Rückmeldung zu geben.

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

WICHTIG ZUR ANSPRACHE
- Sprich den Teilnehmer durchgängig mit „Du" / „Dein" / „Dir" an.
- Verwende NIEMALS die Höflichkeitsform „Sie" / „Ihr" / „Ihnen" / „Ihre".

ERSTELLE DIE AUSWERTUNG IN FOLGENDEM FORMAT (Markdown):

WICHTIG: Erzeuge KEINEN Abschnitt „Deine Ergebnisse im Überblick" oder „Ihre Ergebnisse im Überblick" und keine Modul-Karten / Tabellen mit farbigen Emoji-Indikatoren (🟢/🟡/🔴). Die Modul-Übersicht inkl. Durchschnittswerte wird vom System gerendert. Beginne direkt mit „## Deine größten Stärken".

## Deine größten Stärken
Nenne die 2–3 Module mit den höchsten Werten. Beschreibe in wenigen Sätzen, was bei Dir bereits gut entwickelt ist, welche Vorteile daraus entstehen und warum dies eine gute Grundlage für weiteres Wachstum darstellt.

## Deine größten Entwicklungsfelder
Nenne die 2–3 Module mit den niedrigsten Werten. Beschreibe Risiken, Auswirkungen auf Marketing/Vertrieb/Wachstum und warum diese Themen aktuell wichtiger sind als andere.

## Einschätzung Deiner aktuellen Situation
Kurze Analyse (max. 250 Wörter): Wo stehst Du mit Deinem Unternehmen? Welche Muster sind erkennbar? Welcher Engpass verhindert aktuell wahrscheinlich Dein stärkstes Wachstum?

## Empfehlung für Deinen Workshop
Maximal drei Themenbereiche:
**Priorität 1: [Thema]** — Warum dieses Thema Dir aktuell den größten Nutzen bringt. *Konkretes Ziel:* [1 Satz]
**Priorität 2: [Thema]** — Warum dieses Thema für Dich aktuell relevant ist. *Konkretes Ziel:* [1 Satz]
**Priorität 3: [Thema]** — Warum dieses Thema für Dich aktuell relevant ist. *Konkretes Ziel:* [1 Satz]

## Dein nächster sinnvoller Schritt
Eine konkrete Handlungsempfehlung, die Du innerhalb der nächsten sieben Tage umsetzen kannst.

MAXIMALE LÄNGE DER GESAMTEN AUSWERTUNG: 800 Wörter.`;

export function buildAuditEvalUserPrompt(d: EvalInput): string {
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
      system: AUDIT_EVAL_SYSTEM_PROMPT,
      prompt: buildAuditEvalUserPrompt(data),
    });

    // Persist to submission if submissionId was provided
    if (data.submissionId) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("audit_submissions")
          .update({
            ai_evaluation: text,
            ai_evaluation_generated_at: new Date().toISOString(),
          })
          .eq("id", data.submissionId);
      } catch (err) {
        console.error("Failed to persist AI evaluation:", err);
      }
    }

    return { text };
  });

// ===== Group analysis for trainers (admin only) =====

const GROUP_SYSTEM_PROMPT = `Du bist ein erfahrener Startup-, Marketing- und Vertriebsberater sowie Workshop-Designer der Impact Akademie.

Deine Aufgabe ist es, die Einzel-Auswertungen aller Teilnehmer der Impact Akademie zu analysieren und daraus eine Gesamtbewertung der Gruppe für die Trainer zu erstellen.

Ziel ist NICHT die individuelle Beratung einzelner Teilnehmer.
Ziel ist die optimale Vorbereitung eines dreistündigen Workshops, damit die Trainer ihre Zeit auf die größten Engpässe der Gruppe konzentrieren.

WICHTIGE REGELN
- Analysiere die Gruppe als Ganzes.
- Suche nach Mustern, nicht nach Einzelfällen.
- Identifiziere die größten Wachstumshemmnisse der Gruppe.
- Berücksichtige die Gründungsphasen der Teilnehmer.
- Berücksichtige die vom Teilnehmer selbst genannten Herausforderungen.
- Berücksichtige die Workshopstruktur.
- Vermeide Tool-, Plattform- oder Kanal-Diskussionen (Instagram, LinkedIn, Newsletter, CRM etc.), wenn dahinterliegende Grundlagenprobleme bestehen.
- Priorisiere Ursache vor Symptom.
- Priorisiere Wirkung vor Vollständigkeit.

ANALYSELOGIK
Schritt 1: Analysiere für jedes Modul Durchschnittswert, Median, Anzahl N/A, Verteilung.
Schritt 2: Identifiziere die drei stärksten Module, die drei schwächsten Module, die drei am häufigsten genannten Herausforderungen.
Schritt 3: Suche nach typischen Mustern (z. B. hohe Sichtbarkeit / niedriger Vertrieb; hohe Automatisierung / niedrige Marktvalidierung; klare Positionierung / fehlende Leadgenerierung).
Schritt 4: Bestimme die wichtigsten Workshop-Schwerpunkte. Prioritätenlogik:
  Marktvalidierung → Positionierung → Zielgruppe → Leadgenerierung → Vertrieb → Kundenbindung → Sichtbarkeit → Content → Netzwerke → Systeme & Automatisierung.
Wenn grundlegende Themen schwach sind, dürfen fortgeschrittene Themen NICHT priorisiert werden.

WORKSHOP-STRUKTUR
Teil 1: Das große Bild (30 Min)
Teil 2: Gruppenanalyse (30 Min)
Teil 3: Vertiefung der drei wichtigsten Engpässe (90 Min)
Teil 4: Individueller Aktionsplan (20 Min)
Teil 5: Commitments (10 Min)
Deine Analyse soll insbesondere Teil 2 und Teil 3 vorbereiten.

ERSTELLE DIE AUSWERTUNG IN FOLGENDEM FORMAT (Markdown):

## Management Summary
Zusammenfassung der wichtigsten Erkenntnisse, max. 200 Wörter.

## Profil der Teilnehmergruppe
- Anzahl Teilnehmer
- Verteilung der Gründungsphasen
- Durchschnittliche Reife der Gruppe
- Auffällige Gemeinsamkeiten

## Stärken der Gruppe
Drei stärkste Module. Pro Modul: Durchschnittswert, Interpretation, Bedeutung für die weitere Entwicklung.

## Größte Engpässe der Gruppe
Drei schwächste Module. Pro Modul: Durchschnittswert, Interpretation, Risiken, Auswirkungen auf Kundengewinnung und Wachstum.

## Analyse der Teilnehmerwünsche
Häufigste Herausforderungen. Stimmen subjektive Probleme mit Audit-Ergebnissen überein? Wo liegen blinde Flecken? Welche Themen werden über-/unterschätzt?

## Empfehlung für Teil 2: Gruppenanalyse
Welche Ergebnisse präsentieren? Welche Diskussionen sind besonders wertvoll? Welche überraschenden Erkenntnisse hervorheben?

## Empfehlung für Teil 3: Schwerpunktmodule
Genau drei Schwerpunkte. Pro Schwerpunkt: **Schwerpunkt N: [Thema]** — Begründung, Lernziele, typische Fehler der Teilnehmer, empfohlene Übungen.

## Was die Trainer NICHT vertiefen sollten
Themen auflisten, die häufig genannt werden, aktuell aber nicht die größten Hebel darstellen. Begründung.

## Empfehlungen für den Aktionsplan
Welche Arten von Maßnahmen sollten Teilnehmer nach dem Workshop definieren? Welche Ergebnisse wären ein realistischer Erfolg?

MAXIMALE LÄNGE: 1.500 Wörter.
Der Bericht soll direkt von den Trainern zur Workshop-Vorbereitung verwendet werden können.`;

export const generateGroupAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({}).parse(input ?? {}))
  .handler(async ({ context }) => {
    // Admin gate
    const { data: roleRow, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr || !roleRow) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("audit_submissions")
      .select(
        "id, name, company, industry, stage, challenges, open_answer, module_stats, answered_count, total_questions, ai_evaluation, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) {
      throw new Error("Es liegen noch keine Einreichungen vor.");
    }

    // Build aggregated prompt
    let prompt = `GRUPPE: ${rows.length} Teilnehmer\n\n`;
    prompt += `=== EINZEL-PROFILE ===\n`;
    rows.forEach((r, i) => {
      const stats = (r.module_stats as ModuleStatInput[] | null) ?? [];
      prompt += `\n--- Teilnehmer ${i + 1} ---\n`;
      prompt += `Unternehmen: ${r.company ?? "–"} | Branche: ${r.industry ?? "–"} | Gründungsphase: ${r.stage ?? "–"}\n`;
      prompt += `Beantwortet: ${r.answered_count}/${r.total_questions}\n`;
      prompt += `Modul-Durchschnitte:\n`;
      stats.forEach((m) => {
        prompt += `  - Modul ${m.modId} ${m.title}: Ø ${m.avg ?? "n/a"} (krit ${m.redPct}%, N/A ${m.naPct}%)\n`;
      });
      const challenges = (r.challenges as number[] | null) ?? [];
      prompt += `Selbstgenannte Herausforderungen (Modul-IDs): ${challenges.length ? challenges.join(", ") : "keine"}\n`;
      if (r.open_answer) prompt += `Offene Antwort: ${r.open_answer}\n`;
      if (r.ai_evaluation) {
        prompt += `\nVorhandene Einzel-KI-Auswertung:\n${r.ai_evaluation}\n`;
      }
    });

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: GROUP_SYSTEM_PROMPT,
      prompt,
    });

    return { text, participantCount: rows.length };
  });
