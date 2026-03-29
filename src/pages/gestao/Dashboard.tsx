import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, User, Mail } from "lucide-react";

export default function Dashboard() {
  const { user, profile } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground tracking-wide">
          Olá, {profile?.full_name || "Utilizador"} 👋
        </h2>
        <p className="text-sm text-muted-foreground font-normal">
          Bem-vindo ao painel de gestão Lost Wind
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome</span>
              <span className="text-foreground">{profile?.full_name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{user.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email verificado</span>
              <span className="text-foreground">
                {user.email_confirmed_at ? "✅ Sim" : "⏳ Pendente"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desde</span>
              <span className="text-foreground">
                {new Date(user.created_at).toLocaleDateString("pt-PT")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-primary" /> Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>O sistema de gestão está a ser migrado para Supabase. Em breve terás acesso a pedidos, inventário e mais.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
