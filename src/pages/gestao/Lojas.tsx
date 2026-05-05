import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStores, useStoreMutations } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Save, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface StoreEdit { address: string; phone: string; }

export default function Lojas() {
  const { user } = useAuth();
  const { data: stores = [], isLoading } = useStores();
  const { updateStore, addStore } = useStoreMutations();
  const [edits, setEdits] = useState<Record<string, StoreEdit>>({});
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const init: Record<string, StoreEdit> = {};
    stores.forEach((s: any) => { init[s.id] = { address: s.address || "", phone: s.phone || "" }; });
    setEdits(init);
  }, [stores]);

  if (!user || user.role !== "admin") return null;

  const handleSave = async (id: string) => {
    const e = edits[id];
    await updateStore.mutateAsync({ id, address: e.address, phone: e.phone });
    toast.success("Loja atualizada");
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addStore.mutateAsync({ name: newName.trim() });
    setNewName("");
    toast.success("Loja adicionada");
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground tracking-wide">Lojas</h2>
        <p className="text-sm text-muted-foreground font-normal">Gere o endereço e contacto de cada loja. Estes dados são usados como destino na Guia de Transporte.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Nova Loja</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da loja" className="text-sm" />
          <Button size="sm" onClick={handleAdd} disabled={!newName.trim() || addStore.isPending}>Adicionar</Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {stores.map((s: any) => {
          const e = edits[s.id] || { address: "", phone: "" };
          return (
            <Card key={s.id} className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2"><Store className="w-4 h-4 text-primary" /> {s.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Endereço</Label>
                  <Input value={e.address} onChange={ev => setEdits(prev => ({ ...prev, [s.id]: { ...e, address: ev.target.value } }))} placeholder="Ex: Rua X, nº 10, 2600-000 Localidade" className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Telefone</Label>
                  <Input value={e.phone} onChange={ev => setEdits(prev => ({ ...prev, [s.id]: { ...e, phone: ev.target.value } }))} placeholder="Ex: 263 000 000" className="text-sm" />
                </div>
                <Button size="sm" onClick={() => handleSave(s.id)} disabled={updateStore.isPending}>
                  <Save className="w-4 h-4 mr-1" /> Guardar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}