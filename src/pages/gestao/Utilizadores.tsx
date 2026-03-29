import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppUser, UserRole, ROLE_LABELS } from "@/types/warehouse";
import { STORES } from "@/data/warehouse-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check, User } from "lucide-react";
import { toast } from "sonner";

export default function Utilizadores() {
  const { user, users, addUser, updateUser, deleteUser } = useAuth();
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [isNew, setIsNew] = useState(false);

  if (!user || user.role !== "admin") return null;

  const startNew = () => {
    setEditing({ id: `u-${Date.now()}`, name: "", email: "", password: "", role: "funcionario", store: STORES[0] });
    setIsNew(true);
  };

  const startEdit = (u: AppUser) => { setEditing({ ...u }); setIsNew(false); };

  const save = () => {
    if (!editing || !editing.name.trim() || !editing.email.trim()) {
      toast.error("Nome e email são obrigatórios");
      return;
    }
    if (isNew && !editing.password) { toast.error("Password é obrigatória"); return; }
    if (isNew) addUser(editing);
    else updateUser(editing);
    toast.success(isNew ? "Utilizador criado!" : "Utilizador atualizado!");
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (id === user.id) { toast.error("Não pode remover a si próprio"); return; }
    deleteUser(id);
    toast.success("Utilizador removido");
  };

  const roleGroups = (["admin", "armazem", "funcionario"] as UserRole[]).map((role) => ({
    role,
    label: ROLE_LABELS[role],
    users: users.filter((u) => u.role === role),
  }));

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

      {/* Edit form */}
      {editing && (
        <Card className="bg-card border-primary/30">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-heading text-foreground text-sm">{isNew ? "Novo Utilizador" : "Editar Utilizador"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <Input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Password{!isNew && " (deixar vazio para manter)"}</label>
                <Input
                  type="password"
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  className="text-sm"
                  placeholder={isNew ? "" : "••••••"}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Papel</label>
                <select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as UserRole })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="armazem">Armazém</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {editing.role === "funcionario" && (
                <div>
                  <label className="text-xs text-muted-foreground">Loja</label>
                  <select
                    value={editing.store || ""}
                    onChange={(e) => setEditing({ ...editing, store: e.target.value })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
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

      {/* User list by role */}
      {roleGroups.map((group) => (
        <div key={group.role}>
          <h3 className="text-sm font-heading text-primary mb-2">{group.label} ({group.users.length})</h3>
          <div className="space-y-2">
            {group.users.map((u) => (
              <div
                key={u.id}
                className="bg-card border border-border rounded-lg p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email}{u.store ? ` · ${u.store}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(u)} className="h-8 w-8">
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(u.id)} className="h-8 w-8 text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
