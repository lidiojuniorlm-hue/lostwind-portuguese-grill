import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { GestaoSidebar } from "./GestaoSidebar";
import logo from "@/assets/logo-lostwind.jpeg";
import { ROLE_LABELS } from "@/types/warehouse";

export default function GestaoLayout() {
  const { user } = useAuth();

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
                <p className="text-[10px] text-muted-foreground">{user.name} · {ROLE_LABELS[user.role]}{user.store ? ` · ${user.store}` : ""}</p>
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
