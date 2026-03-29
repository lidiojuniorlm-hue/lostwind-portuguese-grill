import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import logo from "@/assets/logo-lostwind.jpeg";
import { Flame, Mail, Lock, User, Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/gestao", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    const { error, needsConfirmation } = await register(email, password, fullName);
    setIsLoading(false);

    if (error) {
      toast.error(error);
    } else if (needsConfirmation) {
      setShowConfirmation(true);
    } else {
      toast.success("Conta criada com sucesso!");
      navigate("/gestao");
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-card border border-border rounded-xl p-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-heading text-foreground">Verifica o teu e-mail</h2>
            <p className="text-sm text-muted-foreground">
              Enviámos um link de confirmação para <strong className="text-foreground">{email}</strong>.
              Verifica a tua caixa de entrada (e a pasta de spam) para ativar a conta.
            </p>
            <Link to="/gestao/login">
              <Button variant="outline" className="w-full mt-4">
                Voltar ao Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Lost Wind"
            className="h-20 w-20 rounded-full mx-auto mb-4 border-2 border-primary/30"
          />
          <h1 className="text-2xl font-heading text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Regista-te no sistema de gestão</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Nome completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="O teu nome"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="email@lostwind.pt"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="pl-10"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-flame text-primary-foreground" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Flame className="w-4 h-4 mr-2" />
            )}
            Criar Conta
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Já tens conta?{" "}
          <Link to="/gestao/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
