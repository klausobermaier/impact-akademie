ALTER TABLE public.audit_submissions
  ADD COLUMN IF NOT EXISTS ai_evaluation text,
  ADD COLUMN IF NOT EXISTS ai_evaluation_generated_at timestamptz;