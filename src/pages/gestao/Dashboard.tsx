import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts, useOrders, useUsers } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ClipboardList, Users, ShoppingCart, TrendingUp, Euro, AlertTriangle, Truck, Clock, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SECTIONS } from "@/types/warehouse";
import { Link } from "react-router-dom";

// Helper: use actual values when available
const getEffectiveTotal = (item: any) => {
  const qty = Number(item.actual_qty ?? item.qty);
  const price = Number(item.actual_price ?? item.unit_price);
  const vatRate = Number(item.actual_vat ?? item.vat_rate);
  return qty * price * (1 + vatRate / 100);
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useOrders(user?.role, user?.id, user?.store);
  const { data: users = [] } = useUsers();
  const [showHistory, setShowHistory] = useState(false);

  const myOrders = useMemo(() => {
    if (!user) return [];
    return user.role === "funcionario"
      ? orders.filter((o: any) => o.created_by === user.id)
      : orders;
  }, [user, orders]);

  const today = new Date().toLocaleDateString("pt-PT");

  const todayOrders = useMemo(() =>
    myOrders.filter((o: any) => new Date(o.created_at).toLocaleDateString("pt-PT") === today)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [myOrders, today]
  );

  const previousOrders = useMemo(() =>
    myOrders.filter((o: any) => new Date(o.created_at).toLocaleDateString("pt-PT") !== today)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20),
    [myOrders, today]
  );

  const pendingOrders = myOrders.filter((o: any) => o.status === "pendente").length;
  const preparingOrders = myOrders.filter((o: any) => o.status === "em_preparacao").length;
  const readyOrders = myOrders.filter((o: any) => o.status === "pronto").length;
  const deliveredOrders = myOrders.filter((o: any) => o.status === "entregue").length;

  // Use actual values when available for real-time accuracy
  const totalValue = myOrders.reduce(
    (sum: number, o: any) => sum + (o.items || []).reduce((s: number, i: any) => s + getEffectiveTotal(i), 0),
    0
  );

  const todayValue = todayOrders.reduce(
    (sum: number, o: any) => sum + (o.items || []).reduce((s: number, i: any) => s + getEffectiveTotal(i), 0),
    0
  );

  const stockAlerts = useMemo(() => {
    return products.map((p: any) => {
      const totalOut = orders
        .filter((o: any) => o.status !== "cancelado")
        .reduce((sum: number, o: any) => sum + (o.items || []).filter((i: any) => i.product_id === p.id).reduce((s: number, i: any) => s + Number(i.qty), 0), 0);
      const stock = 100 - totalOut;
      return { name: p.name, stock: Math.max(0, stock), section: p.section };
    }).filter((p: any) => p.stock <= 20).sort((a: any, b: any) => a.stock - b.stock).slice(0, 5);
  }, [products, orders]);

  const sectionStats = useMemo(() => {
    const map: Record<string, number> = {};
    SECTIONS.forEach(s => { map[s] = 0; });
    myOrders.forEach((o: any) => (o.items || []).forEach((i: any) => { map[i.section] = (map[i.section] || 0) + Number(i.qty); }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [myOrders]);

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isWarehouse = user.role === "armazem" || user.role === "admin";

  const renderOrderRow = (order: any) => (
    <Link key={order.id} to="/gestao/pedidos" className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
      <div>
        <p className="text-sm font-medium text-foreground">{order.store_name}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(order.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} · {(order.items || []).length} itens
        </p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
      </span>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground tracking-wide">
          Olá, {user.name} 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          {user.role === "funcionario" && `Loja: ${user.store}`}
          {user.role === "armazem" && "Gestão de pedidos do armazém"}
          {user.role === "admin" && "Painel de administração"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-heading text-foreground">{myOrders.length}</p><p className="text-xs text-muted-foreground">Total Pedidos</p></div></div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center"><ShoppingCart className="w-5 h-5 text-yellow-500" /></div><div><p className="text-2xl font-heading text-foreground">{pendingOrders}</p><p className="text-xs text-muted-foreground">Pendentes</p></div></div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Package className="w-5 h-5 text-blue-500" /></div><div><p className="text-2xl font-heading text-foreground">{preparingOrders}</p><p className="text-xs text-muted-foreground">Em Preparação</p></div></div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-500" /></div><div><p className="text-2xl font-heading text-foreground">€{totalValue.toFixed(0)}</p><p className="text-xs text-muted-foreground">Valor Total</p></div></div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="w-5 h-5 text-primary" /></div><div><p className="text-2xl font-heading text-foreground">{todayOrders.length}</p><p className="text-xs text-muted-foreground">Hoje</p></div></div></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center"><Truck className="w-5 h-5 text-green-500" /></div><div><p className="text-2xl font-heading text-foreground">{readyOrders}</p><p className="text-xs text-muted-foreground">Prontos</p></div></div></CardContent></Card>
      </div>

      {user.role === "funcionario" && (
        <Link to="/gestao/novo-pedido" className="block bg-gradient-flame text-primary-foreground rounded-xl p-6 text-center hover:opacity-90 transition-opacity">
          <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
          <span className="font-heading text-lg tracking-wide">Fazer Novo Pedido</span>
        </Link>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card border-border md:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>Pedidos de Hoje ({todayOrders.length})</CardTitle>
            <Link to="/gestao/pedidos" className="text-xs text-primary hover:underline flex items-center gap-1">Ver todos <ArrowUpRight className="w-3 h-3" /></Link>
          </CardHeader>
          <CardContent>
            {todayOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido hoje</p>
            ) : (
              <div className="space-y-2">
                {todayOrders.map(renderOrderRow)}
              </div>
            )}

            {previousOrders.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
                  {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <span>Pedidos anteriores ({previousOrders.length})</span>
                </button>
                {showHistory && (
                  <div className="space-y-2 mt-2">
                    {previousOrders.map(renderOrderRow)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isWarehouse && stockAlerts.length > 0 && (
            <Card className="bg-card border-border border-yellow-500/20">
              <CardHeader><CardTitle className="text-sm text-foreground tracking-wide flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}><AlertTriangle className="w-4 h-4 text-yellow-500" /> Alertas de Stock</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {stockAlerts.map((p: any) => (
                  <div key={p.name} className="flex justify-between items-center text-xs">
                    <span className="text-foreground">{p.name}</span>
                    <span className={`${p.stock <= 10 ? "text-destructive" : "text-yellow-400"}`}>{p.stock} un.</span>
                  </div>
                ))}
                <Link to="/gestao/inventario" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">Ver inventário <ArrowUpRight className="w-3 h-3" /></Link>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-sm text-foreground tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>Pedidos por Secção</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {sectionStats.map(([section, qty]) => (
                <div key={section} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{section}</span>
                  <span className="text-foreground">{qty} itens</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm text-foreground tracking-wide" style={{ fontFamily: "var(--font-heading)" }}>Resumo do Sistema</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Produtos</span><span className="text-foreground">{products.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Utilizadores</span><span className="text-foreground">{users?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Entregues</span><span className="text-green-400">{deliveredOrders}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Hoje (€)</span><span className="text-foreground">€{todayValue.toFixed(2)}</span></div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
