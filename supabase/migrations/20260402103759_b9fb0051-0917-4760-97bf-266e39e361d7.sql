
-- 1. Fix Role table: Enable RLS and add admin-only policy
ALTER TABLE public."Role" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage roles"
ON public."Role"
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can read roles"
ON public."Role"
FOR SELECT
TO authenticated
USING (true);

-- 2. Fix suppliers: Drop overly permissive read policy, replace with role-restricted one
DROP POLICY IF EXISTS "Authenticated users can read suppliers" ON public.suppliers;

CREATE POLICY "Admin and armazem can read suppliers"
ON public.suppliers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'armazem'::app_role));
