import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SECTIONS, Section, Product, VatRate } from "@/types/warehouse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

export default function Produtos() {
  const { user, products, addProduct, updateProduct, deleteProduct } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("Carnes");
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);

  if (!user || user.role !== "admin") return null;

  const sectionProducts = products.filter((p) => p.section === activeSection);

  const startNew = () => {
    setEditing({ id: `prod-${Date.now()}`, name: "", section: activeSection, unit: "kg", unitPrice: 0, vatRate: 23 });
    setIsNew(true);
  };

  const startEdit = (p: Product) => { setEditing({ ...p }); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.name.trim()) { toast.error("Nome é obrigatório"); return; }
    if (isNew) addProduct(editing);
    else updateProduct(editing);
    toast.success(isNew ? "Produto criado!" : "Produto atualizado!");
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
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
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`text-xs px-3 py-2 rounded-lg border transition-all ${
              activeSection === s ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {s} ({products.filter((p) => p.section === s).length})
          </button>
        ))}
      </div>

      {/* Edit form */}
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
                <select
                  value={editing.section}
                  onChange={(e) => setEditing({ ...editing, section: e.target.value as Section })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Unidade</label>
                <Input value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Preço (€)</label>
                <Input type="number" step="0.01" value={editing.unitPrice} onChange={(e) => setEditing({ ...editing, unitPrice: parseFloat(e.target.value) || 0 })} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">IVA (%)</label>
                <select
                  value={editing.vatRate}
                  onChange={(e) => setEditing({ ...editing, vatRate: parseInt(e.target.value) as VatRate })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value={6}>6%</option>
                  <option value={13}>13%</option>
                  <option value={23}>23%</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }}>
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
              <Button size="sm" onClick={save} className="bg-primary text-primary-foreground">
                <Check className="w-4 h-4 mr-1" /> Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product list */}
      <div className="space-y-2">
        {sectionProducts.map((product) => (
          <div
            key={product.id}
            className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <span className="text-primary font-semibold">€{product.unitPrice.toFixed(2)}/{product.unit}</span>
                <span>IVA {product.vatRate}%</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => startEdit(product)} className="h-8 w-8">
                <Pencil className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
