
CREATE POLICY "Admins can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete order items"
ON public.order_items
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM orders o
  WHERE o.id = order_items.order_id
  AND has_role(auth.uid(), 'admin'::app_role)
));
