import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SECTIONS } from "@/types/warehouse";
import { Euro, TrendingUp, Receipt, Percent, Calendar, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import jsPDF from "jspdf";
import { createPDFHeader, addPDFFooter, runPDFTable, downloadPDF, addPDFSectionTitle, modernTableStyles } from "@/utils/pdfHelpers";

const CHART_COLORS = [
  "hsl(220, 14%, 46%)", "hsl(200, 18%, 55%)", "hsl(160, 20%, 50%)",
  "hsl(35, 25%, 55%)", "hsl(0, 15%, 50%)", "hsl(270, 12%, 52%)", "hsl(100, 15%, 48%)"
];

// Helper: use actual values when available
const getEffective = (item: any) => {
  const qty = Number(item.actual_qty ?? item.qty);
  const price = Number(item.actual_price ?? item.unit_price);
  const vatRate = Number(item.actual_vat ?? item.vat_rate);
  const subtotal = qty * price;
  const vat = subtotal * (vatRate / 100);
  return { qty, price, vatRate, subtotal, vat, total: subtotal + vat };
};

const tooltipStyle = {
  background: "hsl(220, 13%, 12%)",
  border: "1px solid hsl(220, 10%, 22%)",
  borderRadius: 10,
  fontSize: 12,
  color: "hsl(220, 10%, 85%)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};

export default function Financeiro() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.role, user?.id, user?.store);
  const [period, setPeriod] = useState<"hoje" | "7d" | "30d" | "90d" | "all">("30d");

  const filteredOrders = useMemo(() => {
    if (period === "all") return orders;
    if (period === "hoje") {
      const today = new Date().toLocaleDateString("pt-PT");
      return orders.filter((o: any) => new Date(o.created_at).toLocaleDateString("pt-PT") === today);
    }
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return orders.filter((o: any) => new Date(o.created_at) >= cutoff);
  }, [orders, period]);

  const totals = useMemo(() => {
    let subtotal = 0, vat = 0;
    filteredOrders.forEach((o: any) => (o.items || []).forEach((i: any) => {
      const e = getEffective(i);
      subtotal += e.subtotal;
      vat += e.vat;
    }));
    return { subtotal, vat, total: subtotal + vat, avgOrder: filteredOrders.length ? (subtotal + vat) / filteredOrders.length : 0 };
  }, [filteredOrders]);

  const vatBreakdown = useMemo(() => {
    const map: Record<number, { base: number; vat: number }> = {};
    filteredOrders.forEach((o: any) => (o.items || []).forEach((i: any) => {
      const e = getEffective(i);
      if (!map[e.vatRate]) map[e.vatRate] = { base: 0, vat: 0 };
      map[e.vatRate].base += e.subtotal;
      map[e.vatRate].vat += e.vat;
    }));
    return Object.entries(map).map(([rate, d]) => ({ rate: `${rate}%`, base: d.base, vat: d.vat, total: d.base + d.vat }));
  }, [filteredOrders]);

  const bySection = useMemo(() => {
    const map: Record<string, number> = {};
    SECTIONS.forEach(s => { map[s] = 0; });
    filteredOrders.forEach((o: any) => (o.items || []).forEach((i: any) => {
      map[i.section] += getEffective(i).total;
    }));
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [filteredOrders]);

  const monthlyRevenue = useMemo(() => {
    const map: Record<string, { subtotal: number; vat: number }> = {};
    filteredOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { subtotal: 0, vat: 0 };
      (o.items || []).forEach((i: any) => {
        const e = getEffective(i);
        map[key].subtotal += e.subtotal;
        map[key].vat += e.vat;
      });
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([month, d]) => ({
      month, subtotal: Math.round(d.subtotal * 100) / 100, vat: Math.round(d.vat * 100) / 100, total: Math.round((d.subtotal + d.vat) * 100) / 100,
    }));
  }, [filteredOrders]);

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const periodLabel = period === "hoje" ? "Hoje" : period === "7d" ? "7 dias" : period === "30d" ? "30 dias" : period === "90d" ? "90 dias" : "Tudo";
    let y = await createPDFHeader(doc, "Relatório Financeiro", `Período: ${periodLabel}`);

    y = addPDFSectionTitle(doc, "Resumo Financeiro", y);
    y = runPDFTable(doc, {
      startY: y,
      head: [["Subtotal", "IVA Total", "Total c/ IVA", "Média/Pedido"]],
      body: [[`€${totals.subtotal.toFixed(2)}`, `€${totals.vat.toFixed(2)}`, `€${totals.total.toFixed(2)}`, `€${totals.avgOrder.toFixed(2)}`]],
      theme: "grid",
      ...modernTableStyles,
      bodyStyles: { ...modernTableStyles.bodyStyles, halign: "center", fontStyle: "bold" },
    }) + 10;

    if (vatBreakdown.length > 0) {
      y = addPDFSectionTitle(doc, "Discriminação de IVA", y);
      y = runPDFTable(doc, {
        startY: y,
        head: [["Taxa", "Base Tributável", "IVA", "Total"]],
        body: [
          ...vatBreakdown.map(r => [r.rate, `€${r.base.toFixed(2)}`, `€${r.vat.toFixed(2)}`, `€${r.total.toFixed(2)}`]),
          [{ content: "Total", styles: { fontStyle: "bold" } }, `€${totals.subtotal.toFixed(2)}`, `€${totals.vat.toFixed(2)}`, `€${totals.total.toFixed(2)}`],
        ],
        theme: "striped",
        ...modernTableStyles,
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
      }) + 10;
    }

    if (bySection.length > 0) {
      y = addPDFSectionTitle(doc, "Faturação por Secção", y);
      y = runPDFTable(doc, {
        startY: y,
        head: [["Secção", "Total c/ IVA"]],
        body: bySection.map(s => [s.name, `€${s.value.toFixed(2)}`]),
        theme: "striped",
        ...modernTableStyles,
        columnStyles: { 1: { halign: "right" } },
      }) + 10;
    }

    if (monthlyRevenue.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      y = addPDFSectionTitle(doc, "Evolução Mensal", y);
      runPDFTable(doc, {
        startY: y,
        head: [["Mês", "Subtotal", "IVA", "Total"]],
        body: monthlyRevenue.map(m => [m.month, `€${m.subtotal.toFixed(2)}`, `€${m.vat.toFixed(2)}`, `€${m.total.toFixed(2)}`]),
        theme: "striped",
        ...modernTableStyles,
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
      });
    }

    addPDFFooter(doc);
    downloadPDF(doc, `financeiro-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground">Financeiro</h2>
          <p className="text-sm text-muted-foreground">Resumo financeiro, IVA e faturação</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportPDF}><FileDown className="w-4 h-4 mr-1" /> PDF</Button>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {(["hoje", "7d", "30d", "90d", "all"] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${period === p ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
            {p === "hoje" ? "Hoje" : p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : p === "90d" ? "90 dias" : "Tudo"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Euro, label: "Subtotal", value: `€${totals.subtotal.toFixed(2)}`, accent: "hsl(160, 20%, 50%)" },
          { icon: Percent, label: "IVA Total", value: `€${totals.vat.toFixed(2)}`, accent: "hsl(35, 25%, 55%)" },
          { icon: TrendingUp, label: "Total c/ IVA", value: `€${totals.total.toFixed(2)}`, accent: "hsl(220, 14%, 46%)" },
          { icon: Receipt, label: "Média/Pedido", value: `€${totals.avgOrder.toFixed(2)}`, accent: "hsl(200, 18%, 55%)" },
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.accent}20` }}>
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.accent }} />
                </div>
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-xl font-heading text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading text-muted-foreground">Faturação por Secção</CardTitle></CardHeader>
          <CardContent>
            {bySection.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={bySection} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10} strokeWidth={2} stroke="hsl(220, 13%, 12%)">
                    {bySection.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading text-muted-foreground">Discriminação de IVA</CardTitle></CardHeader>
          <CardContent>
            {vatBreakdown.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border text-muted-foreground"><th className="text-left py-2 px-2">Taxa</th><th className="text-right py-2 px-2">Base Tributável</th><th className="text-right py-2 px-2">IVA</th><th className="text-right py-2 px-2">Total</th></tr></thead>
                  <tbody>
                    {vatBreakdown.map(r => (
                      <tr key={r.rate} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-2.5 px-2 text-foreground font-medium">{r.rate}</td>
                        <td className="py-2.5 px-2 text-right text-muted-foreground">€{r.base.toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-right" style={{ color: "hsl(35, 25%, 55%)" }}>€{r.vat.toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-right text-foreground">€{r.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium"><td className="py-2.5 px-2 text-foreground">Total</td><td className="py-2.5 px-2 text-right text-foreground">€{totals.subtotal.toFixed(2)}</td><td className="py-2.5 px-2 text-right" style={{ color: "hsl(35, 25%, 55%)" }}>€{totals.vat.toFixed(2)}</td><td className="py-2.5 px-2 text-right text-foreground">€{totals.total.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {monthlyRevenue.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading text-muted-foreground">Evolução Mensal de Faturação</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(220, 10%, 22%)" }} />
                <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 11 }} axisLine={{ stroke: "hsl(220, 10%, 22%)" }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `€${v.toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="subtotal" name="Subtotal" fill="hsl(220, 14%, 46%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vat" name="IVA" fill="hsl(35, 25%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
