import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts, useProductMutations, useInventoryMutations } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { SECTIONS } from "@/types/warehouse";
import type { Section } from "@/types/warehouse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface EditingProduct {
  id?: string;
  name: string;
  section: string;
  unit: string;
  unit_price: number;
  vat_rate: number;
  initial_stock: number;
}

export default function Produtos() {
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const { updateProduct, deleteProduct } = useProductMutations();
  const { upsertInventory } = useInventoryMutations();
  const [activeSection, setActiveSection] = useState<Section>("Carnes");
  const [editing, setEditing] = useState<EditingProduct | null>(null);
  const [isNew, setIsNew] = useState(false);

  if (!user || user.role !== "admin") return null;

  const sectionProducts = products.filter((p) => p.section === activeSection);

  const startNew = () => {
    setEditing({ name: "", section: activeSection, unit: "kg", unit_price: 0, vat_rate: 23, initial_stock: 0 });
    setIsNew(true);
  };

  const startEdit = (p: any) => {
    setEditing({ id: p.id, name: p.name, section: p.section, unit: p.unit, unit_price: Number(p.unit_price), vat_rate: Number(p.vat_rate), initial_stock: 0 });
    setIsNew(false);
  };

  const save = async () => {
    if (!editing || !editing.name.trim()) { toast.error("Nome é obrigatório"); return; }
    try {
      if (isNew) {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert({
            name: editing.name,
            section: editing.section as any,
            unit: editing.unit,
            unit_price: editing.unit_price,
            vat_rate: editing.vat_rate,
          })
          .select()
          .single();
        if (error) throw error;
        if (newProduct && editing.initial_stock > 0) {
          await upsertInventory.mutateAsync({
            product_id: newProduct.id,
            store_name: "Armazém",
            current_stock: editing.initial_stock,
            min_stock: 10,
            max_stock: 100,
          });
        }
      } else {
        await updateProduct.mutateAsync({
          id: editing.id!,
          name: editing.name,
          section: editing.section as any,
          unit: editing.unit,
          unit_price: editing.unit_price,
          vat_rate: editing.vat_rate,
        });
      }
      toast.success(isNew ? "Produto criado!" : "Produto atualizado!");
      setEditing(null);
      setIsNew(false);
    } catch (e: any) {
      toast.error(e.message || "Erro ao guardar");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProduct.mutateAsync(id);
    toast.success("Produto removido");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Produtos</h2>
          <p className="text-sm text-muted-foreground">{products.length} produtos no sistema</p>
        </div>
        <Button onClick={startNew} size="sm" className="bg-gradient-flame text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Novo Produto
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button key={s} onClick={() => setActiveSection(s)} className={`text-xs px-3 py-2 rounded-lg border transition-all ${activeSection === s ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
            {s} ({products.filter((p) => p.section === s).length})
          </button>
        ))}
      </div>

      {editing && (
        <Card className="bg-card border-primary/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-heading text-foreground text-sm">{isNew ? "Novo Produto" : "Editar Produto"}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Secção</label>
                <select value={editing.section} onChange={(e) => setEditing({ ...editing, section: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Unidade</label>
                <Input value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Preço (€)</label>
                <Input type="number" step="0.01" value={editing.unit_price} onChange={(e) => setEditing({ ...editing, unit_price: parseFloat(e.target.value) || 0 })} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">IVA (%)</label>
                <select value={editing.vat_rate} onChange={(e) => setEditing({ ...editing, vat_rate: parseInt(e.target.value) })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value={6}>6%</option>
                  <option value={13}>13%</option>
                  <option value={23}>23%</option>
                </select>
              </div>
              {isNew && (
                <div>
                  <label className="text-xs text-muted-foreground">Stock Inicial</label>
                  <Input type="number" step="0.01" value={editing.initial_stock} onChange={(e) => setEditing({ ...editing, initial_stock: parseFloat(e.target.value) || 0 })} className="text-sm" />
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
              <Button size="sm" onClick={save} className="bg-primary text-primary-foreground"><Check className="w-4 h-4 mr-1" /> Guardar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {sectionProducts.map((product: any) => (
          <div key={product.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <span className="text-primary font-semibold">€{Number(product.unit_price).toFixed(2)}/{product.unit}</span>
                <span>IVA {product.vat_rate}%</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => startEdit(product)} className="h-8 w-8"><Pencil className="w-3 h-3" /></Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-destructive"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
