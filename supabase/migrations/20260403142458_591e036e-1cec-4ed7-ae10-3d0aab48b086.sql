
-- Product expiry control table
CREATE TABLE public.product_expiry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'Outros',
  production_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_expiry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and armazem can manage expiry"
ON public.product_expiry
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'armazem'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'armazem'::app_role));

CREATE POLICY "Authenticated users can read expiry"
ON public.product_expiry
FOR SELECT
TO authenticated
USING (true);

-- Add new stores
INSERT INTO public.stores (name) VALUES ('Povos - VFX'), ('Win Burguer');
