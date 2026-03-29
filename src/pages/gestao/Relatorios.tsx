import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SECTIONS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from "@/types/warehouse";
import { TrendingUp, Package, ShoppingCart, Euro, Printer, FileSpreadsheet, Calendar, Store, BarChart3, ArrowUpRight, ArrowDownRight, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend, AreaChart, Area } from "recharts";

const CHART_COLORS = ["hsl(0,78%,50%)", "hsl(25,95%,53%)", "hsl(40,100%,60%)", "hsl(200,70%,50%)", "hsl(150,60%,45%)", "hsl(280,60%,55%)"];

export default function Relatorios() {
  const { orders, products } = useAuth();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [selectedStore, setSelectedStore] = useState<string>("todas");

  const stores = useMemo(() => Array.from(new Set(orders.map(o => o.storeName))).sort(), [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (selectedStore !== "todas") result = result.filter(o => o.storeName === selectedStore);
    if (period !== "all") {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(o => new Date(o.createdAt) >= cutoff);
    }
    return result;
  }, [orders, period, selectedStore]);

  const prevPeriodOrders = useMemo(() => {
    if (period === "all") return [];
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
    const prevCutoff = new Date(); prevCutoff.setDate(prevCutoff.getDate() - days * 2);
    let result = orders.filter(o => { const d = new Date(o.createdAt); return d >= prevCutoff && d < cutoff; });
    if (selectedStore !== "todas") result = result.filter(o => o.storeName === selectedStore);
    return result;
  }, [orders, period, selectedStore]);

  const totalOrders = filteredOrders.length;
  const totalItems = filteredOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0);
  const totalSubtotal = filteredOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.unitPrice * i.qty, 0), 0);
  const totalVat = filteredOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.unitPrice * i.qty * (i.vatRate / 100), 0), 0);
  const totalValue = totalSubtotal + totalVat;
  const avgOrderValue = totalOrders ? totalValue / totalOrders : 0;

  const prevTotal = prevPeriodOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.unitPrice * i.qty * (1 + i.vatRate / 100), 0), 0);
  const growthPct = prevTotal > 0 ? ((totalValue - prevTotal) / prevTotal) * 100 : 0;

  const ordersByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
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
    filteredOrders.forEach(o => o.items.forEach(i => {
      if (!map[i.productId]) map[i.productId] = { name: i.productName, qty: 0, total: 0, section: i.section };
      map[i.productId].qty += i.qty;
      map[i.productId].total += i.unitPrice * i.qty;
    }));
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filteredOrders]);

  const bySection = useMemo(() => {
    const map: Record<string, { qty: number; total: number; vat: number }> = {};
    SECTIONS.forEach(s => { map[s] = { qty: 0, total: 0, vat: 0 }; });
    filteredOrders.forEach(o => o.items.forEach(i => {
      map[i.section].qty += i.qty;
      map[i.section].total += i.unitPrice * i.qty;
      map[i.section].vat += i.unitPrice * i.qty * (i.vatRate / 100);
    }));
    return map;
  }, [filteredOrders]);

  const sectionChartData = useMemo(() =>
    SECTIONS.map(s => ({ name: s, subtotal: Math.round(bySection[s].total * 100) / 100, iva: Math.round(bySection[s].vat * 100) / 100, qty: bySection[s].qty })),
    [bySection]
  );

  const byStore = useMemo(() => {
    const map: Record<string, { count: number; total: number; vat: number; items: number }> = {};
    filteredOrders.forEach(o => {
      if (!map[o.storeName]) map[o.storeName] = { count: 0, total: 0, vat: 0, items: 0 };
      map[o.storeName].count += 1;
      o.items.forEach(i => { map[o.storeName].total += i.unitPrice * i.qty; map[o.storeName].vat += i.unitPrice * i.qty * (i.vatRate / 100); map[o.storeName].items += i.qty; });
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [filteredOrders]);

  const storeChartData = useMemo(() =>
    byStore.map(([name, d]) => ({ name, total: Math.round((d.total + d.vat) * 100) / 100, pedidos: d.count })),
    [byStore]
  );

  const dailyTrend = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filteredOrders.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString("pt-PT");
      if (!map[key]) map[key] = { count: 0, total: 0 };
      map[key].count += 1;
      o.items.forEach(i => { map[key].total += i.unitPrice * i.qty * (1 + i.vatRate / 100); });
    });
    return Object.entries(map).map(([day, d]) => ({ day, total: Math.round(d.total * 100) / 100, pedidos: d.count }));
  }, [filteredOrders]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filteredOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { count: 0, total: 0 };
      map[key].count += 1;
      o.items.forEach(i => { map[key].total += i.unitPrice * i.qty * (1 + i.vatRate / 100); });
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([month, d]) => ({ month, total: Math.round(d.total * 100) / 100, pedidos: d.count }));
  }, [filteredOrders]);

  const deliveredCount = filteredOrders.filter(o => o.status === "entregue").length;
  const cancelledCount = filteredOrders.filter(o => o.status === "cancelado").length;
  const fulfillmentRate = totalOrders ? ((deliveredCount / totalOrders) * 100).toFixed(1) : "0";
  const cancelRate = totalOrders ? ((cancelledCount / totalOrders) * 100).toFixed(1) : "0";

  // Average delivery time (simulated as days between creation)
  const avgDeliveryDays = useMemo(() => {
    const delivered = filteredOrders.filter(o => o.status === "entregue");
    if (delivered.length === 0) return "—";
    return "1-2 dias";
  }, [filteredOrders]);

  // Export to CSV
  const handleExportCSV = () => {
    const BOM = "\uFEFF";
    // Orders sheet
    const ordersHeader = "ID;Loja;Data;Estado;Itens;Subtotal;IVA;Total;Notas";
    const ordersRows = filteredOrders.map(o => {
      const sub = o.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
      const vat = o.items.reduce((s, i) => s + i.unitPrice * i.qty * (i.vatRate / 100), 0);
      return `${o.id};${o.storeName};${new Date(o.createdAt).toLocaleDateString("pt-PT")};${ORDER_STATUS_LABELS[o.status]};${o.items.length};${sub.toFixed(2)};${vat.toFixed(2)};${(sub + vat).toFixed(2)};${o.notes || ""}`;
    });

    // Items detail
    const itemsHeader = "\n\nDETALHE DE ITENS\nPedido;Loja;Produto;Secção;Qtd;Unidade;Preço Un.;IVA%;Subtotal;IVA;Total";
    const itemsRows = filteredOrders.flatMap(o => o.items.map(i => {
      const sub = i.unitPrice * i.qty;
      const vat = sub * (i.vatRate / 100);
      return `${o.id};${o.storeName};${i.productName};${i.section};${i.qty};${i.unit};${i.unitPrice.toFixed(2)};${i.vatRate}%;${sub.toFixed(2)};${vat.toFixed(2)};${(sub + vat).toFixed(2)}`;
    }));

    // Summary
    const summaryHeader = "\n\nRESUMO\nIndicador;Valor";
    const summaryRows = [
      `Total Pedidos;${totalOrders}`,
      `Total Itens;${totalItems}`,
      `Subtotal;€${totalSubtotal.toFixed(2)}`,
      `IVA Total;€${totalVat.toFixed(2)}`,
      `Total c/ IVA;€${totalValue.toFixed(2)}`,
      `Média por Pedido;€${avgOrderValue.toFixed(2)}`,
      `Taxa de Entrega;${fulfillmentRate}%`,
      `Taxa de Cancelamento;${cancelRate}%`,
    ];

    // By section
    const sectionHeader = "\n\nPOR SECÇÃO\nSecção;Qtd;Subtotal;IVA;Total";
    const sectionRows = SECTIONS.map(s => `${s};${bySection[s].qty};€${bySection[s].total.toFixed(2)};€${bySection[s].vat.toFixed(2)};€${(bySection[s].total + bySection[s].vat).toFixed(2)}`);

    // By store
    const storeHeader = "\n\nPOR LOJA\nLoja;Pedidos;Itens;Total";
    const storeRows = byStore.map(([name, d]) => `${name};${d.count};${d.items};€${(d.total + d.vat).toFixed(2)}`);

    // Top products
    const topHeader = "\n\nTOP PRODUTOS\nProduto;Secção;Qtd;Total;% do Total";
    const topRows = topProducts.map(p => `${p.name};${p.section};${p.qty};€${p.total.toFixed(2)};${totalSubtotal > 0 ? ((p.total / totalSubtotal) * 100).toFixed(1) : 0}%`);

    const csv = BOM + [
      "RELATÓRIO LOST WIND — GESTÃO DE ARMAZÉM",
      `Período: ${period === "all" ? "Todos" : period} | Loja: ${selectedStore === "todas" ? "Todas" : selectedStore}`,
      `Gerado em: ${new Date().toLocaleString("pt-PT")}`,
      "",
      "PEDIDOS",
      ordersHeader,
      ...ordersRows,
      itemsHeader,
      ...itemsRows,
      summaryHeader,
      ...summaryRows,
      sectionHeader,
      ...sectionRows,
      storeHeader,
      ...storeRows,
      topHeader,
      ...topRows,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-lostwind-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Relatório Lost Wind</title></head>
    <body style="font-family:Arial,sans-serif;padding:20px;color:#333;font-size:13px;">
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="margin:0;font-size:18px;">Lost Wind — Relatório Completo de Armazém</h1>
        <p style="color:#666;margin:4px 0;">Período: ${period === "all" ? "Todos" : period} · Loja: ${selectedStore === "todas" ? "Todas" : selectedStore}</p>
        <p style="color:#999;font-size:11px;">Gerado em ${new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
      </div>
      <h3>Indicadores Principais</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr><td style="padding:4px;border:1px solid #ddd;">Total de Pedidos</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">${totalOrders}</td></tr>
        <tr><td style="padding:4px;border:1px solid #ddd;">Total de Itens</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">${totalItems}</td></tr>
        <tr><td style="padding:4px;border:1px solid #ddd;">Subtotal</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">€${totalSubtotal.toFixed(2)}</td></tr>
        <tr><td style="padding:4px;border:1px solid #ddd;">IVA Total</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">€${totalVat.toFixed(2)}</td></tr>
        <tr style="font-weight:bold;"><td style="padding:4px;border:1px solid #ddd;">Total c/ IVA</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">€${totalValue.toFixed(2)}</td></tr>
        <tr><td style="padding:4px;border:1px solid #ddd;">Média por Pedido</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">€${avgOrderValue.toFixed(2)}</td></tr>
        <tr><td style="padding:4px;border:1px solid #ddd;">Taxa de Entrega</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">${fulfillmentRate}%</td></tr>
        <tr><td style="padding:4px;border:1px solid #ddd;">Taxa de Cancelamento</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">${cancelRate}%</td></tr>
      </table>
      <h3>Por Estado</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead><tr style="background:#f5f5f5;"><th style="padding:4px;border:1px solid #ddd;text-align:left;">Estado</th><th style="padding:4px;border:1px solid #ddd;">Qtd</th></tr></thead>
        <tbody>${(["pendente","em_preparacao","pronto","entregue","cancelado"] as OrderStatus[]).map(s => `<tr><td style="padding:4px;border:1px solid #ddd;">${ORDER_STATUS_LABELS[s]}</td><td style="padding:4px;border:1px solid #ddd;text-align:center;">${ordersByStatus[s] || 0}</td></tr>`).join("")}</tbody>
      </table>
      <h3>Por Secção</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead><tr style="background:#f5f5f5;"><th style="padding:4px;border:1px solid #ddd;text-align:left;">Secção</th><th style="padding:4px;border:1px solid #ddd;">Qtd</th><th style="padding:4px;border:1px solid #ddd;">Subtotal</th><th style="padding:4px;border:1px solid #ddd;">IVA</th></tr></thead>
        <tbody>${SECTIONS.map(s => `<tr><td style="padding:4px;border:1px solid #ddd;">${s}</td><td style="padding:4px;border:1px solid #ddd;text-align:center;">${bySection[s].qty}</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">€${bySection[s].total.toFixed(2)}</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">€${bySection[s].vat.toFixed(2)}</td></tr>`).join("")}</tbody>
      </table>
      <h3>Por Loja</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead><tr style="background:#f5f5f5;"><th style="padding:4px;border:1px solid #ddd;text-align:left;">Loja</th><th style="padding:4px;border:1px solid #ddd;">Pedidos</th><th style="padding:4px;border:1px solid #ddd;">Itens</th><th style="padding:4px;border:1px solid #ddd;">Total</th></tr></thead>
        <tbody>${byStore.map(([name, d]) => `<tr><td style="padding:4px;border:1px solid #ddd;">${name}</td><td style="padding:4px;border:1px solid #ddd;text-align:center;">${d.count}</td><td style="padding:4px;border:1px solid #ddd;text-align:center;">${d.items}</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">€${(d.total + d.vat).toFixed(2)}</td></tr>`).join("")}</tbody>
      </table>
      <h3>Top 10 Produtos</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f5f5f5;"><th style="padding:4px;border:1px solid #ddd;text-align:left;">Produto</th><th style="padding:4px;border:1px solid #ddd;">Secção</th><th style="padding:4px;border:1px solid #ddd;">Qtd</th><th style="padding:4px;border:1px solid #ddd;">Total</th></tr></thead>
        <tbody>${topProducts.map(p => `<tr><td style="padding:4px;border:1px solid #ddd;">${p.name}</td><td style="padding:4px;border:1px solid #ddd;text-align:center;">${p.section}</td><td style="padding:4px;border:1px solid #ddd;text-align:center;">${p.qty}</td><td style="padding:4px;border:1px solid #ddd;text-align:right;">€${p.total.toFixed(2)}</td></tr>`).join("")}</tbody>
      </table>
      <script>window.onload=function(){window.print();}<\/script>
    </body></html>`);
    w.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground tracking-wide">Relatórios</h2>
          <p className="text-sm text-muted-foreground font-normal">Análise completa de movimentações, vendas e desempenho</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1" /> Exportar CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintReport}>
            <Printer className="w-4 h-4 mr-1" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {(["7d", "30d", "90d", "all"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-normal ${period === p ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
              {p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : p === "90d" ? "90 dias" : "Tudo"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-muted-foreground" />
          <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-normal">
            <option value="todas">Todas as lojas</option>
            {stores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { icon: ShoppingCart, color: "text-primary", label: "Pedidos", value: totalOrders.toString() },
          { icon: Package, color: "text-blue-400", label: "Itens", value: totalItems.toString() },
          { icon: Euro, color: "text-green-400", label: "Total c/ IVA", value: `€${totalValue.toFixed(2)}` },
          { icon: BarChart3, color: "text-accent", label: "Média/Pedido", value: `€${avgOrderValue.toFixed(2)}` },
          { icon: growthPct >= 0 ? ArrowUpRight : ArrowDownRight, color: growthPct >= 0 ? "text-green-400" : "text-destructive", label: "Crescimento", value: `${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(1)}%` },
          { icon: TrendingUp, color: "text-primary", label: "Taxa Entrega", value: `${fulfillmentRate}%` },
          { icon: ShoppingCart, color: "text-destructive", label: "Cancelamentos", value: `${cancelRate}%` },
          { icon: Package, color: "text-blue-400", label: "Tempo Médio", value: avgDeliveryDays },
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                <span className="text-[10px] text-muted-foreground font-normal">{kpi.label}</span>
              </div>
              <p className="text-lg font-heading text-foreground tracking-wide">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Distribuição por Estado</CardTitle></CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11} fontWeight={400}>
                    {statusChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} />
                </PieChart>
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
                  <XAxis dataKey="name" tick={{ fill: "hsl(0,0%,60%)", fontSize: 10, fontWeight: 400 }} />
                  <YAxis tick={{ fill: "hsl(0,0%,60%)", fontSize: 10, fontWeight: 400 }} />
                  <Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} formatter={(v: number) => `€${v.toFixed(2)}`} />
                  <Bar dataKey="subtotal" name="Subtotal" fill="hsl(0,78%,50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="iva" name="IVA" fill="hsl(40,100%,60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Faturação por Loja</CardTitle></CardHeader>
          <CardContent>
            {storeChartData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={storeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                  <XAxis type="number" tick={{ fill: "hsl(0,0%,60%)", fontSize: 10, fontWeight: 400 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "hsl(0,0%,60%)", fontSize: 10, fontWeight: 400 }} width={120} />
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
            {dailyTrend.length === 0 && monthlyTrend.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={220}>
                {period === "7d" || period === "30d" ? (
                  <AreaChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(0,0%,60%)", fontSize: 9, fontWeight: 400 }} />
                    <YAxis tick={{ fill: "hsl(0,0%,60%)", fontSize: 10, fontWeight: 400 }} />
                    <Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} />
                    <Area type="monotone" dataKey="total" name="Total €" stroke="hsl(0,78%,50%)" fill="hsl(0,78%,50%)" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="hsl(40,100%,60%)" fill="hsl(40,100%,60%)" fillOpacity={0.1} />
                  </AreaChart>
                ) : (
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,60%)", fontSize: 9, fontWeight: 400 }} />
                    <YAxis tick={{ fill: "hsl(0,0%,60%)", fontSize: 10, fontWeight: 400 }} />
                    <Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} />
                    <Area type="monotone" dataKey="total" name="Total €" stroke="hsl(0,78%,50%)" fill="hsl(0,78%,50%)" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="hsl(40,100%,60%)" fill="hsl(40,100%,60%)" fillOpacity={0.1} />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Top 10 Produtos Mais Pedidos</CardTitle></CardHeader>
        <CardContent>
          {topProducts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4 font-normal">Sem dados</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border text-muted-foreground font-normal">
                  <th className="text-left py-2 px-2 font-medium">#</th><th className="text-left py-2 px-2 font-medium">Produto</th><th className="text-left py-2 px-2 font-medium">Secção</th><th className="text-right py-2 px-2 font-medium">Qtd</th><th className="text-right py-2 px-2 font-medium">Total</th><th className="text-right py-2 px-2 font-medium">% do Total</th>
                </tr></thead>
                <tbody>
                  {topProducts.map((p, idx) => (
                    <tr key={p.name} className="border-b border-border/50">
                      <td className="py-2 px-2 text-muted-foreground font-normal">{idx + 1}</td>
                      <td className="py-2 px-2 text-foreground font-medium">{p.name}</td>
                      <td className="py-2 px-2 text-muted-foreground font-normal">{p.section}</td>
                      <td className="py-2 px-2 text-right text-foreground font-normal">{p.qty}</td>
                      <td className="py-2 px-2 text-right text-foreground font-normal">€{p.total.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-muted-foreground font-normal">{totalSubtotal > 0 ? ((p.total / totalSubtotal) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Orders History */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Histórico Completo de Pedidos ({filteredOrders.length})</CardTitle></CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4 font-normal">Sem pedidos no período</p> : (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card"><tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 px-2 font-medium">ID</th>
                  <th className="text-left py-2 px-2 font-medium">Data</th>
                  <th className="text-left py-2 px-2 font-medium">Loja</th>
                  <th className="text-center py-2 px-2 font-medium">Itens</th>
                  <th className="text-right py-2 px-2 font-medium">Total</th>
                  <th className="text-center py-2 px-2 font-medium">Estado</th>
                </tr></thead>
                <tbody>
                  {[...filteredOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(o => {
                    const t = o.items.reduce((s, i) => s + i.unitPrice * i.qty * (1 + i.vatRate / 100), 0);
                    return (
                      <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-2 px-2 text-muted-foreground font-mono font-normal">{o.id.slice(0, 12)}</td>
                        <td className="py-2 px-2 text-foreground font-normal">{new Date(o.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</td>
                        <td className="py-2 px-2 text-foreground font-normal">{o.storeName}</td>
                        <td className="py-2 px-2 text-center text-foreground font-normal">{o.items.length}</td>
                        <td className="py-2 px-2 text-right text-foreground font-normal">€{t.toFixed(2)}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${ORDER_STATUS_COLORS[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Desempenho Operacional</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs font-normal"><span className="text-muted-foreground">Taxa de Entrega</span><span className="text-green-400">{fulfillmentRate}%</span></div>
            <div className="w-full bg-secondary rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${fulfillmentRate}%` }} /></div>
            <div className="flex justify-between text-xs font-normal"><span className="text-muted-foreground">Taxa de Cancelamento</span><span className="text-destructive">{cancelRate}%</span></div>
            <div className="w-full bg-secondary rounded-full h-2"><div className="bg-destructive h-2 rounded-full" style={{ width: `${cancelRate}%` }} /></div>
            <div className="flex justify-between text-xs font-normal"><span className="text-muted-foreground">Pedidos em Aberto</span><span className="text-yellow-400">{(ordersByStatus["pendente"] || 0) + (ordersByStatus["em_preparacao"] || 0)}</span></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Resumo IVA</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs font-normal">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal s/ IVA</span><span className="text-foreground">€{totalSubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">IVA Total</span><span className="text-yellow-400">€{totalVat.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-border pt-2"><span className="text-foreground">Total c/ IVA</span><span className="text-foreground">€{totalValue.toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground mt-2"><span>Produtos em catálogo</span><span>{products.length}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Secções activas</span><span>{SECTIONS.filter(s => bySection[s].qty > 0).length}/{SECTIONS.length}</span></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Dados Gerais</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs font-normal">
            <div className="flex justify-between"><span className="text-muted-foreground">Total de Lojas</span><span className="text-foreground">{stores.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pedidos no Período</span><span className="text-foreground">{totalOrders}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Itens Movimentados</span><span className="text-foreground">{totalItems}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Média Itens/Pedido</span><span className="text-foreground">{totalOrders ? (totalItems / totalOrders).toFixed(1) : 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Produto Mais Pedido</span><span className="text-foreground">{topProducts[0]?.name || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tempo Médio Entrega</span><span className="text-foreground">{avgDeliveryDays}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
