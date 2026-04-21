import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, useStores } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ROLE_LABELS: Record<string, string> = {
  funcionario: "Funcionário",
  armazem: "Armazém",
  admin: "Administrador",
};

interface EditForm {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  store: string;
}

export default function Utilizadores() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: users = [], isLoading } = useUsers(isAdmin);
  const { data: stores = [] } = useStores();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EditForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user || user.role !== "admin") return null;

  const storeNames = stores.map((s: any) => s.name);

  const startNew = () => {
    setEditing({ name: "", email: "", password: "", role: "funcionario", store: storeNames[0] || "" });
    setIsNew(true);
  };

  const startEdit = (u: any) => {
    setEditing({ id: u.id, name: u.name, email: u.email, password: "", role: u.role, store: u.store || "" });
    setIsNew(false);
  };

  const save = async () => {
    if (!editing || !editing.name.trim() || !editing.email.trim()) {
      toast.error("Nome e email são obrigatórios"); return;
    }
    if (isNew && !editing.password) { toast.error("Password é obrigatória"); return; }

    setSaving(true);
    try {
      const action = isNew ? "create" : "update";
      const body: any = {
        action,
        name: editing.name,
        email: editing.email,
        role: editing.role,
        store: editing.role === "funcionario" ? editing.store : null,
      };
      if (isNew) body.password = editing.password;
      else {
        body.userId = editing.id;
        if (editing.password) body.password = editing.password;
      }

      const { data, error } = await supabase.functions.invoke("manage-users", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(isNew ? "Utilizador criado!" : "Utilizador atualizado!");
      setEditing(null);
      setIsNew(false);
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (e: any) {
      toast.error(e.message || "Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === user.id) { toast.error("Não pode remover a si próprio"); return; }
    if (!confirm("Remover utilizador?")) return;
    try {
      const { data, error } = await supabase.functions.invoke("manage-users", {
        body: { action: "delete", userId: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Utilizador removido");
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover");
    }
  };

  const roleGroups = (["admin", "armazem", "funcionario"] as const).map((role) => ({
    role,
    label: ROLE_LABELS[role],
    users: users.filter((u: any) => u.role === role),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Utilizadores</h2>
          <p className="text-sm text-muted-foreground">{users.length} utilizadores no sistema</p>
        </div>
        <Button onClick={startNew} size="sm" className="bg-gradient-flame text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Novo Utilizador
        </Button>
      </div>

      {editing && (
        <Card className="bg-card border-primary/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-heading text-foreground text-sm">{isNew ? "Novo Utilizador" : "Editar Utilizador"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className="text-xs text-muted-foreground">Nome</label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="text-sm" /></div>
              <div><label className="text-xs text-muted-foreground">Email</label><Input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="text-sm" /></div>
              <div><label className="text-xs text-muted-foreground">Password{!isNew && " (deixar vazio para manter)"}</label><Input type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} className="text-sm" placeholder={isNew ? "" : "••••••"} /></div>
              <div><label className="text-xs text-muted-foreground">Papel</label>
                <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="funcionario">Funcionário</option>
                  <option value="armazem">Armazém</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {editing.role === "funcionario" && (
                <div><label className="text-xs text-muted-foreground">Loja</label>
                  <select value={editing.store} onChange={(e) => setEditing({ ...editing, store: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {storeNames.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setIsNew(false); }}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
              <Button size="sm" onClick={save} disabled={saving} className="bg-primary text-primary-foreground">
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Guardar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {roleGroups.map((group) => (
        <div key={group.role}>
          <h3 className="text-sm font-heading text-primary mb-2">{group.label} ({group.users.length})</h3>
          <div className="space-y-2">
            {group.users.map((u: any) => (
              <div key={u.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}{u.store ? ` · ${u.store}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(u)} className="h-8 w-8"><Pencil className="w-3 h-3" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(u.id)} className="h-8 w-8 text-destructive"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
