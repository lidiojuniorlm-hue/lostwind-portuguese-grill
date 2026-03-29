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
      [orderId]: items.map((i: any) => ({ ...i })),
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

  const handlePrintGuia = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return;
    const createdByUser = users?.find((u: any) => u.id === (order as any).created_by);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Guia de Transporte — ${(order as any).store_name}</title></head>
      <body style="font-family:Arial,sans-serif;padding:30px;color:#333;">
        <div style="border:2px solid #333;padding:24px;">
          <div style="text-align:center;margin-bottom:20px;">
            <h2 style="margin:0;font-size:20px;">GUIA DE TRANSPORTE / REMESSA</h2>
            <p style="margin:4px 0;font-size:13px;color:#666;">Lost Wind Churrasqueira</p>
          </div>
          <table style="width:100%;font-size:13px;margin-bottom:16px;">
            <tr><td><strong>N.º Guia:</strong> GT-${(order as any).id.slice(0, 8).toUpperCase()}</td><td style="text-align:right;"><strong>Data:</strong> ${new Date().toLocaleDateString("pt-PT")}</td></tr>
            <tr><td><strong>Origem:</strong> Armazém Central</td><td style="text-align:right;"><strong>Destino:</strong> ${(order as any).store_name}</td></tr>
            <tr><td><strong>Solicitado por:</strong> ${createdByUser?.name || "—"}</td><td style="text-align:right;"><strong>Hora Saída:</strong> ________</td></tr>
          </table>
          <table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:#f0f0f0;"><th style="padding:6px;border:1px solid #999;">Produto</th><th style="padding:6px;border:1px solid #999;">Qtd</th><th style="padding:6px;border:1px solid #999;">Unidade</th></tr></thead>
          <tbody>${((order as any).items || []).map((item: any) => `<tr><td style="padding:5px 6px;border:1px solid #ccc;">${item.product_name}</td><td style="padding:5px 6px;border:1px solid #ccc;text-align:center;">${item.actual_qty ?? item.qty}</td><td style="padding:5px 6px;border:1px solid #ccc;text-align:center;">${item.unit}</td></tr>`).join("")}</tbody></table>
          ${(order as any).notes ? `<p style="margin-top:10px;font-size:11px;"><strong>Notas:</strong> ${(order as any).notes}</p>` : ""}
        </div>
        <script>window.onload=function(){window.print();}<\/script>
      </body></html>`);
    printWindow.document.close();
  };

  const handlePrint = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const items = (order as any).items || [];
    const sectionsHtml = SECTIONS.filter((s) => items.some((i: any) => i.section === s)).map((section) => {
      const rows = items.filter((i: any) => i.section === section).map((item: any) => `<tr><td style="padding:6px;border:1px solid #ddd;">${item.product_name}</td><td style="padding:6px;border:1px solid #ddd;text-align:center;">${item.qty} ${item.unit}</td><td style="padding:6px;border:1px solid #ddd;text-align:right;">${item.actual_price != null ? '€' + Number(item.actual_price).toFixed(2) : '—'}</td></tr>`).join("");
      return `<h3 style="margin:12px 0 4px;color:#b45309;font-size:14px;">${section}</h3><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr style="background:#f5f5f5;"><th style="padding:6px;border:1px solid #ddd;text-align:left;">Produto</th><th style="padding:6px;border:1px solid #ddd;">Qtd</th><th style="padding:6px;border:1px solid #ddd;">Preço</th></tr></thead><tbody>${rows}</tbody></table>`;
    }).join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Pedido ${(order as any).store_name}</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px;color:#333;">
        <div style="text-align:center;margin-bottom:20px;"><h1 style="margin:0;font-size:20px;">Lost Wind Churrasqueira</h1><p style="margin:4px 0;font-size:13px;color:#666;">Pedido — ${(order as any).store_name}</p></div>
        ${sectionsHtml}
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
            const orderSubtotal = (order.items || []).reduce((s: number, i: any) => s + (Number(i.actual_price) || Number(i.unit_price)) * (Number(i.actual_qty) || Number(i.qty)), 0);
            const orderVat = (order.items || []).reduce((s: number, i: any) => s + (Number(i.actual_price) || Number(i.unit_price)) * (Number(i.actual_qty) || Number(i.qty)) * ((Number(i.actual_vat) || Number(i.vat_rate)) / 100), 0);
            const orderTotal = orderSubtotal + orderVat;
            const hasActuals = (order.items || []).some((i: any) => i.actual_price != null);

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
                                        <><span>€{Number(item.actual_price).toFixed(2)}</span><span className="ml-1 opacity-60">({item.actual_vat ?? item.vat_rate}%)</span></>
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
                                    <div className="flex flex-col"><label className="text-[10px] text-muted-foreground">IVA %</label>
                                      <Input type="number" step="1" placeholder={String(item.vat_rate)} value={item.actual_vat ?? ""} onChange={(e) => updateEditItem(order.id, item.id, "actual_vat", parseFloat(e.target.value) || 0)} className="w-16 h-7 text-xs" />
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
                          <>
                            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>€{orderSubtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-muted-foreground"><span>IVA</span><span>€{orderVat.toFixed(2)}</span></div>
                            <div className="flex justify-between font-heading text-foreground"><span>Total</span><span className="text-gradient-flame">€{orderTotal.toFixed(2)}</span></div>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Valores de preço, IVA e peso serão preenchidos após separação do pedido.</p>
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
