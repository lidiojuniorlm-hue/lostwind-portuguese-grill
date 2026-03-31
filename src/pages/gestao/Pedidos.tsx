import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders, useOrderMutations, useUsers, useLogActivity } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus, SECTIONS } from "@/types/warehouse";
import { ChevronDown, ChevronUp, Printer, FileText, Save } from "lucide-react";
import { toast } from "sonner";

interface EditItem {
  id: string;
  product_id: string;
  product_name: string;
  section: string;
  unit: string;
  qty: number;
  unit_price: number;
  vat_rate: number;
  actual_qty: number | null;
  actual_price: number | null;
  actual_vat: number | null;
}

export default function Pedidos() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.role, user?.id, user?.store);
  const { data: users = [] } = useUsers();
  const { updateOrderStatus, updateOrderItems } = useOrderMutations();
  const logActivity = useLogActivity();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");
  const [editingItems, setEditingItems] = useState<Record<string, EditItem[]>>({});

  if (!user) return null;

  const myOrders = user.role === "funcionario"
    ? orders.filter((o: any) => o.created_by === user.id)
    : orders;

  const filteredOrders = filterStatus === "todos"
    ? myOrders
    : myOrders.filter((o: any) => o.status === filterStatus);

  const sortedOrders = [...filteredOrders].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // When moving to em_preparacao, auto-fill actual values from product defaults
    if (newStatus === "em_preparacao") {
      const order = orders.find((o: any) => o.id === orderId);
      if (order) {
        const items = (order as any).items || [];
        const autoFillItems = items.map((i: any) => ({
          id: i.id,
          actual_qty: i.actual_qty ?? Number(i.qty),
          actual_price: i.actual_price ?? Number(i.unit_price),
          actual_vat: i.actual_vat ?? Number(i.vat_rate),
        }));
        await updateOrderItems.mutateAsync({ items: autoFillItems });
      }
    }
    await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
    logActivity.mutate({
      user_id: user.id,
      user_name: user.name,
      action: `Estado alterado para ${ORDER_STATUS_LABELS[newStatus]}`,
      details: `Pedido ${orderId.slice(0, 8)}`,
    });
    toast.success(`Estado atualizado: ${ORDER_STATUS_LABELS[newStatus]}`);
  };

  const statusFlow: OrderStatus[] = ["pendente", "em_preparacao", "pronto", "entregue"];

  const canEditActuals = (status: OrderStatus) =>
    (user.role === "armazem" || user.role === "admin") &&
    (status === "em_preparacao" || status === "pronto");

  const startEditing = (orderId: string, items: any[]) => {
    setEditingItems((prev) => ({
      ...prev,
      [orderId]: items.map((i: any) => ({
        ...i,
        actual_qty: i.actual_qty ?? Number(i.qty),
        actual_price: i.actual_price ?? Number(i.unit_price),
        actual_vat: i.actual_vat ?? Number(i.vat_rate),
      })),
    }));
  };

  const updateEditItem = (orderId: string, itemId: string, field: "actual_qty" | "actual_price" | "actual_vat", value: number) => {
    setEditingItems((prev) => ({
      ...prev,
      [orderId]: (prev[orderId] || []).map((i) =>
        i.id === itemId ? { ...i, [field]: value } : i
      ),
    }));
  };

  const saveEditing = async (orderId: string) => {
    const items = editingItems[orderId];
    if (!items) return;
    await updateOrderItems.mutateAsync({
      items: items.map((i) => ({
        id: i.id,
        actual_qty: i.actual_qty ?? undefined,
        actual_price: i.actual_price ?? undefined,
        actual_vat: i.actual_vat ?? undefined,
      })),
    });
    setEditingItems((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
    toast.success("Valores atualizados com sucesso!");
  };

  // Print: Guia de Transporte — modern, detailed, with signatures
  const handlePrintGuia = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return;
    const createdByUser = users?.find((u: any) => u.id === (order as any).created_by);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const items = ((order as any).items || []).sort((a: any, b: any) => a.product_name.localeCompare(b.product_name));
    const totalItems = items.reduce((s: number, i: any) => s + Number(i.actual_qty ?? i.qty), 0);

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Guia de Transporte — ${(order as any).store_name}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',Arial,sans-serif; padding:20px; color:#1a1a1a; font-size:9px; }
        .header { text-align:center; border-bottom:3px solid #c0392b; padding-bottom:10px; margin-bottom:12px; }
        .header h1 { font-size:16px; font-weight:800; color:#c0392b; letter-spacing:2px; text-transform:uppercase; }
        .header p { font-size:8px; color:#666; margin-top:2px; }
        .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:12px; font-size:9px; }
        .info-box { background:#f8f8f8; border:1px solid #e0e0e0; border-radius:4px; padding:6px 8px; }
        .info-box label { font-size:7px; text-transform:uppercase; color:#888; font-weight:600; letter-spacing:0.5px; display:block; margin-bottom:1px; }
        .info-box span { font-weight:600; color:#333; }
        table { width:100%; border-collapse:collapse; margin-bottom:12px; }
        th { background:#c0392b; color:#fff; padding:4px 6px; font-size:8px; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
        td { padding:3px 6px; border-bottom:1px solid #eee; font-size:8px; }
        tr:nth-child(even) { background:#fafafa; }
        .sig-section { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:16px; padding-top:10px; border-top:1px solid #ddd; }
        .sig-box { text-align:center; }
        .sig-box p { font-size:8px; color:#666; margin-bottom:30px; }
        .sig-line { border-top:1px solid #333; padding-top:3px; font-size:8px; font-weight:600; }
        .footer { text-align:center; margin-top:12px; font-size:7px; color:#999; border-top:1px solid #eee; padding-top:6px; }
        @media print { body { padding:10px; } }
      </style></head>
      <body>
        <div class="header">
          <h1>Guia de Transporte / Remessa</h1>
          <p>Lost Wind Churrasqueira — Documento de Acompanhamento de Mercadorias</p>
        </div>
        <div class="info-grid">
          <div class="info-box"><label>N.º Guia</label><span>GT-${(order as any).id.slice(0, 8).toUpperCase()}</span></div>
          <div class="info-box"><label>Data / Hora</label><span>${new Date().toLocaleDateString("pt-PT")} ${new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span></div>
          <div class="info-box"><label>Origem</label><span>Armazém Central</span></div>
          <div class="info-box"><label>Destino</label><span>${(order as any).store_name}</span></div>
          <div class="info-box"><label>Solicitado por</label><span>${createdByUser?.name || "—"}</span></div>
          <div class="info-box"><label>N.º Pedido</label><span>${(order as any).id.slice(0, 8).toUpperCase()}</span></div>
        </div>
        <table>
          <thead><tr><th style="text-align:left;">Produto</th><th style="text-align:center;">Qtd</th><th style="text-align:center;">Unidade</th><th style="text-align:center;">Secção</th></tr></thead>
          <tbody>${items.map((item: any) => `<tr><td>${item.product_name}</td><td style="text-align:center;">${item.actual_qty ?? item.qty}</td><td style="text-align:center;">${item.unit}</td><td style="text-align:center;">${item.section}</td></tr>`).join("")}
          <tr style="background:#f0f0f0;font-weight:600;"><td>TOTAL</td><td style="text-align:center;">${totalItems}</td><td colspan="2"></td></tr>
          </tbody>
        </table>
        ${(order as any).notes ? `<p style="font-size:8px;margin-bottom:8px;"><strong>Observações:</strong> ${(order as any).notes}</p>` : ""}
        <div class="sig-section">
          <div class="sig-box"><p>Responsável do Armazém</p><div class="sig-line">Assinatura / Carimbo</div></div>
          <div class="sig-box"><p>Transportador / Condutor</p><div class="sig-line">Assinatura / Carimbo</div></div>
        </div>
        <div class="footer">Documento gerado automaticamente pelo sistema Lost Wind — ${new Date().toLocaleDateString("pt-PT")} ${new Date().toLocaleTimeString("pt-PT")}</div>
        <script>window.onload=function(){window.print();}<\/script>
      </body></html>`);
    printWindow.document.close();
  };

  // Print: Conference sheet with checkboxes, smaller fonts, fit one page
  // When pronto/entregue and has actuals, show filled values
  const handlePrint = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const items = ((order as any).items || []).sort((a: any, b: any) => a.product_name.localeCompare(b.product_name));
    const isProntoOrEntregue = (order as any).status === "pronto" || (order as any).status === "entregue";
    const hasActuals = items.some((i: any) => i.actual_price != null);
    const showActuals = isProntoOrEntregue && hasActuals;

    const totalWithVat = showActuals
      ? items.reduce((s: number, i: any) => {
          const price = Number(i.actual_price) || Number(i.unit_price);
          const qty = Number(i.actual_qty) || Number(i.qty);
          const vat = Number(i.actual_vat) || Number(i.vat_rate);
          return s + price * qty * (1 + vat / 100);
        }, 0)
      : 0;

    const sectionsHtml = SECTIONS.filter((s) => items.some((i: any) => i.section === s)).map((section) => {
      const sectionItems = items.filter((i: any) => i.section === section);
      const headers = showActuals
        ? `<th style="padding:2px 4px;border:1px solid #ccc;text-align:left;font-size:7px;">✓</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:left;font-size:7px;">Produto</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:center;font-size:7px;">Qtd Pedida</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:center;font-size:7px;">Qtd Real</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:center;font-size:7px;">Preço Un.</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:center;font-size:7px;">Total c/IVA</th>`
        : `<th style="padding:2px 4px;border:1px solid #ccc;text-align:left;font-size:7px;">✓</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:left;font-size:7px;">Produto</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:center;font-size:7px;">Qtd Pedida</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:center;font-size:7px;">Qtd Real</th>
           <th style="padding:2px 4px;border:1px solid #ccc;text-align:center;font-size:7px;">Peso</th>`;

      const rows = sectionItems.map((item: any) => {
        if (showActuals) {
          const price = Number(item.actual_price) || Number(item.unit_price);
          const qty = Number(item.actual_qty) || Number(item.qty);
          const vat = Number(item.actual_vat) || Number(item.vat_rate);
          const lineTotal = price * qty * (1 + vat / 100);
          return `<tr>
            <td style="padding:2px 4px;border:1px solid #eee;text-align:center;width:18px;"><div style="width:10px;height:10px;border:1px solid #999;border-radius:2px;"></div></td>
            <td style="padding:2px 4px;border:1px solid #eee;font-size:7px;">${item.product_name}</td>
            <td style="padding:2px 4px;border:1px solid #eee;text-align:center;font-size:7px;">${item.qty} ${item.unit}</td>
            <td style="padding:2px 4px;border:1px solid #eee;text-align:center;font-size:7px;">${qty} ${item.unit}</td>
            <td style="padding:2px 4px;border:1px solid #eee;text-align:center;font-size:7px;">€${price.toFixed(2)}</td>
            <td style="padding:2px 4px;border:1px solid #eee;text-align:center;font-size:7px;font-weight:600;">€${lineTotal.toFixed(2)}</td>
          </tr>`;
        }
        return `<tr>
          <td style="padding:2px 4px;border:1px solid #eee;text-align:center;width:18px;"><div style="width:10px;height:10px;border:1px solid #999;border-radius:2px;"></div></td>
          <td style="padding:2px 4px;border:1px solid #eee;font-size:7px;">${item.product_name}</td>
          <td style="padding:2px 4px;border:1px solid #eee;text-align:center;font-size:7px;">${item.qty} ${item.unit}</td>
          <td style="padding:2px 4px;border:1px solid #eee;text-align:center;font-size:7px;min-width:40px;">&nbsp;</td>
          <td style="padding:2px 4px;border:1px solid #eee;text-align:center;font-size:7px;min-width:40px;">&nbsp;</td>
        </tr>`;
      }).join("");

      return `<div style="margin-bottom:6px;">
        <div style="font-size:8px;font-weight:700;color:#b45309;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px;">${section}</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#f5f5f5;">${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    }).join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Pedido ${(order as any).store_name}</title>
      <style>
        @page { size:A4; margin:8mm; }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',Arial,sans-serif; padding:8px; color:#333; font-size:8px; }
      </style></head>
      <body>
        <div style="text-align:center;margin-bottom:8px;">
          <div style="font-size:14px;font-weight:800;letter-spacing:2px;">LOST WIND CHURRASQUEIRA</div>
          <div style="font-size:9px;color:#666;">Lista de Conferência — ${(order as any).store_name}</div>
          <div style="font-size:7px;color:#999;">${new Date((order as any).created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })} · Pedido ${(order as any).id.slice(0, 8).toUpperCase()}</div>
        </div>
        ${sectionsHtml}
        ${showActuals ? `<div style="text-align:right;font-size:10px;font-weight:700;margin-top:6px;padding-top:4px;border-top:2px solid #333;">Total c/ IVA: €${totalWithVat.toFixed(2)}</div>` : ""}
        ${(order as any).notes ? `<p style="margin-top:4px;font-size:7px;"><strong>Notas:</strong> ${(order as any).notes}</p>` : ""}
        <script>window.onload=function(){window.print();}<\/script>
      </body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground">Pedidos</h2>
        <p className="text-sm text-muted-foreground">{user.role === "funcionario" ? "Os seus pedidos" : "Todos os pedidos das lojas"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["todos", "pendente", "em_preparacao", "pronto", "entregue", "cancelado"] as const).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-2 rounded-lg border transition-all ${filterStatus === s ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
            {s === "todos" ? "Todos" : ORDER_STATUS_LABELS[s]}
            {s !== "todos" && <span className="ml-1 opacity-60">({myOrders.filter((o: any) => o.status === s).length})</span>}
          </button>
        ))}
      </div>

      {sortedOrders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Nenhum pedido encontrado</p>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map((order: any) => {
            const expanded = expandedOrder === order.id;
            const isEditing = !!editingItems[order.id];
            const displayItems = isEditing ? editingItems[order.id] : (order.items || []);
            const hasActuals = (order.items || []).some((i: any) => i.actual_price != null);
            const orderTotal = hasActuals
              ? (order.items || []).reduce((s: number, i: any) => {
                  const price = Number(i.actual_price) || Number(i.unit_price);
                  const qty = Number(i.actual_qty) || Number(i.qty);
                  const vat = Number(i.actual_vat) || Number(i.vat_rate);
                  return s + price * qty * (1 + vat / 100);
                }, 0)
              : 0;

            return (
              <Card key={order.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <button onClick={() => setExpandedOrder(expanded ? null : order.id)} className="w-full flex items-center justify-between">
                    <div className="text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{order.store_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>{ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {" · "}{(order.items || []).length} itens
                        {hasActuals && ` · €${orderTotal.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span role="button" onClick={(e) => { e.stopPropagation(); handlePrint(order.id); }} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Imprimir"><Printer className="w-4 h-4" /></span>
                      {(order.status === "pronto" || order.status === "entregue") && (
                        <span role="button" onClick={(e) => { e.stopPropagation(); handlePrintGuia(order.id); }} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Guia"><FileText className="w-4 h-4" /></span>
                      )}
                      {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="mt-4 space-y-4">
                      {order.notes && <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">📝 {order.notes}</p>}

                      {canEditActuals(order.status) && !isEditing && (
                        <Button size="sm" variant="outline" onClick={() => startEditing(order.id, order.items || [])} className="text-xs">
                          ✏️ Preencher Valores Reais
                        </Button>
                      )}

                      {SECTIONS.filter((s) => displayItems.some((i: any) => i.section === s)).map((section) => (
                        <div key={section}>
                          <p className="text-xs text-primary font-semibold mb-1">{section}</p>
                          <div className="space-y-1">
                            {displayItems.filter((i: any) => i.section === section).map((item: any) => (
                              <div key={item.id} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-foreground flex-1">{Number(item.qty)} {item.unit} — {item.product_name}</span>
                                  {!isEditing && (
                                    <div className="text-right text-xs text-muted-foreground shrink-0">
                                      {item.actual_qty != null && <span className="text-primary mr-2">Real: {Number(item.actual_qty)} {item.unit}</span>}
                                      {item.actual_price != null ? (
                                        <>
                                          <span>€{Number(item.actual_price).toFixed(2)}</span>
                                          <span className="ml-1 opacity-60">({item.actual_vat ?? item.vat_rate}% IVA)</span>
                                          <span className="ml-1 font-medium text-foreground">
                                            = €{(Number(item.actual_price) * (Number(item.actual_qty) || Number(item.qty)) * (1 + (Number(item.actual_vat) || Number(item.vat_rate)) / 100)).toFixed(2)}
                                          </span>
                                        </>
                                      ) : <span className="opacity-40 italic">s/ valores</span>}
                                    </div>
                                  )}
                                </div>
                                {isEditing && (
                                  <div className="flex items-center gap-2 ml-6 mt-1">
                                    <div className="flex flex-col"><label className="text-[10px] text-muted-foreground">Peso/Qtd</label>
                                      <Input type="number" step="0.01" placeholder={String(item.qty)} value={item.actual_qty ?? ""} onChange={(e) => updateEditItem(order.id, item.id, "actual_qty", parseFloat(e.target.value) || 0)} className="w-20 h-7 text-xs" />
                                    </div>
                                    <div className="flex flex-col"><label className="text-[10px] text-muted-foreground">Preço Un.</label>
                                      <Input type="number" step="0.01" placeholder={Number(item.unit_price).toFixed(2)} value={item.actual_price ?? ""} onChange={(e) => updateEditItem(order.id, item.id, "actual_price", parseFloat(e.target.value) || 0)} className="w-20 h-7 text-xs" />
                                    </div>
                                    <div className="flex flex-col"><label className="text-[10px] text-muted-foreground">IVA % (predefinido: {item.vat_rate}%)</label>
                                      <Input type="number" step="1" placeholder={String(item.vat_rate)} value={item.actual_vat ?? item.vat_rate} onChange={(e) => updateEditItem(order.id, item.id, "actual_vat", parseFloat(e.target.value) || 0)} className="w-20 h-7 text-xs" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {isEditing && (
                        <Button size="sm" onClick={() => saveEditing(order.id)} className="bg-primary text-primary-foreground text-xs">
                          <Save className="w-3 h-3 mr-1" /> Guardar Valores
                        </Button>
                      )}

                      <div className="border-t border-border pt-2 text-sm space-y-1">
                        {hasActuals ? (
                          <div className="flex justify-between font-heading text-foreground">
                            <span>Total (c/ IVA)</span>
                            <span className="text-primary">€{orderTotal.toFixed(2)}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Valores de preço e IVA serão preenchidos após início da preparação.</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => handlePrint(order.id)} className="text-xs"><Printer className="w-3 h-3 mr-1" /> Imprimir</Button>
                        {(order.status === "pronto" || order.status === "entregue") && (
                          <Button size="sm" variant="outline" onClick={() => handlePrintGuia(order.id)} className="text-xs"><FileText className="w-3 h-3 mr-1" /> Guia</Button>
                        )}
                        {(user.role === "armazem" || user.role === "admin") && order.status !== "entregue" && order.status !== "cancelado" && (
                          <>
                            {statusFlow.slice(statusFlow.indexOf(order.status) + 1).map((nextStatus) => (
                              <Button key={nextStatus} size="sm" variant="outline" onClick={() => handleStatusChange(order.id, nextStatus)} className="text-xs">→ {ORDER_STATUS_LABELS[nextStatus]}</Button>
                            ))}
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, "cancelado")} className="text-xs text-destructive border-destructive/30">Cancelar</Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
