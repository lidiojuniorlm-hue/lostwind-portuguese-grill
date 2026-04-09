
-- Fix the broken WITH CHECK clause on profiles UPDATE policy
-- The current subquery reads the NEW value (post-update), making the check useless.
-- The protect_profile_role trigger already prevents non-admins from changing role,
-- so we simplify the policy to just verify ownership.
DROP POLICY IF EXISTS "Users can update own profile safe" ON public.profiles;

CREATE POLICY "Users can update own profile safe"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
