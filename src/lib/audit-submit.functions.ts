import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ModuleStatSchema = z.object({
  modId: z.number(),
  title: z.string(),
  avg: z.number().nullable(),
  redPct: z.number(),
  naPct: z.number(),
  answered: z.number(),
  total: z.number(),
});

const PayloadSchema = z.object({
  name: z.string().trim().min(1),
  company: z.string().optional().default(""),
  industry: z.string().optional().default(""),
  stage: z.string().optional().default(""),
  answers: z.record(z.string(), z.union([z.number(), z.literal("na")])),
  challenges: z.array(z.number()),
  openAnswer: z.string().optional().default(""),
  moduleStats: z.array(ModuleStatSchema),
  answeredCount: z.number().int().nonnegative(),
  totalQuestions: z.number().int().positive(),
});

export const submitAuditFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PayloadSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("audit_submissions")
      .insert({
        name: data.name.trim(),
        company: data.company.trim() || null,
        industry: data.industry.trim() || null,
        stage: data.stage || null,
        answers: data.answers,
        challenges: data.challenges,
        open_answer: data.openAnswer.trim() || null,
        module_stats: data.moduleStats,
        answered_count: data.answeredCount,
        total_questions: data.totalQuestions,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });
