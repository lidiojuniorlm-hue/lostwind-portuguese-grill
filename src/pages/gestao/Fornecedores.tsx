import { useState } from "react";
import { useSuppliers, useSupplierMutations } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Carnes", "Peixes", "Bebidas", "Secos e Molhados", "Embalagens", "Outros"];

export default function Fornecedores() {
  const { data: suppliers = [] } = useSuppliers();
  const { addSupplier, updateSupplier, deleteSupplier } = useSupplierMutations();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", contact: "", email: "", phone: "", address: "", nif: "", category: "Outros", notes: "" });
  const [search, setSearch] = useState("");

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      if (editingId) {
        await updateSupplier.mutateAsync({ id: editingId, ...form });
      } else {
        await addSupplier.mutateAsync(form);
      }
      toast.success(editingId ? "Fornecedor atualizado!" : "Fornecedor adicionado!");
      setForm({ name: "", contact: "", email: "", phone: "", address: "", nif: "", category: "Outros", notes: "" });
      setEditingId(null);
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setForm({ name: s.name, contact: s.contact || "", email: s.email || "", phone: s.phone || "", address: s.address || "", nif: s.nif || "", category: s.category, notes: s.notes || "" });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover fornecedor?")) {
      await deleteSupplier.mutateAsync(id);
      toast.success("Fornecedor removido");
    }
  };

  const filtered = suppliers.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Fornecedores</h2>
          <p className="text-sm text-muted-foreground">Gestão de fornecedores e contactos</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); setForm({ name: "", contact: "", email: "", phone: "", address: "", nif: "", category: "Outros", notes: "" }); } }}>
          <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Novo Fornecedor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>NIF</Label><Input value={form.nif} onChange={e => setForm(f => ({ ...f, nif: e.target.value }))} /></div>
                <div><Label>Categoria</Label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full text-sm px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>Pessoa de Contacto</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div><Label>Morada</Label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div><Label>Notas</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button onClick={handleSave} className="w-full">{editingId ? "Guardar" : "Adicionar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Pesquisar fornecedores..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s: any) => (
          <Card key={s.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-heading">{s.name}</CardTitle>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s.category}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(s)}><Pencil className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              {s.nif && <p>NIF: {s.nif}</p>}
              {s.contact && <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.contact}</p>}
              {s.phone && <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</p>}
              {s.email && <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</p>}
              {s.address && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.address}</p>}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-8">Nenhum fornecedor registado</p>}
      </div>
    </div>
  );
}
