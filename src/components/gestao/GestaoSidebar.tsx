import { LayoutDashboard, LogOut, Settings, Package, ShoppingCart, PlusCircle, BarChart3, Truck, Users, Activity, DollarSign, ClipboardList } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-lostwind.jpeg";
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

export function GestaoSidebar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  if (!user) return null;

  const operacoesNav = [
    { title: "Painel", url: "/gestao", icon: LayoutDashboard },
    { title: "Pedidos", url: "/gestao/pedidos", icon: ShoppingCart },
    { title: "Novo Pedido", url: "/gestao/novo-pedido", icon: PlusCircle },
    { title: "Produtos", url: "/gestao/produtos", icon: Package },
    { title: "Inventário", url: "/gestao/inventario", icon: ClipboardList },
  ];

  const gestaoNav = [
    { title: "Fornecedores", url: "/gestao/fornecedores", icon: Truck },
    { title: "Financeiro", url: "/gestao/financeiro", icon: DollarSign },
    { title: "Relatórios", url: "/gestao/relatorios", icon: BarChart3 },
    { title: "Atividade", url: "/gestao/atividade", icon: Activity },
  ];

  const adminNav = [
    { title: "Utilizadores", url: "/gestao/utilizadores", icon: Users },
    { title: "Configurações", url: "/gestao/configuracoes", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/gestao/login");
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

        {[
          { label: "Operações", items: operacoesNav },
          { label: "Gestão", items: gestaoNav },
          { label: "Administração", items: adminNav },
        ].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/gestao"}
                        className="hover:bg-muted/50"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <div className="px-3 pb-2">
            <p className="text-xs text-muted-foreground truncate font-normal">
              {profile?.full_name || user.email}
            </p>
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
