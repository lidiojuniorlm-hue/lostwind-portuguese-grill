import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders, useProducts } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SECTIONS, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from "@/types/warehouse";
import { TrendingUp, Package, ShoppingCart, Euro, Calendar, Store, BarChart3, Download, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area, Legend } from "recharts";
import jsPDF from "jspdf";
import { runPDFTable, downloadPDF } from "@/utils/pdfHelpers";
import logoRelatorio from "@/assets/logo-relatorio.jpg";

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

export default function Relatorios() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.role, user?.id, user?.store);
  const { data: products = [] } = useProducts();
  const [period, setPeriod] = useState<"hoje" | "ontem" | "7d" | "30d" | "90d" | "all">("30d");

  // Items measured by weight/volume count as 1 unit per line (the qty is the weight, not the count)
  const WEIGHT_UNITS = new Set(["kg", "g", "l", "ml", "lt", "gr"]);
  const isWeightUnit = (unit: string) => WEIGHT_UNITS.has((unit || "").toLowerCase().trim());
  const itemUnitCount = (item: any) => (isWeightUnit(item.unit) ? 1 : Number(item.actual_qty ?? item.qty));
  const [selectedStore, setSelectedStore] = useState<string>("todas");

  const stores = useMemo(() => Array.from(new Set(orders.map((o: any) => o.store_name))).sort(), [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (selectedStore !== "todas") result = result.filter((o: any) => o.store_name === selectedStore);
    if (period === "hoje") {
      const today = new Date().toLocaleDateString("pt-PT");
      result = result.filter((o: any) => new Date(o.created_at).toLocaleDateString("pt-PT") === today);
    } else if (period === "ontem") {
      const y = new Date(); y.setDate(y.getDate() - 1);
      const yest = y.toLocaleDateString("pt-PT");
      result = result.filter((o: any) => new Date(o.created_at).toLocaleDateString("pt-PT") === yest);
    } else if (period !== "all") {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((o: any) => new Date(o.created_at) >= cutoff);
    }
    return result;
  }, [orders, period, selectedStore]);

  const totalOrders = filteredOrders.length;
  const totalItems = filteredOrders.reduce((s: number, o: any) => s + (o.items || []).reduce((si: number, i: any) => si + itemUnitCount(i), 0), 0);
  const totalSubtotal = filteredOrders.reduce((s: number, o: any) => s + (o.items || []).reduce((si: number, i: any) => si + getEffective(i).subtotal, 0), 0);
  const totalVat = filteredOrders.reduce((s: number, o: any) => s + (o.items || []).reduce((si: number, i: any) => si + getEffective(i).vat, 0), 0);
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
      const e = getEffective(i);
      if (!map[i.product_id]) map[i.product_id] = { name: i.product_name, qty: 0, total: 0, section: i.section };
      map[i.product_id].qty += itemUnitCount(i);
      map[i.product_id].total += e.subtotal;
    }));
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [filteredOrders]);

  const bySection = useMemo(() => {
    const map: Record<string, { qty: number; total: number; vat: number }> = {};
    SECTIONS.forEach(s => { map[s] = { qty: 0, total: 0, vat: 0 }; });
    filteredOrders.forEach((o: any) => (o.items || []).forEach((i: any) => {
      const e = getEffective(i);
      if (map[i.section]) {
        map[i.section].qty += itemUnitCount(i);
        map[i.section].total += e.subtotal;
        map[i.section].vat += e.vat;
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
      (o.items || []).forEach((i: any) => {
        const e = getEffective(i);
        map[o.store_name].total += e.subtotal;
        map[o.store_name].vat += e.vat;
        map[o.store_name].items += itemUnitCount(i);
      });
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
      (o.items || []).forEach((i: any) => { map[key].total += getEffective(i).total; });
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
      const sub = (o.items || []).reduce((s: number, i: any) => s + getEffective(i).subtotal, 0);
      const vat = (o.items || []).reduce((s: number, i: any) => s + getEffective(i).vat, 0);
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

  // Load logo as base64
  const loadLogoBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => resolve("");
      img.src = logoRelatorio;
    });
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const periodLabel = period === "hoje" ? "Hoje" : period === "ontem" ? "Ontem" : period === "7d" ? "7 dias" : period === "30d" ? "30 dias" : period === "90d" ? "90 dias" : "Tudo";
    const logoB64 = await loadLogoBase64();

    const brandDark = [30, 58, 82] as [number, number, number];   // dark teal
    const brandAccent = [195, 57, 43] as [number, number, number]; // red
    const brandLight = [41, 128, 185] as [number, number, number]; // blue
    const gray50 = [249, 250, 251] as [number, number, number];
    const gray200 = [229, 231, 235] as [number, number, number];
    const gray600 = [75, 85, 99] as [number, number, number];
    const gray900 = [17, 24, 39] as [number, number, number];
    const white = [255, 255, 255] as [number, number, number];

    // === HEADER ===
    doc.setFillColor(...brandDark);
    doc.rect(0, 0, pw, 38, "F");

    // Accent line
    doc.setFillColor(...brandAccent);
    doc.rect(0, 38, pw, 1.5, "F");

    if (logoB64) {
      try { doc.addImage(logoB64, "JPEG", 14, 6, 24, 24, undefined, "FAST"); } catch {}
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...white);
    doc.text("Relatório de KPI — Armazém", 44, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(180, 210, 230);
    doc.text(`Lost Wind Churrasqueira  ·  ${periodLabel}${selectedStore !== "todas" ? ` · ${selectedStore}` : ""}`, 44, 23);

    doc.setFontSize(7.5);
    doc.setTextColor(140, 180, 210);
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-PT")} às ${new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`, 44, 29);

    let y = 48;

    // === KPI CARDS (3x2 grid) ===
    const kpiData = [
      { label: "Total Pedidos", value: totalOrders.toString(), color: brandDark },
      { label: "Itens Movimentados", value: totalItems.toString(), color: brandLight },
      { label: "Faturação Total", value: `€${totalValue.toFixed(2)}`, color: brandAccent },
      { label: "Média por Pedido", value: `€${avgOrderValue.toFixed(2)}`, color: brandDark },
      { label: "Taxa de Entrega", value: `${fulfillmentRate}%`, color: [39, 174, 96] as [number, number, number] },
      { label: "Taxa Cancelamento", value: `${cancelRate}%`, color: brandAccent },
    ];

    const cardW = (pw - 28 - 12) / 3;
    const cardH = 22;

    kpiData.forEach((kpi, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const cx = 14 + col * (cardW + 6);
      const cy = y + row * (cardH + 5);

      // Card bg
      doc.setFillColor(...gray50);
      doc.roundedRect(cx, cy, cardW, cardH, 2, 2, "F");

      // Left accent bar
      doc.setFillColor(...(kpi.color as [number, number, number]));
      doc.rect(cx, cy + 3, 1.2, cardH - 6, "F");

      // Label
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...gray600);
      doc.text(kpi.label, cx + 5, cy + 8);

      // Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...gray900);
      doc.text(kpi.value, cx + 5, cy + 17);
    });

    y += 2 * (cardH + 5) + 8;

    // === SECTION: Status dos Pedidos ===
    const statusData = (["pendente", "em_preparacao", "pronto", "entregue", "cancelado"] as OrderStatus[])
      .map(s => ({ status: ORDER_STATUS_LABELS[s], count: ordersByStatus[s] || 0, pct: totalOrders ? (((ordersByStatus[s] || 0) / totalOrders) * 100).toFixed(1) : "0" }))
      .filter(d => d.count > 0);

    if (statusData.length > 0) {
      y = drawSectionTitle(doc, "Distribuição por Estado", y, brandDark);
      y = runPDFTable(doc, {
        startY: y,
        head: [["Estado", "Quantidade", "Percentagem"]],
        body: statusData.map(d => [d.status, d.count.toString(), `${d.pct}%`]),
        theme: "grid",
        headStyles: { fillColor: brandDark, fontSize: 8, fontStyle: "bold", textColor: white, cellPadding: 3.5 },
        bodyStyles: { fontSize: 8, textColor: gray900, cellPadding: 3 },
        alternateRowStyles: { fillColor: gray50 },
        styles: { lineColor: gray200, lineWidth: 0.3 },
        columnStyles: { 1: { halign: "center" }, 2: { halign: "center" } },
        margin: { left: 14, right: 14 },
      }) + 10;
    }

    // === SECTION: Faturação por Secção ===
    const sectionRows = SECTIONS.map(s => [
      s, bySection[s].qty.toString(), `€${bySection[s].total.toFixed(2)}`, `€${bySection[s].vat.toFixed(2)}`, `€${(bySection[s].total + bySection[s].vat).toFixed(2)}`,
    ]).filter(r => r[1] !== "0");

    if (sectionRows.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      y = drawSectionTitle(doc, "Faturação por Secção", y, brandDark);

      // Totals row
      const secTotalSub = sectionRows.reduce((s, r) => s + parseFloat(r[2].replace("€", "")), 0);
      const secTotalVat = sectionRows.reduce((s, r) => s + parseFloat(r[3].replace("€", "")), 0);
      const secTotal = sectionRows.reduce((s, r) => s + parseFloat(r[4].replace("€", "")), 0);
      const allRows = [...sectionRows, [{ content: "TOTAL", styles: { fontStyle: "bold" } }, { content: sectionRows.reduce((s, r) => s + parseInt(r[1]), 0).toString(), styles: { fontStyle: "bold", halign: "center" } }, { content: `€${secTotalSub.toFixed(2)}`, styles: { fontStyle: "bold", halign: "right" } }, { content: `€${secTotalVat.toFixed(2)}`, styles: { fontStyle: "bold", halign: "right" } }, { content: `€${secTotal.toFixed(2)}`, styles: { fontStyle: "bold", halign: "right" } }]];

      y = runPDFTable(doc, {
        startY: y,
        head: [["Secção", "Qtd", "Subtotal", "IVA", "Total"]],
        body: allRows as any,
        theme: "grid",
        headStyles: { fillColor: brandDark, fontSize: 8, fontStyle: "bold", textColor: white, cellPadding: 3.5 },
        bodyStyles: { fontSize: 8, textColor: gray900, cellPadding: 3 },
        alternateRowStyles: { fillColor: gray50 },
        styles: { lineColor: gray200, lineWidth: 0.3 },
        columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
        margin: { left: 14, right: 14 },
      }) + 10;
    }

    // === SECTION: Top 10 Produtos ===
    if (topProducts.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      y = drawSectionTitle(doc, "Top 10 Produtos Mais Pedidos", y, brandDark);

      y = runPDFTable(doc, {
        startY: y,
        head: [["#", "Produto", "Secção", "Qtd", "Total"]],
        body: topProducts.map((p, i) => [(i + 1).toString(), p.name, p.section, p.qty.toString(), `€${p.total.toFixed(2)}`]),
        theme: "grid",
        headStyles: { fillColor: brandLight, fontSize: 8, fontStyle: "bold", textColor: white, cellPadding: 3.5 },
        bodyStyles: { fontSize: 8, textColor: gray900, cellPadding: 3 },
        alternateRowStyles: { fillColor: gray50 },
        styles: { lineColor: gray200, lineWidth: 0.3 },
        columnStyles: { 0: { halign: "center", cellWidth: 12 }, 3: { halign: "center" }, 4: { halign: "right" } },
        margin: { left: 14, right: 14 },
      }) + 10;
    }

    // === SECTION: Faturação por Loja ===
    if (byStore.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      y = drawSectionTitle(doc, "Faturação por Loja", y, brandDark);

      // Horizontal bar chart drawn manually
      const maxStoreVal = Math.max(...byStore.map(([, d]) => d.total + d.vat), 1);
      const barMaxW = pw - 28 - 60;

      byStore.forEach(([name, d], i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        const total = d.total + d.vat;
        const barW = (total / maxStoreVal) * barMaxW;

        // Label
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...gray900);
        doc.text(name, 14, y + 5);

        // Bar bg
        doc.setFillColor(...gray200);
        doc.roundedRect(60, y + 1, barMaxW, 5, 1, 1, "F");

        // Bar fill
        doc.setFillColor(...(i % 2 === 0 ? brandDark : brandLight));
        if (barW > 2) doc.roundedRect(60, y + 1, barW, 5, 1, 1, "F");

        // Value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(`€${total.toFixed(2)}  (${d.count} ped.)`, 60 + barMaxW + 2, y + 5);

        y += 10;
      });

      y += 8;
    }

    // === SECTION: Dados por Loja (table) ===
    if (byStore.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      y = drawSectionTitle(doc, "Detalhe por Loja", y, brandDark);

      const storeTotalSub = byStore.reduce((s, [, d]) => s + d.total, 0);
      const storeTotalVat = byStore.reduce((s, [, d]) => s + d.vat, 0);

      y = runPDFTable(doc, {
        startY: y,
        head: [["Loja", "Pedidos", "Itens", "Subtotal", "IVA", "Total"]],
        body: [
          ...byStore.map(([name, d]) => [name, d.count.toString(), d.items.toString(), `€${d.total.toFixed(2)}`, `€${d.vat.toFixed(2)}`, `€${(d.total + d.vat).toFixed(2)}`]),
          [{ content: "TOTAL", styles: { fontStyle: "bold" } }, { content: byStore.reduce((s, [, d]) => s + d.count, 0).toString(), styles: { fontStyle: "bold", halign: "center" } }, { content: byStore.reduce((s, [, d]) => s + d.items, 0).toString(), styles: { fontStyle: "bold", halign: "center" } }, { content: `€${storeTotalSub.toFixed(2)}`, styles: { fontStyle: "bold", halign: "right" } }, { content: `€${storeTotalVat.toFixed(2)}`, styles: { fontStyle: "bold", halign: "right" } }, { content: `€${(storeTotalSub + storeTotalVat).toFixed(2)}`, styles: { fontStyle: "bold", halign: "right" } }],
        ] as any,
        theme: "grid",
        headStyles: { fillColor: brandDark, fontSize: 8, fontStyle: "bold", textColor: white, cellPadding: 3.5 },
        bodyStyles: { fontSize: 8, textColor: gray900, cellPadding: 3 },
        alternateRowStyles: { fillColor: gray50 },
        styles: { lineColor: gray200, lineWidth: 0.3 },
        columnStyles: { 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
        margin: { left: 14, right: 14 },
      }) + 10;
    }

    // === FOOTER ===
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      // Bottom bar
      doc.setFillColor(...brandDark);
      doc.rect(0, ph - 16, pw, 16, "F");
      doc.setFillColor(...brandAccent);
      doc.rect(0, ph - 16, pw, 0.8, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...white);
      doc.text("Lost Wind Churrasqueira — Documento gerado automaticamente", 14, ph - 7);
      doc.text(`Página ${i} de ${pageCount}`, pw - 14, ph - 7, { align: "right" });
    }

    downloadPDF(doc, `relatorio-kpi-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  function drawSectionTitle(doc: jsPDF, title: string, y: number, color: [number, number, number]): number {
    doc.setFillColor(...color);
    doc.rect(14, y, 3, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(title, 20, y + 5);
    doc.setDrawColor(229, 231, 235);
    doc.line(14, y + 8, doc.internal.pageSize.getWidth() - 14, y + 8);
    return y + 12;
  }

  const tooltipStyle = {
    background: "hsl(220, 13%, 12%)",
    border: "1px solid hsl(220, 10%, 22%)",
    borderRadius: 10,
    fontSize: 12,
    color: "hsl(220, 10%, 85%)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground tracking-wide">Relatórios</h2>
          <p className="text-sm text-muted-foreground font-normal">Análise completa de movimentações e desempenho</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}><FileDown className="w-4 h-4 mr-1" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {(["hoje", "ontem", "7d", "30d", "90d", "all"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-normal ${period === p ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
              {p === "hoje" ? "Hoje" : p === "ontem" ? "Ontem" : p === "7d" ? "7 dias" : p === "30d" ? "30 dias" : p === "90d" ? "90 dias" : "Tudo"}
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

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: ShoppingCart, label: "Pedidos", value: totalOrders.toString(), accent: "hsl(220, 14%, 46%)" },
          { icon: Package, label: "Itens", value: totalItems.toString(), accent: "hsl(200, 18%, 55%)" },
          { icon: Euro, label: "Total c/ IVA", value: `€${totalValue.toFixed(2)}`, accent: "hsl(160, 20%, 50%)" },
          { icon: BarChart3, label: "Média/Pedido", value: `€${avgOrderValue.toFixed(2)}`, accent: "hsl(35, 25%, 55%)" },
          { icon: TrendingUp, label: "Taxa Entrega", value: `${fulfillmentRate}%`, accent: "hsl(160, 20%, 50%)" },
          { icon: ShoppingCart, label: "Cancelamentos", value: `${cancelRate}%`, accent: "hsl(0, 15%, 50%)" },
        ].map((kpi, idx) => (
          <Card key={idx} className="bg-card border-border hover:border-border/80 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.accent}20` }}>
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.accent }} />
                </div>
              </div>
              <p className="text-xl font-heading text-foreground tracking-wide">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading tracking-wide text-muted-foreground">Distribuição por Estado</CardTitle></CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10} strokeWidth={2} stroke="hsl(220, 13%, 12%)">
                    {statusChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading tracking-wide text-muted-foreground">Faturação por Secção</CardTitle></CardHeader>
          <CardContent>
            {sectionChartData.every(d => d.subtotal === 0) ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 18%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(220, 10%, 22%)" }} />
                  <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(220, 10%, 22%)" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `€${v.toFixed(2)}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="subtotal" name="Subtotal" fill="hsl(220, 14%, 46%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="iva" name="IVA" fill="hsl(35, 25%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading tracking-wide text-muted-foreground">Faturação por Loja</CardTitle></CardHeader>
          <CardContent>
            {storeChartData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={storeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 18%)" />
                  <XAxis type="number" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(220, 10%, 22%)" }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 10 }} width={120} axisLine={{ stroke: "hsl(220, 10%, 22%)" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `€${v.toFixed(2)}`} />
                  <Bar dataKey="total" name="Total" fill="hsl(200, 18%, 55%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-heading tracking-wide text-muted-foreground">Tendência de Pedidos</CardTitle></CardHeader>
          <CardContent>
            {dailyTrend.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8 font-normal">Sem dados</p> : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 18%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 9 }} axisLine={{ stroke: "hsl(220, 10%, 22%)" }} />
                  <YAxis tick={{ fill: "hsl(220, 10%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(220, 10%, 22%)" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <defs>
                    <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220, 14%, 46%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(220, 14%, 46%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="total" name="Total €" stroke="hsl(220, 14%, 46%)" fill="url(#gradientTotal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      </div>


      <Card className="bg-card border-border">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-heading tracking-wide text-muted-foreground">Top 10 Produtos</CardTitle></CardHeader>
        <CardContent>
          {topProducts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4 font-normal">Sem dados</p> : (
            <div className="overflow-x-auto"><table className="w-full text-xs">
              <thead><tr className="border-b border-border text-muted-foreground"><th className="text-left py-2 px-2">#</th><th className="text-left py-2 px-2">Produto</th><th className="text-left py-2 px-2">Secção</th><th className="text-right py-2 px-2">Qtd</th><th className="text-right py-2 px-2">Total</th></tr></thead>
              <tbody>{topProducts.map((p, idx) => (
                <tr key={p.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors"><td className="py-2.5 px-2 text-muted-foreground">{idx + 1}</td><td className="py-2.5 px-2 text-foreground font-medium">{p.name}</td><td className="py-2.5 px-2 text-muted-foreground">{p.section}</td><td className="py-2.5 px-2 text-right">{p.qty}</td><td className="py-2.5 px-2 text-right font-medium">€{p.total.toFixed(2)}</td></tr>
              ))}</tbody>
            </table></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
