import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assets/logo-lostwind.jpeg";
import { Flame } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/gestao", { replace: true });
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      toast.success("Sessão iniciada!");
      navigate("/gestao");
    } else {
      toast.error("Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="Lost Wind" className="h-20 w-20 rounded-full mx-auto mb-4 border-2 border-primary/30" />
          <h1 className="text-2xl font-heading text-foreground">Gestão Lost Wind</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesso ao sistema de gestão</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@lostwind.pt" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Password</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••" />
          </div>
          <Button type="submit" className="w-full bg-gradient-flame text-primary-foreground">
            <Flame className="w-4 h-4 mr-2" /> Entrar
          </Button>
        </form>
        <p className="text-[11px] text-muted-foreground/50 text-center mt-4">
          Demo: admin@lostwind.pt / admin123
        </p>
      </div>
    </div>
  );
}
