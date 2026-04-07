
-- ============================================
-- FIX 1: user_roles - prevent privilege escalation
-- ============================================

-- Drop the overly permissive ALL policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Admins can SELECT all roles
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can INSERT roles
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can UPDATE roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can DELETE roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- FIX 2: profiles - prevent role field tampering
-- ============================================

-- Drop the old permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users can update own profile but NOT the role field
-- We use a trigger to enforce this since RLS can't restrict columns
CREATE POLICY "Users can update own profile safe"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a trigger that prevents non-admins from changing the role column
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role is being changed, only admins can do it
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      NEW.role := OLD.role; -- silently revert the change
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role_trigger ON public.profiles;
CREATE TRIGGER protect_profile_role_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();
