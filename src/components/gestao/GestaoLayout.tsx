import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GestaoSidebar } from "./GestaoSidebar";
import logo from "@/assets/logo-lostwind.jpeg";
import { Loader2 } from "lucide-react";

export default function GestaoLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/gestao/login" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <GestaoSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <img src={logo} alt="Lost Wind" className="h-8 w-8 rounded-full border border-border" />
              <div>
                <h1 className="text-sm font-heading text-foreground leading-tight">Lost Wind — Gestão</h1>
                <p className="text-[10px] text-muted-foreground">
                  {profile?.full_name || user.email}
                </p>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground hidden md:block">
              {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
