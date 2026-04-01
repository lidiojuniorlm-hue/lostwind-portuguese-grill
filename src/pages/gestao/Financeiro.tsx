import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SECTIONS } from "@/types/warehouse";
import { Euro, TrendingUp, Receipt, Percent, Calendar, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend } from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { createPDFHeader, addPDFFooter } from "@/utils/pdfHelpers";

const CHART_COLORS = ["hsl(0,78%,50%)", "hsl(25,95%,53%)", "hsl(40,100%,60%)", "hsl(200,70%,50%)", "hsl(150,60%,45%)", "hsl(280,60%,55%)", "hsl(90,60%,45%)"];

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
      const line = Number(i.unit_price) * Number(i.qty);
      subtotal += line;
      vat += line * (Number(i.vat_rate) / 100);
    }));
    return { subtotal, vat, total: subtotal + vat, avgOrder: filteredOrders.length ? (subtotal + vat) / filteredOrders.length : 0 };
  }, [filteredOrders]);

  const vatBreakdown = useMemo(() => {
    const map: Record<number, { base: number; vat: number }> = {};
    filteredOrders.forEach((o: any) => (o.items || []).forEach((i: any) => {
      const rate = Number(i.vat_rate);
      if (!map[rate]) map[rate] = { base: 0, vat: 0 };
      const line = Number(i.unit_price) * Number(i.qty);
      map[rate].base += line;
      map[rate].vat += line * (rate / 100);
    }));
    return Object.entries(map).map(([rate, d]) => ({ rate: `${rate}%`, base: d.base, vat: d.vat, total: d.base + d.vat }));
  }, [filteredOrders]);

  const bySection = useMemo(() => {
    const map: Record<string, number> = {};
    SECTIONS.forEach(s => { map[s] = 0; });
    filteredOrders.forEach((o: any) => (o.items || []).forEach((i: any) => { map[i.section] += Number(i.unit_price) * Number(i.qty) * (1 + Number(i.vat_rate) / 100); }));
    return Object.entries(map).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [filteredOrders]);

  const monthlyRevenue = useMemo(() => {
    const map: Record<string, { subtotal: number; vat: number }> = {};
    filteredOrders.forEach((o: any) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { subtotal: 0, vat: 0 };
      (o.items || []).forEach((i: any) => {
        const line = Number(i.unit_price) * Number(i.qty);
        map[key].subtotal += line;
        map[key].vat += line * (Number(i.vat_rate) / 100);
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

    // KPIs
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Financeiro", 14, y);
    y += 6;

    (doc as any).autoTable({
      startY: y,
      head: [["Subtotal", "IVA Total", "Total c/ IVA", "Média/Pedido"]],
      body: [[`€${totals.subtotal.toFixed(2)}`, `€${totals.vat.toFixed(2)}`, `€${totals.total.toFixed(2)}`, `€${totals.avgOrder.toFixed(2)}`]],
      theme: "grid",
      headStyles: { fillColor: [196, 57, 43], fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 9, halign: "center", fontStyle: "bold" },
      margin: { left: 14, right: 14 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // VAT breakdown
    if (vatBreakdown.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Discriminação de IVA", 14, y);
      y += 4;

      (doc as any).autoTable({
        startY: y,
        head: [["Taxa", "Base Tributável", "IVA", "Total"]],
        body: [
          ...vatBreakdown.map(r => [r.rate, `€${r.base.toFixed(2)}`, `€${r.vat.toFixed(2)}`, `€${r.total.toFixed(2)}`]),
          [{ content: "Total", styles: { fontStyle: "bold" } }, `€${totals.subtotal.toFixed(2)}`, `€${totals.vat.toFixed(2)}`, `€${totals.total.toFixed(2)}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [196, 57, 43], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // By section
    if (bySection.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Faturação por Secção", 14, y);
      y += 4;

      (doc as any).autoTable({
        startY: y,
        head: [["Secção", "Total c/ IVA"]],
        body: bySection.map(s => [s.name, `€${s.value.toFixed(2)}`]),
        theme: "striped",
        headStyles: { fillColor: [196, 57, 43], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 1: { halign: "right" } },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Monthly revenue
    if (monthlyRevenue.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Evolução Mensal", 14, y);
      y += 4;

      (doc as any).autoTable({
        startY: y,
        head: [["Mês", "Subtotal", "IVA", "Total"]],
        body: monthlyRevenue.map(m => [m.month, `€${m.subtotal.toFixed(2)}`, `€${m.vat.toFixed(2)}`, `€${m.total.toFixed(2)}`]),
        theme: "striped",
        headStyles: { fillColor: [196, 57, 43], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
        margin: { left: 14, right: 14 },
      });
    }

    addPDFFooter(doc);
    doc.save(`financeiro-${new Date().toISOString().slice(0, 10)}.pdf`);
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
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Euro className="w-4 h-4 text-green-500" /><span className="text-xs text-muted-foreground">Subtotal</span></div><p className="text-xl font-heading text-foreground">€{totals.subtotal.toFixed(2)}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Percent className="w-4 h-4 text-yellow-500" /><span className="text-xs text-muted-foreground">IVA Total</span></div><p className="text-xl font-heading text-foreground">€{totals.vat.toFixed(2)}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Total c/ IVA</span></div><p className="text-xl font-heading text-foreground">€{totals.total.toFixed(2)}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Receipt className="w-4 h-4 text-blue-500" /><span className="text-xs text-muted-foreground">Média/Pedido</span></div><p className="text-xl font-heading text-foreground">€{totals.avgOrder.toFixed(2)}</p></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading">Faturação por Secção</CardTitle></CardHeader>
          <CardContent>
            {bySection.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={bySection} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {bySection.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading">Discriminação de IVA</CardTitle></CardHeader>
          <CardContent>
            {vatBreakdown.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border text-muted-foreground"><th className="text-left py-2 px-2">Taxa</th><th className="text-right py-2 px-2">Base Tributável</th><th className="text-right py-2 px-2">IVA</th><th className="text-right py-2 px-2">Total</th></tr></thead>
                  <tbody>
                    {vatBreakdown.map(r => (
                      <tr key={r.rate} className="border-b border-border/50">
                        <td className="py-2 px-2 text-foreground font-medium">{r.rate}</td>
                        <td className="py-2 px-2 text-right text-muted-foreground">€{r.base.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right text-yellow-400">€{r.vat.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right text-foreground">€{r.total.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium"><td className="py-2 px-2 text-foreground">Total</td><td className="py-2 px-2 text-right text-foreground">€{totals.subtotal.toFixed(2)}</td><td className="py-2 px-2 text-right text-yellow-400">€{totals.vat.toFixed(2)}</td><td className="py-2 px-2 text-right text-foreground">€{totals.total.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {monthlyRevenue.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading">Evolução Mensal de Faturação</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(0,0%,60%)", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(0,0%,60%)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,18%)", borderRadius: 8, fontSize: 12, color: "hsl(0,0%,90%)" }} formatter={(v: number) => `€${v.toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="subtotal" name="Subtotal" fill="hsl(0,78%,50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vat" name="IVA" fill="hsl(40,100%,60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
