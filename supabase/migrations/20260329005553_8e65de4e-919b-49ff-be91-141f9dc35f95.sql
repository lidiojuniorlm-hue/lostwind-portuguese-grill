
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'armazem', 'funcionario');

-- Enum for order status
CREATE TYPE public.order_status AS ENUM ('pendente', 'em_preparacao', 'pronto', 'entregue', 'cancelado');

-- Enum for product sections
CREATE TYPE public.product_section AS ENUM ('Carnes', 'Secos e Molhados', 'Peixes', 'Embalagens', 'Bebidas');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'funcionario',
  store TEXT,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Function to get user store
CREATE OR REPLACE FUNCTION public.get_user_store(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT store FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS for user_roles: admins can do everything, users can read own
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  section product_section NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_rate INTEGER NOT NULL DEFAULT 23,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read products
CREATE POLICY "Authenticated users can read products" ON public.products
  FOR SELECT TO authenticated USING (true);

-- Only admins/armazem can manage products
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL,
  status order_status NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admins/armazem see all orders; funcionarios see only their store's orders
CREATE POLICY "Admins and armazem see all orders" ON public.orders
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem')
  );

CREATE POLICY "Funcionarios see own store orders" ON public.orders
  FOR SELECT TO authenticated
  USING (store_name = public.get_user_store(auth.uid()));

CREATE POLICY "Funcionarios can create orders for own store" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    store_name = public.get_user_store(auth.uid()) AND created_by = auth.uid()
  );

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_name TEXT NOT NULL,
  section product_section NOT NULL,
  unit TEXT NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  vat_rate INTEGER NOT NULL DEFAULT 23,
  actual_qty NUMERIC(10,2),
  actual_price NUMERIC(10,2),
  actual_vat INTEGER
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Same access as orders
CREATE POLICY "Order items follow order access" ON public.order_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id
      AND (
        public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'armazem')
        OR o.store_name = public.get_user_store(auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id
      AND (
        public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'armazem')
        OR (o.store_name = public.get_user_store(auth.uid()) AND o.created_by = auth.uid())
      )
    )
  );

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  nif TEXT,
  category TEXT NOT NULL DEFAULT 'Outros',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read suppliers" ON public.suppliers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage suppliers" ON public.suppliers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem'));

-- App settings table (key-value store)
CREATE TABLE public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage settings" ON public.app_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Activity log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all activity" ON public.activity_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem'));

CREATE POLICY "Authenticated users can insert activity" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Inventory table (stock levels per store)
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT NOT NULL,
  current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, store_name)
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read inventory" ON public.inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and armazem can manage inventory" ON public.inventory
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'armazem'));

-- Stores table
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read stores" ON public.stores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage stores" ON public.stores
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
