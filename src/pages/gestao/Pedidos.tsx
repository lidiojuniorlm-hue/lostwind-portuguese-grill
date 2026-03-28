import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus, SECTIONS, OrderItem } from "@/types/warehouse";
import { ChevronDown, ChevronUp, Printer, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-lostwind.jpeg";

export default function Pedidos() {
  const { user, users, orders, updateOrderStatus, updateOrderItems } = useAuth();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");
  const [editingItems, setEditingItems] = useState<Record<string, OrderItem[]>>({});
  const printRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const myOrders = user.role === "funcionario"
    ? orders.filter((o) => o.createdBy === user.id)
    : orders;

  const filteredOrders = filterStatus === "todos"
    ? myOrders
    : myOrders.filter((o) => o.status === filterStatus);

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Estado atualizado: ${ORDER_STATUS_LABELS[newStatus]}`);
  };

  const statusFlow: OrderStatus[] = ["pendente", "em_preparacao", "pronto", "entregue"];

  const canEditActuals = (status: OrderStatus) =>
    (user.role === "armazem" || user.role === "admin") &&
    (status === "em_preparacao" || status === "pronto");

  const startEditing = (orderId: string, items: OrderItem[]) => {
    setEditingItems((prev) => ({ ...prev, [orderId]: items.map((i) => ({ ...i })) }));
  };

  const updateEditItem = (orderId: string, productId: string, field: "actualQty" | "actualPrice" | "actualVat", value: number) => {
    setEditingItems((prev) => ({
      ...prev,
      [orderId]: (prev[orderId] || []).map((i) =>
        i.productId === productId ? { ...i, [field]: value } : i
      ),
    }));
  };

  const saveEditing = (orderId: string) => {
    const items = editingItems[orderId];
    if (!items) return;
    updateOrderItems(orderId, items);
    setEditingItems((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
    toast.success("Valores atualizados com sucesso!");
  };

  const handlePrintGuia = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const createdByUser = users.find((u) => u.id === order.createdBy);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Guia de Transporte — ${order.storeName}</title></head>
      <body style="font-family:Arial,sans-serif;padding:30px;color:#333;">
        <div style="border:2px solid #333;padding:24px;">
          <div style="text-align:center;margin-bottom:20px;">
            <h2 style="margin:0;font-size:20px;">GUIA DE TRANSPORTE / REMESSA</h2>
            <p style="margin:4px 0;font-size:13px;color:#666;">Lost Wind Churrasqueira</p>
          </div>
          <table style="width:100%;font-size:13px;margin-bottom:16px;">
            <tr>
              <td style="padding:4px 0;"><strong>N.º Guia:</strong> GT-${order.id.slice(0, 8).toUpperCase()}</td>
              <td style="padding:4px 0;text-align:right;"><strong>Data:</strong> ${new Date().toLocaleDateString("pt-PT")}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><strong>Origem:</strong> Armazém Central</td>
              <td style="padding:4px 0;text-align:right;"><strong>Destino:</strong> ${order.storeName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><strong>Solicitado por:</strong> ${createdByUser?.name || "—"}</td>
              <td style="padding:4px 0;text-align:right;"><strong>Hora Saída:</strong> ________</td>
            </tr>
            <tr>
              <td style="padding:4px 0;"><strong>Matrícula:</strong> ________________</td>
              <td style="padding:4px 0;text-align:right;"><strong>Motorista:</strong> ________________</td>
            </tr>
          </table>
          <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px;">
            <thead>
              <tr style="background:#f0f0f0;">
                <th style="padding:6px;border:1px solid #999;width:30px;">✓</th>
                <th style="padding:6px;border:1px solid #999;text-align:left;">Produto</th>
                <th style="padding:6px;border:1px solid #999;text-align:center;">Qtd</th>
                <th style="padding:6px;border:1px solid #999;text-align:center;">Unidade</th>
                <th style="padding:6px;border:1px solid #999;text-align:left;">Secção</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item) => `
                <tr>
                  <td style="padding:5px 6px;border:1px solid #ccc;text-align:center;">
                    <span style="display:inline-block;width:14px;height:14px;border:2px solid #555;border-radius:3px;"></span>
                  </td>
                  <td style="padding:5px 6px;border:1px solid #ccc;">${item.productName}</td>
                  <td style="padding:5px 6px;border:1px solid #ccc;text-align:center;">${item.actualQty ?? item.qty}</td>
                  <td style="padding:5px 6px;border:1px solid #ccc;text-align:center;">${item.unit}</td>
                  <td style="padding:5px 6px;border:1px solid #ccc;">${item.section}</td>
                </tr>`).join("")}
            </tbody>
          </table>
          <div style="margin-top:20px;font-size:11px;color:#666;">
            <p><strong>Observações:</strong> ${order.notes || "—"}</p>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:50px;font-size:12px;">
            <div style="text-align:center;width:45%;">
              <div style="border-top:1px solid #333;padding-top:6px;">Preparado por (Armazém)</div>
            </div>
            <div style="text-align:center;width:45%;">
              <div style="border-top:1px solid #333;padding-top:6px;">Motorista</div>
            </div>
          </div>
        </div>
        <script>window.onload=function(){window.print();}<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrint = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const createdByUser = users.find((u) => u.id === order.createdBy);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const hasActuals = order.items.some((i) => i.actualPrice !== undefined);

    const sectionsHtml = SECTIONS
      .filter((s) => order.items.some((i) => i.section === s))
      .map((section) => {
        const rows = order.items
          .filter((i) => i.section === section)
          .map(
            (item) => `
            <tr>
              <td style="padding:6px 10px;border:1px solid #ddd;width:30px;text-align:center;">
                <span style="display:inline-block;width:16px;height:16px;border:2px solid #555;border-radius:3px;"></span>
              </td>
              <td style="padding:6px 10px;border:1px solid #ddd;">${item.productName}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${item.qty} ${item.unit}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${item.actualQty !== undefined ? item.actualQty + ' ' + item.unit : '________'}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${item.actualPrice !== undefined ? '€' + item.actualPrice.toFixed(2) : '________'}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${item.actualVat !== undefined ? item.actualVat + '%' : '________'}</td>
              <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${item.actualPrice !== undefined && item.actualQty !== undefined ? '€' + (item.actualPrice * item.actualQty).toFixed(2) : '________'}</td>
            </tr>`
          )
          .join("");
        return `
          <h3 style="margin:16px 0 6px;color:#b45309;font-size:14px;">${section}</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:6px 10px;border:1px solid #ddd;width:30px;">✓</th>
                <th style="padding:6px 10px;border:1px solid #ddd;text-align:left;">Produto</th>
                <th style="padding:6px 10px;border:1px solid #ddd;">Qtd Pedida</th>
                <th style="padding:6px 10px;border:1px solid #ddd;">Qtd Real / Peso</th>
                <th style="padding:6px 10px;border:1px solid #ddd;">Preço Un.</th>
                <th style="padding:6px 10px;border:1px solid #ddd;">IVA</th>
                <th style="padding:6px 10px;border:1px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>`;
      })
      .join("");

    const actualSubtotal = hasActuals
      ? order.items.reduce((s, i) => s + (i.actualPrice ?? 0) * (i.actualQty ?? i.qty), 0)
      : null;
    const actualVat = hasActuals
      ? order.items.reduce((s, i) => s + (i.actualPrice ?? 0) * (i.actualQty ?? i.qty) * ((i.actualVat ?? i.vatRate) / 100), 0)
      : null;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Pedido ${order.storeName}</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px;color:#333;">
        <div style="text-align:center;margin-bottom:20px;">
          <h1 style="margin:0;font-size:20px;">Lost Wind Churrasqueira</h1>
          <p style="margin:4px 0;font-size:13px;color:#666;">Pedido de Stock — ${order.storeName}</p>
          <p style="margin:2px 0;font-size:12px;color:#999;">
            ${new Date(order.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            · Estado: ${ORDER_STATUS_LABELS[order.status]}
          </p>
        </div>
        ${order.notes ? `<p style="background:#fff8e1;padding:8px 12px;border-radius:6px;font-size:12px;">📝 ${order.notes}</p>` : ""}
        ${sectionsHtml}
        <div style="margin-top:16px;border-top:2px solid #333;padding-top:10px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>${actualSubtotal !== null ? '€' + actualSubtotal.toFixed(2) : '________'}</span></div>
          <div style="display:flex;justify-content:space-between;"><span>IVA</span><span>${actualVat !== null ? '€' + actualVat.toFixed(2) : '________'}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:15px;margin-top:4px;"><span>Total</span><span>${actualSubtotal !== null && actualVat !== null ? '€' + (actualSubtotal + actualVat).toFixed(2) : '________'}</span></div>
        </div>
        <script>window.onload=function(){window.print();}<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground">Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          {user.role === "funcionario" ? "Os seus pedidos" : "Todos os pedidos das lojas"}
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(["todos", "pendente", "em_preparacao", "pronto", "entregue", "cancelado"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-2 rounded-lg border transition-all ${
              filterStatus === s
                ? "bg-primary/20 border-primary text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {s === "todos" ? "Todos" : ORDER_STATUS_LABELS[s]}
            {s !== "todos" && (
              <span className="ml-1 opacity-60">
                ({myOrders.filter((o) => o.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {sortedOrders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Nenhum pedido encontrado</p>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map((order) => {
            const expanded = expandedOrder === order.id;
            const isEditing = !!editingItems[order.id];
            const displayItems = isEditing ? editingItems[order.id] : order.items;
            const orderSubtotal = order.items.reduce((s, i) => s + (i.actualPrice ?? i.unitPrice) * (i.actualQty ?? i.qty), 0);
            const orderVat = order.items.reduce((s, i) => s + (i.actualPrice ?? i.unitPrice) * (i.actualQty ?? i.qty) * ((i.actualVat ?? i.vatRate) / 100), 0);
            const orderTotal = orderSubtotal + orderVat;
            const hasActuals = order.items.some((i) => i.actualPrice !== undefined);

            return (
              <Card key={order.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <button
                    onClick={() => setExpandedOrder(expanded ? null : order.id)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{order.storeName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        {!hasActuals && order.status !== "pendente" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                            Sem valores reais
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {" · "}{order.items.length} itens
                        {hasActuals && ` · €${orderTotal.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); handlePrint(order.id); }}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Imprimir pedido"
                      >
                        <Printer className="w-4 h-4" />
                      </span>
                      {(order.status === "pronto" || order.status === "entregue") && (
                        <span
                          role="button"
                          onClick={(e) => { e.stopPropagation(); handlePrintGuia(order.id); }}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Guia de transporte"
                        >
                          <FileText className="w-4 h-4" />
                        </span>
                      )}
                      {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="mt-4 space-y-4">
                      {order.notes && (
                        <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">📝 {order.notes}</p>
                      )}

                      {/* Editable actuals header */}
                      {canEditActuals(order.status) && !isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(order.id, order.items)}
                          className="text-xs"
                        >
                          ✏️ Preencher Valores Reais (Peso, Preço, IVA)
                        </Button>
                      )}

                      {/* Items grouped by section */}
                      {SECTIONS.filter((s) => displayItems.some((i) => i.section === s)).map((section) => (
                        <div key={section}>
                          <p className="text-xs text-primary font-semibold mb-1">{section}</p>
                          <div className="space-y-1">
                            {displayItems.filter((i) => i.section === section).map((item) => (
                              <div key={item.productId} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-border accent-primary shrink-0"
                                    title={`Marcar ${item.productName} como separado`}
                                  />
                                  <span className="text-foreground flex-1">
                                    {item.qty} {item.unit} — {item.productName}
                                  </span>
                                  {!isEditing && (
                                    <div className="text-right text-xs text-muted-foreground shrink-0">
                                      {item.actualQty !== undefined && (
                                        <span className="text-primary mr-2">Real: {item.actualQty} {item.unit}</span>
                                      )}
                                      {item.actualPrice !== undefined ? (
                                        <>
                                          <span>€{item.actualPrice.toFixed(2)}</span>
                                          <span className="ml-1 opacity-60">({item.actualVat ?? item.vatRate}%)</span>
                                        </>
                                      ) : (
                                        <span className="opacity-40 italic">s/ valores</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {isEditing && (
                                  <div className="flex items-center gap-2 ml-6 mt-1">
                                    <div className="flex flex-col">
                                      <label className="text-[10px] text-muted-foreground">Peso/Qtd</label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={String(item.qty)}
                                        value={item.actualQty ?? ""}
                                        onChange={(e) => updateEditItem(order.id, item.productId, "actualQty", parseFloat(e.target.value) || 0)}
                                        className="w-20 h-7 text-xs"
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-[10px] text-muted-foreground">Preço Un.</label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={item.unitPrice.toFixed(2)}
                                        value={item.actualPrice ?? ""}
                                        onChange={(e) => updateEditItem(order.id, item.productId, "actualPrice", parseFloat(e.target.value) || 0)}
                                        className="w-20 h-7 text-xs"
                                      />
                                    </div>
                                    <div className="flex flex-col">
                                      <label className="text-[10px] text-muted-foreground">IVA %</label>
                                      <Input
                                        type="number"
                                        step="1"
                                        placeholder={String(item.vatRate)}
                                        value={item.actualVat ?? ""}
                                        onChange={(e) => updateEditItem(order.id, item.productId, "actualVat", parseFloat(e.target.value) || 0)}
                                        className="w-16 h-7 text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {isEditing && (
                        <Button
                          size="sm"
                          onClick={() => saveEditing(order.id)}
                          className="bg-primary text-primary-foreground text-xs"
                        >
                          <Save className="w-3 h-3 mr-1" /> Guardar Valores
                        </Button>
                      )}

                      {/* Totals */}
                      <div className="border-t border-border pt-2 text-sm space-y-1">
                        {hasActuals ? (
                          <>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span><span>€{orderSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>IVA</span><span>€{orderVat.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-heading text-foreground">
                              <span>Total</span><span className="text-gradient-flame">€{orderTotal.toFixed(2)}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Valores de preço, IVA e peso serão preenchidos após separação do pedido.</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(order.id)}
                          className="text-xs"
                        >
                          <Printer className="w-3 h-3 mr-1" /> Imprimir Pedido
                        </Button>

                        {(order.status === "pronto" || order.status === "entregue") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePrintGuia(order.id)}
                            className="text-xs"
                          >
                            <FileText className="w-3 h-3 mr-1" /> Guia de Transporte
                          </Button>
                        )}

                        {(user.role === "armazem" || user.role === "admin") && order.status !== "entregue" && order.status !== "cancelado" && (
                          <>
                            {statusFlow
                              .slice(statusFlow.indexOf(order.status) + 1)
                              .map((nextStatus) => (
                                <Button
                                  key={nextStatus}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(order.id, nextStatus)}
                                  className="text-xs"
                                >
                                  → {ORDER_STATUS_LABELS[nextStatus]}
                                </Button>
                              ))}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(order.id, "cancelado")}
                              className="text-xs text-destructive border-destructive/30"
                            >
                              Cancelar
                            </Button>
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
