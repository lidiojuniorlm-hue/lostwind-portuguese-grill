import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders, useProducts } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SECTIONS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from "@/types/warehouse";
import { TrendingUp, Package, ShoppingCart, Euro, Printer, Calendar, Store, BarChart3, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area } from "recharts";

const CHART_COLORS = ["hsl(0,78%,50%)", "hsl(25,95%,53%)", "hsl(40,100%,60%)", "hsl(200,70%,50%)", "hsl(150,60%,45%)", "hsl(280,60%,55%)"];

export default function Relatorios() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.role, user?.id, user?.store);
  const { data: products = [] } = useProducts();
  const [period, setPeriod] = useState<"hoje" | "7d" | "30d" | "90d" | "all">("30d");
  const [selectedStore, setSelectedStore] = useState<string>("todas");

  const stores = useMemo(() => Array.from(new Set(orders.map((o: any) => o.store_name))).sort(), [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (selectedStore !== "todas") result = result.filter((o: any) => o.store_name === selectedStore);
    if (period === "hoje") {
      const today = new Date().toLocaleDateString("pt-PT");
      result = result.filter((o: any) => new Date(o.created_at).toLocaleDateString("pt-PT") === today);
    } else if (period !== "all") {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((o: any) => new Date(o.created_at) >= cutoff);
    }
    return result;
  }, [orders, period, selectedStore]);

  const totalOrders = filteredOrders.length;
  const totalItems = filteredOrders.reduce((s: number, o: any) => s + (o.items || []).reduce((si: number, i: any) => si + Number(i.qty), 0), 0);
  const totalSubtotal = filteredOrders.reduce((s: number, o: any) => s + (o.items || []).reduce((si: number, i: any) => si + Number(i.unit_price) * Number(i.qty), 0), 0);
  const totalVat = filteredOrders.reduce((s: number, o: any) => s + (o.items || []).reduce((si: number, i: any) => si + Number(i.unit_price) * Number(i.qty) * (Number(i.vat_rate) / 100), 0), 0);
  const totalValue = totalSubtotal + totalVat;
  const avgOrderValue = totalOrders ? totalValue / totalOrders : 0;

  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach((o: any) => { map[o.status] = (map[o.status] || 0) + 1; });
    return map;
  }, [filteredOrders]);

  const statusChartData = useMemo(() =>
    (["pendente", "em_preparacao", "pronto", "entregue", "cancelado"] as OrderStatus[])
      .map(s => ({ name: ORDER_STATUS_LABELS[s], value: ordersByStatus[s] || 0 }))
      .filter(d => d.value > 0),
    [ordersByStatus]
  );

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; total: number; section: string }> = {};
    filteredOrders.forEach((o: any) => (o.items || []).forEach((i: any) => {
      if (!map[i.product_id]) map[i.product_id] = { name: i.product_name, qty: 0, total: 0, section: i.section };
      map[i.product_id].qty += Number(i.qty);
      map[i.product_id].total += Number(i.unit_price) * Number(i.qty);
    }));
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filteredOrders]);

  const bySection = useMemo(() => {
    const map: Record<string, { qty: number; total: number; vat: number }> = {};
    SECTIONS.forEach(s => { map[s] = { qty: 0, total: 0, vat: 0 }; });
    filteredOrders.forEach((o: any) => (o.items || []).forEach((i: any) => {
      if (map[i.section]) {
        map[i.section].qty += Number(i.qty);
        map[i.section].total += Number(i.unit_price) * Number(i.qty);
        map[i.section].vat += Number(i.unit_price) * Number(i.qty) * (Number(i.vat_rate) / 100);
      }
    }));
    return map;
  }, [filteredOrders]);

  const sectionChartData = useMemo(() =>
    SECTIONS.map(s => ({ name: s, subtotal: Math.round(bySection[s].total * 100) / 100, iva: Math.round(bySection[s].vat * 100) / 100, qty: bySection[s].qty })),
    [bySection]
  );

  const byStore = useMemo(() => {
    const map: Record<string, { count: number; total: number; vat: number; items: number }> = {};
    filteredOrders.forEach((o: any) => {
      if (!map[o.store_name]) map[o.store_name] = { count: 0, total: 0, vat: 0, items: 0 };
      map[o.store_name].count += 1;
      (o.items || []).forEach((i: any) => { map[o.store_name].total += Number(i.unit_price) * Number(i.qty); map[o.store_name].vat += Number(i.unit_price) * Number(i.qty) * (Number(i.vat_rate) / 100); map[o.store_name].items += Number(i.qty); });
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [filteredOrders]);

  const storeChartData = useMemo(() => byStore.map(([name, d]) => ({ name, total: Math.round((d.total + d.vat) * 100) / 100, pedidos: d.count })), [byStore]);

  const dailyTrend = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filteredOrders.forEach((o: any) => {
      const key = new Date(o.created_at).toLocaleDateString("pt-PT");
      if (!map[key]) map[key] = { count: 0, total: 0 };
      map[key].count += 1;
      (o.items || []).forEach((i: any) => { map[key].total += Number(i.unit_price) * Number(i.qty) * (1 + Number(i.vat_rate) / 100); });
    });
    return Object.entries(map).map(([day, d]) => ({ day, total: Math.round(d.total * 100) / 100, pedidos: d.count }));
  }, [filteredOrders]);

  const deliveredCount = filteredOrders.filter((o: any) => o.status === "entregue").length;
  const cancelledCount = filteredOrders.filter((o: any) => o.status === "cancelado").length;
  const fulfillmentRate = totalOrders ? ((deliveredCount / totalOrders) * 100).toFixed(1) : "0";
  const cancelRate = totalOrders ? ((cancelledCount / totalOrders) * 100).toFixed(1) : "0";

  const handleExportCSV = () => {
    const BOM = "\uFEFF";
    const header = "Loja;Data;Estado;Itens;Subtotal;IVA;Total";
    const rows = filteredOrders.map((o: any) => {
      const sub = (o.items || []).reduce((s: number, i: any) => s + Number(i.unit_price) * Number(i.qty), 0);
      const vat = (o.items || []).reduce((s: number, i: any) => s + Number(i.unit_price) * Number(i.qty) * (Number(i.vat_rate) / 100), 0);
      return `${o.store_name};${new Date(o.created_at).toLocaleDateString("pt-PT")};${ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS]};${(o.items || []).length};${sub.toFixed(2)};${vat.toFixed(2)};${(sub + vat).toFixed(2)}`;
    });
    const csv = BOM + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl font-heading text-foreground tracking-wide">Relatórios</h2><p className="text-sm text-muted-foreground font-normal">Análise completa de movimentações e desempenho</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {(["hoje", "7d", "30d", "90d", "all"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-normal ${period === p ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
              {p === "hoje" ? "Hoje" : p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : p === "90d" ? "90 dias" : "Tudo"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-muted-foreground" />
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-normal">
            <option value="todas">Todas as lojas</option>
            {stores.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { icon: ShoppingCart, color: "text-primary", label: "Pedidos", value: totalOrders.toString() },
          { icon: Package, color: "text-blue-400", label: "Itens", value: totalItems.toString() },
          { icon: Euro, color: "text-green-400", label: "Total c/ IVA", value: `€${totalValue.toFixed(2)}` },
          { icon: BarChart3, color: "text-accent", label: "Média/Pedido", value: `€${avgOrderValue.toFixed(2)}` },
          { icon: TrendingUp, color: "text-primary", label: "Taxa Entrega", value: `${fulfillmentRate}%` },
          { icon: ShoppingCart, color: "text-destructive", label: "Cancelamentos", value: `${cancelRate}%` },
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-card border-border"><CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1"><kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} /><span className="text-[10px] text-muted-foreground font-normal">{kpi.label}</span></div>
            <p className="text-lg font-heading text-foreground tracking-wide">{kpi.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Distribuição por Estado</CardTitle></CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {statusChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie><Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} /></PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Faturação por Secção</CardTitle></CardHeader>
          <CardContent>
            {sectionChartData.every(d => d.subtotal === 0) ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(0,0%,60%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(0,0%,60%)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} formatter={(v: number) => `€${v.toFixed(2)}`} />
                  <Bar dataKey="subtotal" name="Subtotal" fill="hsl(0,78%,50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="iva" name="IVA" fill="hsl(40,100%,60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Faturação por Loja</CardTitle></CardHeader>
          <CardContent>
            {storeChartData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={storeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                  <XAxis type="number" tick={{ fill: "hsl(0,0%,60%)", fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "hsl(0,0%,60%)", fontSize: 10 }} width={120} />
                  <Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} formatter={(v: number) => `€${v.toFixed(2)}`} />
                  <Bar dataKey="total" name="Total" fill="hsl(25,95%,53%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Tendência de Pedidos</CardTitle></CardHeader>
          <CardContent>
            {dailyTrend.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(0,0%,60%)", fontSize: 9 }} />
                  <YAxis tick={{ fill: "hsl(0,0%,60%)", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} />
                  <Area type="monotone" dataKey="total" name="Total €" stroke="hsl(0,78%,50%)" fill="hsl(0,78%,50%)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Top 10 Produtos</CardTitle></CardHeader>
        <CardContent>
          {topProducts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4 font-normal">Sem dados</p> : (
            <div className="overflow-x-auto"><table className="w-full text-xs">
              <thead><tr className="border-b border-border text-muted-foreground"><th className="text-left py-2 px-2">#</th><th className="text-left py-2 px-2">Produto</th><th className="text-left py-2 px-2">Secção</th><th className="text-right py-2 px-2">Qtd</th><th className="text-right py-2 px-2">Total</th></tr></thead>
              <tbody>{topProducts.map((p, idx) => (
                <tr key={p.name} className="border-b border-border/50"><td className="py-2 px-2 text-muted-foreground">{idx + 1}</td><td className="py-2 px-2 text-foreground font-medium">{p.name}</td><td className="py-2 px-2 text-muted-foreground">{p.section}</td><td className="py-2 px-2 text-right">{p.qty}</td><td className="py-2 px-2 text-right">€{p.total.toFixed(2)}</td></tr>
              ))}</tbody>
            </table></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
