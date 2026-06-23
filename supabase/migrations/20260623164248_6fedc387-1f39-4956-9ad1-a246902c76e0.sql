GRANT INSERT ON public.audit_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.audit_submissions TO authenticated;
GRANT ALL ON public.audit_submissions TO service_role;