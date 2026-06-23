import { supabase } from "@/integrations/supabase/client";
import type { AnswerValue } from "@/components/audit/data";
import { submitAuditFn } from "@/lib/audit-submit.functions";
import type { Json } from "@/integrations/supabase/types";

export type SubmissionPayload = {
  name: string;
  company: string;
  industry: string;
  stage: string;
  answers: Record<string, AnswerValue>;
  challenges: number[];
  openAnswer: string;
  moduleStats: Array<{
    modId: number;
    title: string;
    avg: number | null;
    redPct: number;
    naPct: number;
    answered: number;
    total: number;
  }>;
  answeredCount: number;
  totalQuestions: number;
};

export type SubmissionRow = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  industry: string | null;
  stage: string | null;
  answers: Record<string, AnswerValue>;
  challenges: number[];
  open_answer: string | null;
  module_stats: SubmissionPayload["moduleStats"];
  answered_count: number;
  total_questions: number;
  ai_evaluation: string | null;
  ai_evaluation_generated_at: string | null;
};

export async function submitAudit(payload: SubmissionPayload) {
  try {
    return await submitAuditFn({ data: payload });
  } catch (serverFnError) {
    console.warn(
      "Serverseitiges Speichern fehlgeschlagen, versuche direkte Übermittlung.",
      serverFnError,
    );

    const fallbackId = crypto.randomUUID();
    const { error } = await supabase.from("audit_submissions").insert({
      id: fallbackId,
      name: payload.name.trim(),
      company: payload.company.trim() || null,
      industry: payload.industry.trim() || null,
      stage: payload.stage || null,
      answers: payload.answers as unknown as Json,
      challenges: payload.challenges,
      open_answer: payload.openAnswer.trim() || null,
      module_stats: payload.moduleStats as unknown as Json,
      answered_count: payload.answeredCount,
      total_questions: payload.totalQuestions,
    });

    if (error) throw error;
    return { id: fallbackId };
  }
}

export async function listSubmissions(): Promise<SubmissionRow[]> {
  const { data, error } = await supabase
    .from("audit_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SubmissionRow[];
}

export async function getSubmission(id: string): Promise<SubmissionRow | null> {
  const { data, error } = await supabase
    .from("audit_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as SubmissionRow) ?? null;
}

export async function currentUserIsAdmin(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (error) return false;
  return !!data;
}
