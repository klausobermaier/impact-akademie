
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Submissions table
CREATE TABLE public.audit_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  company text,
  industry text,
  stage text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  challenges integer[] NOT NULL DEFAULT '{}',
  open_answer text,
  module_stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  answered_count integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0
);

GRANT INSERT ON public.audit_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.audit_submissions TO authenticated;
GRANT ALL ON public.audit_submissions TO service_role;

ALTER TABLE public.audit_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an audit"
  ON public.audit_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read submissions"
  ON public.audit_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
  ON public.audit_submissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
  ON public.audit_submissions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX audit_submissions_created_at_idx ON public.audit_submissions (created_at DESC);
