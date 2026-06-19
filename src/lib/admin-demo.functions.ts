import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  AUDIT_EVAL_SYSTEM_PROMPT,
  buildAuditEvalUserPrompt,
} from "./audit-ai.functions";
import { MODULES, STAGE_OPTIONS, type AnswerValue } from "@/components/audit/data";

type ModuleStat = {
  modId: number;
  title: string;
  avg: number | null;
  redPct: number;
  naPct: number;
  answered: number;
  total: number;
};

const FIRST_NAMES = [
  "Anna", "Jonas", "Lena", "Maximilian", "Sophie", "Paul", "Mia", "Felix",
  "Hannah", "Lukas", "Emma", "Noah", "Lara", "Tim", "Clara", "David",
  "Julia", "Sebastian", "Marie", "Tobias",
];
const LAST_NAMES = [
  "Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner",
  "Becker", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein",
  "Wolf", "Neumann", "Schwarz", "Zimmermann",
];
const COMPANY_SUFFIXES = ["GmbH", "Studio", "Labs", "Ventures", "& Co.", "Collective", "Works", "Hub"];
const COMPANY_STEMS = [
  "Nordlicht", "Brightpath", "Kernwerk", "Bloomly", "Flowstack", "Pulsar",
  "Klartext", "Lumen", "Atlas", "Veritas", "Mosaik", "Aurora", "Habitat",
  "Trailhead", "Sundial", "Beacon",
];
const INDUSTRIES = [
  "SaaS", "E-Commerce", "Coaching & Beratung", "Online-Bildung", "Agentur",
  "Health & Wellness", "Nachhaltigkeit", "Handwerk & lokale Dienstleistung",
  "B2B-Dienstleistung", "Kreativwirtschaft", "FinTech", "PropTech",
];
const OPEN_ANSWERS = [
  "Ich wünsche mir konkrete Schritte zur Leadgenerierung und ein klareres Vertriebssystem.",
  "Mein Fokus liegt auf Positionierung und der Frage, wie ich endlich planbar Kunden gewinne.",
  "Ich möchte verstehen, wie ich Sichtbarkeit aufbaue, ohne mich in Social Media zu verlieren.",
  "Mir fehlt eine Struktur für Angebot, Preis und Vertrieb – am liebsten ein roter Faden.",
  "Ich brauche Klarheit zur Zielgruppe und einen realistischen 90-Tage-Plan.",
  "Mich interessiert vor allem, wie ich Empfehlungen und Wiederkäufe systematisch aufbaue.",
  "",
];

const STAGE_VALUES = STAGE_OPTIONS.filter((s) => s.value !== "").map((s) => s.value);

type ProfileKey = "weak" | "below" | "mid" | "above" | "strong";
const PROFILES: Record<ProfileKey, { base: number; spread: number; naProb: number }> = {
  weak:   { base: 1.0, spread: 1.0, naProb: 0.12 },
  below:  { base: 1.7, spread: 1.0, naProb: 0.10 },
  mid:    { base: 2.4, spread: 1.1, naProb: 0.10 },
  above:  { base: 3.0, spread: 0.9, naProb: 0.08 },
  strong: { base: 3.5, spread: 0.7, naProb: 0.06 },
};
const PROFILE_KEYS: ProfileKey[] = ["weak", "below", "mid", "above", "strong"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function clampScore(n: number): 0 | 1 | 2 | 3 | 4 {
  const v = Math.max(0, Math.min(4, Math.round(n)));
  return v as 0 | 1 | 2 | 3 | 4;
}

function generateProfile() {
  const key = pick(PROFILE_KEYS);
  const p = PROFILES[key];
  const answers: Record<string, AnswerValue> = {};

  MODULES.forEach((mod) => {
    // Slight per-module wobble so not every module sits at base.
    const moduleBias = (Math.random() - 0.5) * 0.8;
    mod.questions.forEach((q) => {
      if (Math.random() < p.naProb) {
        answers[q.id] = "na";
        return;
      }
      // Box-Muller-ish jitter using two uniforms; simpler: triangular distribution.
      const jitter = (Math.random() - Math.random()) * p.spread;
      answers[q.id] = clampScore(p.base + moduleBias + jitter);
    });
  });

  return { profileKey: key, answers };
}

function buildModuleStats(answers: Record<string, AnswerValue>): ModuleStat[] {
  return MODULES.map((mod) => {
    const vals = mod.questions
      .map((q) => answers[q.id])
      .filter((v): v is AnswerValue => v !== undefined);
    const numeric = vals.filter((v): v is 0 | 1 | 2 | 3 | 4 => v !== "na");
    const naCount = vals.filter((v) => v === "na").length;
    const redCount = numeric.filter((v) => v <= 1).length;
    const avg =
      numeric.length > 0
        ? Number(((numeric as number[]).reduce((a, b) => a + b, 0) / numeric.length).toFixed(1))
        : null;
    const total = mod.questions.length;
    const redPct = numeric.length > 0 ? Math.round((redCount / numeric.length) * 100) : 0;
    const naPct = total > 0 ? Math.round((naCount / total) * 100) : 0;
    return {
      modId: mod.id,
      title: mod.title,
      avg,
      redPct,
      naPct,
      answered: vals.length,
      total,
    };
  });
}

function buildAnswersText(answers: Record<string, AnswerValue>): string {
  let s = "";
  MODULES.forEach((mod) => {
    s += `\n[Modul ${mod.id}: ${mod.title}]\n`;
    mod.questions.forEach((q) => {
      const val = answers[q.id];
      const display = val === undefined ? "–" : val === "na" ? "N/A" : String(val);
      s += `  ${q.id} ${q.title}: ${display}\n`;
    });
  });
  return s;
}

export const generateDemoSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr || !isAdmin) throw new Error("Forbidden");

    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const company = `${pick(COMPANY_STEMS)} ${pick(COMPANY_SUFFIXES)}`;
    const industry = pick(INDUSTRIES);
    const stage = pick(STAGE_VALUES);
    const stageLabel = STAGE_OPTIONS.find((s) => s.value === stage)?.label ?? "–";
    const openAnswer = pick(OPEN_ANSWERS);

    const { profileKey, answers } = generateProfile();
    const moduleStats = buildModuleStats(answers);

    // Pick 2–3 challenges, weighted toward weakest modules so it feels plausible.
    const sorted = [...moduleStats].sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0));
    const challengeCount = randInt(2, 3);
    const challenges = sorted.slice(0, challengeCount).map((s) => s.modId);

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = MODULES.reduce((n, m) => n + m.questions.length, 0);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("audit_submissions")
      .insert({
        name,
        company,
        industry,
        stage,
        answers,
        challenges,
        open_answer: openAnswer || null,
        module_stats: moduleStats,
        answered_count: answeredCount,
        total_questions: totalQuestions,
      })
      .select("id")
      .single();
    if (insertErr || !inserted) {
      throw new Error(insertErr?.message ?? "Konnte Demo-Einreichung nicht anlegen.");
    }

    // AI evaluation (best-effort: don't fail the whole call if Gateway hiccups).
    try {
      const key = process.env.LOVABLE_API_KEY;
      if (!key) throw new Error("Missing LOVABLE_API_KEY");
      const gateway = createLovableAiGatewayProvider(key);
      const challengeObjs = challenges.map((id) => {
        const mod = MODULES.find((m) => m.id === id);
        return { id, title: mod?.title ?? `Modul ${id}` };
      });
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: AUDIT_EVAL_SYSTEM_PROMPT,
        prompt: buildAuditEvalUserPrompt({
          submissionId: inserted.id,
          name,
          company,
          stageLabel,
          moduleStats,
          challenges: challengeObjs,
          openAnswer,
          answersText: buildAnswersText(answers),
        }),
      });
      await supabaseAdmin
        .from("audit_submissions")
        .update({
          ai_evaluation: text,
          ai_evaluation_generated_at: new Date().toISOString(),
        })
        .eq("id", inserted.id);
    } catch (err) {
      console.error("Demo: AI evaluation failed", err);
    }

    return { id: inserted.id, name, company, profile: profileKey };
  });
