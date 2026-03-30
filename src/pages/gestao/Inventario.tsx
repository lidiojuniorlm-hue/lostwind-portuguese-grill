import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts, useOrders, useProductMutations } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SECTIONS } from "@/types/warehouse";
import { Package, AlertTriangle, CheckCircle, Search, Save, X, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function Inventario() {
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders(user?.role, user?.id, user?.store);
  const { data: inventoryData = [] } = useInventory();
  const { updateProduct } = useProductMutations();
  const { upsertInventory } = useInventoryMutations();
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState<string>("todas");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ stock: number; section: string; unit: string }>({ stock: 0, section: "", unit: "" });

  const stockData = useMemo(() => {
    const invMap: Record<string, number> = {};
    inventoryData.forEach((inv: any) => {
      if (inv.store_name === "Armazém") invMap[inv.product_id] = Number(inv.current_stock);
    });

    return products.map((p: any) => {
      const currentStock = invMap[p.id] ?? 0;
      const pending = orders
        .filter((o: any) => ["pendente", "em_preparacao", "pronto"].includes(o.status))
        .reduce((sum: number, o: any) => sum + (o.items || []).filter((i: any) => i.product_id === p.id).reduce((s: number, i: any) => s + Number(i.qty), 0), 0);
      const delivered = orders
        .filter((o: any) => o.status === "entregue")
        .reduce((sum: number, o: any) => sum + (o.items || []).filter((i: any) => i.product_id === p.id).reduce((s: number, i: any) => s + Number(i.qty), 0), 0);
      const totalOut = pending + delivered;
      const status: "ok" | "low" | "critical" = currentStock <= 10 ? "critical" : currentStock <= 30 ? "low" : "ok";
      return { ...p, currentStock, totalOut, delivered, pending, status };
    }).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [products, orders, inventoryData]);

  const filtered = stockData.filter((p: any) =>
    (filterSection === "todas" || p.section === filterSection) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = stockData.filter((p: any) => p.status === "critical").length;
  const lowCount = stockData.filter((p: any) => p.status === "low").length;
  const totalMovements = stockData.reduce((s: number, p: any) => s + p.totalOut, 0);

  const canEdit = user?.role === "admin" || user?.role === "armazem";

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditValues({ stock: p.currentStock, section: p.section, unit: p.unit });
  };

  const saveEdit = async (id: string) => {
    try {
      await updateProduct.mutateAsync({
        id,
        section: editValues.section as any,
        unit: editValues.unit,
      });
      await upsertInventory.mutateAsync({
        product_id: id,
        store_name: "Armazém",
        current_stock: editValues.stock,
        min_stock: 10,
        max_stock: 100,
      });
      setEditingId(null);
      toast.success("Produto e stock atualizados!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground">Inventário & Stock</h2>
        <p className="text-sm text-muted-foreground">Controlo de stock e movimentações de produtos</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Produtos</span></div><p className="text-xl font-heading text-foreground">{products.length}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-xs text-muted-foreground">Total Movimentado</span></div><p className="text-xl font-heading text-foreground">{totalMovements}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-xs text-muted-foreground">Stock Baixo</span></div><p className="text-xl font-heading text-foreground">{lowCount}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-destructive" /><span className="text-xs text-muted-foreground">Stock Crítico</span></div><p className="text-xl font-heading text-foreground">{criticalCount}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Pesquisar produto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
        <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground">
          <option value="todas">Todas as secções</option>
          {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Card className="bg-card border-border"><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-3 px-4">Produto</th><th className="text-left py-3 px-4">Secção</th><th className="text-center py-3 px-4">Unidade</th><th className="text-center py-3 px-4">Stock</th><th className="text-center py-3 px-4">Pendente</th><th className="text-center py-3 px-4">Entregue</th><th className="text-center py-3 px-4">Total Saídas</th><th className="text-center py-3 px-4">Estado</th>
            {canEdit && <th className="text-center py-3 px-4">Ações</th>}
          </tr></thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-3 px-4 text-foreground font-medium">{p.name}</td>
                <td className="py-3 px-4 text-muted-foreground">
                  {editingId === p.id ? (
                    <select value={editValues.section} onChange={e => setEditValues(v => ({ ...v, section: e.target.value }))} className="text-xs px-2 py-1 rounded border border-border bg-background text-foreground w-full">
                      {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : p.section}
                </td>
                <td className="py-3 px-4 text-center text-muted-foreground">
                  {editingId === p.id ? (
                    <Input value={editValues.unit} onChange={e => setEditValues(v => ({ ...v, unit: e.target.value }))} className="w-16 h-7 text-xs text-center mx-auto" />
                  ) : p.unit}
                </td>
                <td className="py-3 px-4 text-center text-foreground font-medium">{p.estimatedStock}</td>
                <td className="py-3 px-4 text-center text-yellow-400">{p.pending || "-"}</td>
                <td className="py-3 px-4 text-center text-green-400">{p.delivered || "-"}</td>
                <td className="py-3 px-4 text-center text-foreground">{p.totalOut}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === "critical" ? "bg-destructive/20 text-destructive" : p.status === "low" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                    {p.status === "critical" ? "Crítico" : p.status === "low" ? "Baixo" : "OK"}
                  </span>
                </td>
                {canEdit && (
                  <td className="py-3 px-4 text-center">
                    {editingId === p.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => saveEdit(p.id)} className="h-7 w-7 p-0"><Save className="w-3 h-3 text-green-500" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 p-0"><X className="w-3 h-3 text-destructive" /></Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => startEdit(p)} className="h-7 w-7 p-0"><Pencil className="w-3 h-3 text-muted-foreground" /></Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div></CardContent></Card>
    </div>
  );
}
