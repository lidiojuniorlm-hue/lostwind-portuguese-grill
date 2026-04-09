
-- FIX 1: Prevent users from changing their own role in profiles table
-- Tighten the UPDATE policy to ensure role cannot be changed by non-admins
DROP POLICY IF EXISTS "Users can update own profile safe" ON public.profiles;

CREATE POLICY "Users can update own profile safe"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (
    role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- FIX 2: Enforce user_name integrity on activity_log via trigger
-- Auto-populate user_name from profiles table, ignoring client-supplied value
CREATE OR REPLACE FUNCTION public.enforce_activity_log_user_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always derive user_name from the authenticated user's profile
  SELECT full_name INTO NEW.user_name
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Ensure user_id is always the authenticated user
  NEW.user_id := auth.uid();
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_activity_log_user_name_trigger ON public.activity_log;
CREATE TRIGGER enforce_activity_log_user_name_trigger
BEFORE INSERT ON public.activity_log
FOR EACH ROW
EXECUTE FUNCTION public.enforce_activity_log_user_name();
