import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// ─── Products ───
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data as Tables<"products">[];
    },
  });
}

// ─── Inventory ───
export function useInventory() {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Tables<"inventory">[];
    },
  });
}

export function useInventoryMutations() {
  const qc = useQueryClient();
  const upsertInventory = useMutation({
    mutationFn: async (item: { product_id: string; store_name: string; current_stock: number; min_stock: number; max_stock: number }) => {
      const { error } = await supabase
        .from("inventory")
        .upsert({
          product_id: item.product_id,
          store_name: item.store_name,
          current_stock: item.current_stock,
          min_stock: item.min_stock,
          max_stock: item.max_stock,
          updated_at: new Date().toISOString(),
        }, { onConflict: "product_id,store_name" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
  return { upsertInventory };
}

export function useProductMutations() {
  const qc = useQueryClient();
  const addProduct = useMutation({
    mutationFn: async (p: TablesInsert<"products">) => {
      const { error } = await supabase.from("products").insert(p);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
  const updateProduct = useMutation({
    mutationFn: async ({ id, ...p }: { id: string } & Partial<TablesInsert<"products">>) => {
      const { error } = await supabase.from("products").update(p).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").update({ active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
  return { addProduct, updateProduct, deleteProduct };
}

// ─── Orders ───
export function useOrders(userRole?: string, userId?: string, userStore?: string | null) {
  return useQuery({
    queryKey: ["orders", userRole, userId],
    queryFn: async () => {
      const { data: ordersData, error: ordersErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (ordersErr) throw ordersErr;

      const orderIds = (ordersData || []).map((o) => o.id);
      if (orderIds.length === 0) return [];

      const { data: itemsData, error: itemsErr } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      if (itemsErr) throw itemsErr;

      const itemsByOrder: Record<string, Tables<"order_items">[]> = {};
      (itemsData || []).forEach((item) => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      });

      return (ordersData || []).map((o) => ({
        ...o,
        items: itemsByOrder[o.id] || [],
      }));
    },
    enabled: !!userId,
  });
}

export function useOrderMutations() {
  const qc = useQueryClient();

  const createOrder = useMutation({
    mutationFn: async ({
      order,
      items,
    }: {
      order: TablesInsert<"orders">;
      items: Omit<TablesInsert<"order_items">, "order_id">[];
    }) => {
      const { data: newOrder, error: orderErr } = await supabase
        .from("orders")
        .insert(order)
        .select()
        .single();
      if (orderErr) throw orderErr;

      const orderItems = items.map((item) => ({
        ...item,
        order_id: newOrder.id,
      }));
      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsErr) throw itemsErr;

      return newOrder;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: status as any, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  const updateOrderItems = useMutation({
    mutationFn: async ({
      items,
    }: {
      items: { id: string; actual_qty?: number; actual_price?: number; actual_vat?: number }[];
    }) => {
      for (const item of items) {
        const { id, ...updates } = item;
        const { error } = await supabase
          .from("order_items")
          .update(updates)
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  return { createOrder, updateOrderStatus, updateOrderItems };
}

// ─── Suppliers ───
export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Tables<"suppliers">[];
    },
  });
}

export function useSupplierMutations() {
  const qc = useQueryClient();
  const addSupplier = useMutation({
    mutationFn: async (s: TablesInsert<"suppliers">) => {
      const { error } = await supabase.from("suppliers").insert(s);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...s }: { id: string } & Partial<TablesInsert<"suppliers">>) => {
      const { error } = await supabase.from("suppliers").update(s).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
  return { addSupplier, updateSupplier, deleteSupplier };
}

// ─── Stores ───
export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data as Tables<"stores">[];
    },
  });
}

// ─── Settings ───
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*");
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((s) => {
        map[s.key] = s.value;
      });
      return map;
    },
  });
}

export function useSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

// ─── Activity Log ───
export function useActivityLog() {
  return useQuery({
    queryKey: ["activity_log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Tables<"activity_log">[];
    },
  });
}

export function useLogActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: TablesInsert<"activity_log">) => {
      const { error } = await supabase.from("activity_log").insert(entry);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity_log"] }),
  });
}

// ─── Users (via edge function) ───
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "list" },
      });
      if (error) throw error;
      return data.users as {
        id: string;
        email: string;
        name: string;
        role: string;
        store: string | null;
        created_at: string;
      }[];
    },
  });
}
