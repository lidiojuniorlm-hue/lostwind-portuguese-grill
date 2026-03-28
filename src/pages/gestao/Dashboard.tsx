import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ClipboardList, Users, ShoppingCart, TrendingUp, Euro, AlertTriangle, Truck, Clock, ArrowUpRight } from "lucide-react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SECTIONS } from "@/types/warehouse";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user, orders, products, users } = useAuth();

  const myOrders = useMemo(() => {
    if (!user) return [];
    return user.role === "funcionario"
      ? orders.filter((o) => o.createdBy === user.id)
      : orders;
  }, [user, orders]);

  const pendingOrders = myOrders.filter((o) => o.status === "pendente").length;
  const preparingOrders = myOrders.filter((o) => o.status === "em_preparacao").length;
  const readyOrders = myOrders.filter((o) => o.status === "pronto").length;
  const deliveredOrders = myOrders.filter((o) => o.status === "entregue").length;
  const recentOrders = [...myOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  const totalValue = myOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.unitPrice * i.qty * (1 + i.vatRate / 100), 0),
    0
  );

  const today = new Date().toLocaleDateString("pt-PT");
  const todayOrders = myOrders.filter(o => new Date(o.createdAt).toLocaleDateString("pt-PT") === today);
  const todayValue = todayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.unitPrice * i.qty * (1 + i.vatRate / 100), 0), 0);

  const stockAlerts = useMemo(() => {
    return products.map(p => {
      const totalOut = orders
        .filter(o => o.status !== "cancelado")
        .reduce((sum, o) => sum + o.items.filter(i => i.productId === p.id).reduce((s, i) => s + i.qty, 0), 0);
      const stock = 100 - totalOut;
      return { name: p.name, stock: Math.max(0, stock), section: p.section };
    }).filter(p => p.stock <= 20).sort((a, b) => a.stock - b.stock).slice(0, 5);
  }, [products, orders]);

  const sectionStats = useMemo(() => {
    const map: Record<string, number> = {};
    SECTIONS.forEach(s => { map[s] = 0; });
    myOrders.forEach(o => o.items.forEach(i => { map[i.section] += i.qty; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [myOrders]);

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isWarehouse = user.role === "armazem" || user.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground tracking-wide">
          Olá, {user.name} 👋
        </h2>
        <p className="text-sm text-muted-foreground font-normal">
          {user.role === "funcionario" && `Loja: ${user.store}`}
          {user.role === "armazem" && "Gestão de pedidos do armazém"}
          {user.role === "admin" && "Painel de administração"}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading text-foreground">{myOrders.length}</p>
                <p className="text-xs text-muted-foreground font-normal">Total Pedidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-heading text-foreground">{pendingOrders}</p>
                <p className="text-xs text-muted-foreground font-normal">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-heading text-foreground">{preparingOrders}</p>
                <p className="text-xs text-muted-foreground font-normal">Em Preparação</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-heading text-foreground">€{totalValue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground font-normal">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading text-foreground">{todayOrders.length}</p>
                <p className="text-xs text-muted-foreground font-normal">Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-heading text-foreground">{readyOrders}</p>
                <p className="text-xs text-muted-foreground font-normal">Prontos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {user.role === "funcionario" && (
        <Link
          to="/gestao/novo-pedido"
          className="block bg-gradient-flame text-primary-foreground rounded-xl p-6 text-center hover:opacity-90 transition-opacity"
        >
          <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
          <span className="font-heading text-lg tracking-wide">Fazer Novo Pedido</span>
        </Link>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <Card className="bg-card border-border md:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading tracking-wide">Últimos Pedidos</CardTitle>
            <Link to="/gestao/pedidos" className="text-xs text-primary hover:underline flex items-center gap-1 font-normal">
              Ver todos <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 font-normal">Nenhum pedido ainda</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => {
                  const total = order.items.reduce((s, i) => s + i.unitPrice * i.qty * (1 + i.vatRate / 100), 0);
                  return (
                    <Link
                      key={order.id}
                      to="/gestao/pedidos"
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{order.storeName}</p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {new Date(order.createdAt).toLocaleDateString("pt-PT")} · {order.items.length} itens · €{total.toFixed(2)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-normal ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Stock alerts (warehouse/admin only) */}
          {isWarehouse && stockAlerts.length > 0 && (
            <Card className="bg-card border-border border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" /> Alertas de Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stockAlerts.map(p => (
                  <div key={p.name} className="flex justify-between items-center text-xs">
                    <span className="text-foreground font-normal">{p.name}</span>
                    <span className={`font-normal ${p.stock <= 10 ? "text-destructive" : "text-yellow-400"}`}>{p.stock} un.</span>
                  </div>
                ))}
                <Link to="/gestao/inventario" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2 font-normal">
                  Ver inventário <ArrowUpRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Section breakdown */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-heading tracking-wide">Pedidos por Secção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sectionStats.map(([section, qty]) => (
                <div key={section} className="flex justify-between text-xs font-normal">
                  <span className="text-muted-foreground">{section}</span>
                  <span className="text-foreground">{qty} itens</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick stats for admin */}
          {isAdmin && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-heading tracking-wide">Resumo do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs font-normal">
                <div className="flex justify-between"><span className="text-muted-foreground">Produtos</span><span className="text-foreground">{products.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Utilizadores</span><span className="text-foreground">{users.length}</span></div>
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
