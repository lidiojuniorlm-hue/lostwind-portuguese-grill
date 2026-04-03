import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProductExpiry, useProductExpiryMutations } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SECTIONS } from "@/types/warehouse";
import { AlertTriangle, Plus, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Validades() {
  const { user } = useAuth();
  const { data: items = [] } = useProductExpiry();
  const { addExpiry, deleteExpiry } = useProductExpiryMutations();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    product_name: "",
    section: "Carnes" as string,
    production_date: "",
    expiry_date: "",
    quantity: "",
    unit: "un",
    notes: "",
  });

  const canManage = user?.role === "admin" || user?.role === "armazem";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: any, b: any) =>
      new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    );
  }, [items]);

  const getStatus = (expiryDate: string) => {
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: "Vencido", color: "text-destructive bg-destructive/10", icon: XCircle, days: diff };
    if (diff <= 3) return { label: `Vence em ${diff}d`, color: "text-red-500 bg-red-500/10", icon: AlertTriangle, days: diff };
    if (diff <= 7) return { label: `Vence em ${diff}d`, color: "text-yellow-500 bg-yellow-500/10", icon: AlertTriangle, days: diff };
    return { label: `${diff} dias`, color: "text-green-500 bg-green-500/10", icon: CheckCircle, days: diff };
  };

  const expiringSoon = sortedItems.filter((i: any) => {
    const diff = Math.ceil((new Date(i.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 3 && diff >= 0;
  });

  const expired = sortedItems.filter((i: any) => new Date(i.expiry_date) < today);

  const handleSubmit = async () => {
    if (!form.product_name || !form.production_date || !form.expiry_date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    await addExpiry.mutateAsync({
      product_name: form.product_name,
      section: form.section,
      production_date: form.production_date,
      expiry_date: form.expiry_date,
      quantity: parseFloat(form.quantity) || 0,
      unit: form.unit,
      notes: form.notes || null,
      created_by: user!.id,
    });
    toast.success("Produto registado com sucesso");
    setForm({ product_name: "", section: "Carnes", production_date: "", expiry_date: "", quantity: "", unit: "un", notes: "" });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteExpiry.mutateAsync(id);
    toast.success("Registo removido");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Controlo de Validades</h2>
          <p className="text-sm text-muted-foreground">Gestão de prazos de validade — prioridade: mais antigo primeiro</p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" /> Registar Produto
          </Button>
        )}
      </div>

      {/* Alerts */}
      {(expiringSoon.length > 0 || expired.length > 0) && (
        <div className="space-y-2">
          {expired.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <XCircle className="w-5 h-5 text-destructive shrink-0" />
              <span className="text-sm text-destructive font-medium">
                {expired.length} produto{expired.length > 1 ? "s" : ""} com validade expirada!
              </span>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <span className="text-sm text-yellow-600 font-medium">
                {expiringSoon.length} produto{expiringSoon.length > 1 ? "s" : ""} a vencer nos próximos 3 dias!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      {showForm && canManage && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading">Novo Registo de Validade</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Produto *</label>
                <Input value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} placeholder="Nome do produto" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Secção</label>
                <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} className="w-full h-9 text-sm rounded-md border border-input bg-background px-3">
                  {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantidade</label>
                <div className="flex gap-2">
                  <Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="0" className="h-9 text-sm flex-1" />
                  <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="h-9 text-sm rounded-md border border-input bg-background px-2 w-20">
                    <option value="un">un</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="cx">cx</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Data de Produção *</label>
                <Input type="date" value={form.production_date} onChange={e => setForm(f => ({ ...f, production_date: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Data de Validade *</label>
                <Input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notas</label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observações" className="h-9 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmit} disabled={addExpiry.isPending}>Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Total Registos</span></div>
          <p className="text-xl font-heading text-foreground">{sortedItems.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><XCircle className="w-4 h-4 text-destructive" /><span className="text-xs text-muted-foreground">Vencidos</span></div>
          <p className="text-xl font-heading text-destructive">{expired.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-yellow-500" /><span className="text-xs text-muted-foreground">A Vencer (3 dias)</span></div>
          <p className="text-xl font-heading text-yellow-500">{expiringSoon.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-xs text-muted-foreground">Dentro do Prazo</span></div>
          <p className="text-xl font-heading text-green-500">{sortedItems.length - expired.length - expiringSoon.length}</p>
        </CardContent></Card>
      </div>

      {/* List */}
      {sortedItems.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Nenhum produto registado no controlo de validades</p>
      ) : (
        <div className="space-y-2">
          {sortedItems.map((item: any) => {
            const status = getStatus(item.expiry_date);
            const StatusIcon = status.icon;
            return (
              <Card key={item.id} className="bg-card border-border">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground text-sm">{item.product_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.section}</span>
                      {item.quantity > 0 && <span className="text-xs text-muted-foreground">{Number(item.quantity)} {item.unit}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>Produção: {new Date(item.production_date).toLocaleDateString("pt-PT")}</span>
                      <span>Validade: {new Date(item.expiry_date).toLocaleDateString("pt-PT")}</span>
                      {item.notes && <span className="italic">— {item.notes}</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${status.color}`}>
                    {status.label}
                  </span>
                  {canManage && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="text-destructive hover:bg-destructive/10 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
