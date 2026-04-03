import { LayoutDashboard, ShoppingCart, ClipboardList, Package, Users, LogOut, BarChart3, Warehouse, Euro, Truck, Settings, Clock, ShieldCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-gestao-red.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrders } from "@/hooks/useSupabaseData";

const ROLE_LABELS: Record<string, string> = {
  funcionario: "Funcionário",
  armazem: "Armazém",
  admin: "Administrador",
};

export function GestaoSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { data: orders = [] } = useOrders(user?.role, user?.id, user?.store);

  if (!user) return null;

  const myOrders = user.role === "funcionario"
    ? orders.filter((o: any) => o.created_by === user.id)
    : orders;

  const pendingCount = myOrders.filter((o: any) => o.status === "pendente").length;
  const preparingCount = myOrders.filter((o: any) => o.status === "em_preparacao").length;
  const readyCount = myOrders.filter((o: any) => o.status === "pronto").length;
  const badgeCount = pendingCount + preparingCount + readyCount;

  const mainNav = [
    { title: "Painel", url: "/gestao", icon: LayoutDashboard, roles: ["admin", "armazem", "funcionario"], badge: null as number | null },
    { title: "Novo Pedido", url: "/gestao/novo-pedido", icon: ShoppingCart, roles: ["funcionario"], badge: null },
    { title: "Pedidos", url: "/gestao/pedidos", icon: ClipboardList, roles: ["admin", "armazem", "funcionario"], badge: badgeCount || null },
    { title: "Atividade", url: "/gestao/atividade", icon: Clock, roles: ["admin", "armazem"], badge: null },
  ].filter((item) => item.roles.includes(user.role));

  const managementNav = [
    { title: "Inventário", url: "/gestao/inventario", icon: Warehouse, roles: ["admin", "armazem"] },
    { title: "Relatórios", url: "/gestao/relatorios", icon: BarChart3, roles: ["admin", "armazem"] },
    { title: "Financeiro", url: "/gestao/financeiro", icon: Euro, roles: ["admin"] },
    { title: "Fornecedores", url: "/gestao/fornecedores", icon: Truck, roles: ["admin"] },
  ].filter((item) => item.roles.includes(user.role));

  const adminNav = [
    { title: "Produtos", url: "/gestao/produtos", icon: Package, roles: ["admin"] },
    { title: "Utilizadores", url: "/gestao/utilizadores", icon: Users, roles: ["admin"] },
    { title: "Configurações", url: "/gestao/configuracoes", icon: Settings, roles: ["admin"] },
  ].filter((item) => item.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    navigate("/gestao/login");
  };

  const renderNavGroup = (label: string, items: Array<{ title: string; url: string; icon: any; roles?: string[]; badge?: number | null }>) => {
    if (items.length === 0) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end={item.url === "/gestao"}
                    className="hover:bg-muted/50"
                    activeClassName="bg-primary/10 text-primary font-medium"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {!collapsed && (
                      <span className="flex-1 flex items-center justify-between">
                        <span>{item.title}</span>
                        {"badge" in item && item.badge && (
                          <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <img src={logo} alt="Lost Wind" className="h-7 w-7 rounded-full border border-border" />
              {!collapsed && <span className="font-heading text-sm tracking-wide">Lost Wind</span>}
            </div>
          </SidebarGroupLabel>
        </SidebarGroup>

        {renderNavGroup("Operações", mainNav)}
        {renderNavGroup("Gestão", managementNav)}
        {renderNavGroup("Administração", adminNav)}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <div className="px-3 pb-2">
            <p className="text-xs text-muted-foreground truncate font-normal">{user.name}</p>
            <p className="text-[10px] text-muted-foreground/60 font-normal">{ROLE_LABELS[user.role] || user.role}{user.store ? ` · ${user.store}` : ""}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
