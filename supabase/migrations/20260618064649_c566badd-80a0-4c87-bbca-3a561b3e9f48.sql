
-- Tighten INSERT policy with minimal check
DROP POLICY "Anyone can submit an audit" ON public.audit_submissions;
CREATE POLICY "Anyone can submit an audit"
  ON public.audit_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (length(btrim(name)) > 0 AND total_questions > 0);

-- Restrict has_role execution to authenticated users only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
