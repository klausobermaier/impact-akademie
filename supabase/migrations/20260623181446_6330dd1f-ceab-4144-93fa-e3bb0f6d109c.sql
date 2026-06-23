GRANT INSERT ON public.audit_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_submissions TO authenticated;
GRANT ALL ON public.audit_submissions TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;