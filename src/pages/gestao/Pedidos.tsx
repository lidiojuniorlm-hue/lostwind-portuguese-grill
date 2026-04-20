import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders, useOrderMutations, useUsers, useLogActivity, useDeleteOrder, useProducts } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus, SECTIONS } from "@/types/warehouse";
import { ChevronDown, ChevronUp, Printer, FileText, Save, History, CalendarDays, Trash2, Share2, Plus, X, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { getLogoBase64 } from "@/utils/logoBase64";

// Helper: get effective values for an order item (uses actual values when available)
const getEffective = (item: any) => {
  const qty = Number(item.actual_qty ?? item.qty);
  const price = Number(item.actual_price ?? item.unit_price);
  const vatRate = Number(item.actual_vat ?? item.vat_rate);
  const subtotal = qty * price;
  const vat = subtotal * (vatRate / 100);
  return { qty, price, vatRate, subtotal, vat, total: subtotal + vat };
};

// Units for products sold by weight/volume — these count as 1 unit each, not by weight value
const WEIGHT_UNITS = new Set(["kg", "g", "l", "ml", "lt", "lts", "litro", "litros", "grama", "gramas", "quilo", "quilos"]);
const isWeightUnit = (unit?: string) => !!unit && WEIGHT_UNITS.has(unit.trim().toLowerCase());
// Count units in an order: items by weight = 1 unit per line, items by piece = sum of qty
const countOrderUnits = (items: any[]) =>
  (items || []).reduce((sum, i) => sum + (isWeightUnit(i.unit) ? 1 : Number(i.qty) || 0), 0);

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
  const { data: products = [] } = useProducts();
  const { updateOrderStatus, updateOrderItems, addOrderItems, deleteOrderItem } = useOrderMutations();
  const deleteOrder = useDeleteOrder();
  const logActivity = useLogActivity();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "todos">("todos");
  const [editingItems, setEditingItems] = useState<Record<string, EditItem[]>>({});
  const [viewMode, setViewMode] = useState<"hoje" | "historico">("hoje");
  const [selectedHistoryStore, setSelectedHistoryStore] = useState<string>("todas");
  const [addItemOrderId, setAddItemOrderId] = useState<string | null>(null);
  const [addItemSearch, setAddItemSearch] = useState("");
  const [addItemSelections, setAddItemSelections] = useState<Record<string, number>>({});
  // Per-order ordered list of item IDs marked as priority (first loaded into the van).
  // We keep them in selection order so the user controls the loading sequence.
  const [priorityItems, setPriorityItems] = useState<Record<string, string[]>>({});

  const togglePriority = (orderId: string, itemId: string) => {
    setPriorityItems((prev) => {
      const current = prev[orderId] || [];
      const next = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      return { ...prev, [orderId]: next };
    });
  };

  // Reorder items: priority items first (in selection order), then the rest in original order.
  const applyPriorityOrder = (items: any[], orderId: string) => {
    const priority = priorityItems[orderId] || [];
    if (priority.length === 0) return items;
    const prioritySet = new Set(priority);
    const prioritized = priority
      .map((id) => items.find((i) => i.id === id))
      .filter(Boolean);
    const rest = items.filter((i) => !prioritySet.has(i.id));
    return [...prioritized, ...rest];
  };

  if (!user) return null;

  const myOrders = user.role === "funcionario"
    ? orders.filter((o: any) => o.created_by === user.id)
    : orders;

  const filteredOrders = filterStatus === "todos"
    ? myOrders
    : myOrders.filter((o: any) => o.status === filterStatus);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = filteredOrders.filter((o: any) => new Date(o.created_at) >= today);
  const historicOrders = filteredOrders.filter((o: any) => new Date(o.created_at) < today);

  const historyStores = Array.from(new Set(historicOrders.map((o: any) => o.store_name))).sort() as string[];

  const historicFilteredByStore = selectedHistoryStore === "todas"
    ? historicOrders
    : historicOrders.filter((o: any) => o.store_name === selectedHistoryStore);

  const activeOrders = viewMode === "hoje" ? todayOrders : historicFilteredByStore;

  const sortedOrders = [...activeOrders].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
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

  const canEditActuals = (status: OrderStatus) => {
    if (user.role === "admin") return true; // admin can always edit
    return user.role === "armazem" && (status === "em_preparacao" || status === "pronto");
  };

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

  // Admin: add new items to an existing order
  const openAddItem = (orderId: string) => {
    setAddItemOrderId(orderId);
    setAddItemSearch("");
    setAddItemSelections({});
  };

  const closeAddItem = () => {
    setAddItemOrderId(null);
    setAddItemSelections({});
    setAddItemSearch("");
  };

  const confirmAddItems = async () => {
    if (!addItemOrderId) return;
    const order = orders.find((o: any) => o.id === addItemOrderId);
    if (!order) return;
    const itemsToAdd = Object.entries(addItemSelections)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const p = products.find((pr: any) => pr.id === productId);
        if (!p) return null;
        return {
          product_id: p.id,
          product_name: p.name,
          section: p.section,
          unit: p.unit,
          qty,
          unit_price: Number(p.unit_price) || 0,
          vat_rate: Number(p.vat_rate) || 23,
        };
      })
      .filter(Boolean) as any[];

    if (itemsToAdd.length === 0) {
      toast.error("Selecione pelo menos um produto com quantidade.");
      return;
    }

    try {
      await addOrderItems.mutateAsync({ orderId: addItemOrderId, items: itemsToAdd });
      logActivity.mutate({
        user_id: user.id,
        user_name: user.name,
        action: "Itens adicionados a pedido",
        details: `Pedido ${addItemOrderId.slice(0, 8)} — ${(order as any).store_name} (+${itemsToAdd.length} produto${itemsToAdd.length > 1 ? "s" : ""})`,
      });
      toast.success(`${itemsToAdd.length} item(ns) adicionado(s) ao pedido.`);
      closeAddItem();
    } catch (e: any) {
      toast.error("Erro ao adicionar itens: " + (e?.message || ""));
    }
  };

  const handleRemoveItem = async (orderId: string, itemId: string, productName: string) => {
    if (!confirm(`Remover "${productName}" do pedido?`)) return;
    try {
      await deleteOrderItem.mutateAsync(itemId);
      logActivity.mutate({
        user_id: user.id,
        user_name: user.name,
        action: "Item removido de pedido",
        details: `${productName} — Pedido ${orderId.slice(0, 8)}`,
      });
      toast.success("Item removido.");
    } catch (e: any) {
      toast.error("Erro ao remover: " + (e?.message || ""));
    }
  };

  // Print: Guia de Transporte
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
        ${(order as any).notes ? `<p style="font-size:8px;margin-bottom:8px;"><strong>Observações:</strong> ${(order as any).notes?.replace(/\n/g, "<br/>")}</p>` : ""}
        <div class="sig-section">
          <div class="sig-box"><p>Responsável do Armazém</p><div class="sig-line">Assinatura / Carimbo</div></div>
          <div class="sig-box"><p>Transportador / Condutor</p><div class="sig-line">Assinatura / Carimbo</div></div>
        </div>
        <div class="footer">Documento gerado automaticamente pelo sistema Lost Wind — ${new Date().toLocaleDateString("pt-PT")} ${new Date().toLocaleTimeString("pt-PT")}</div>
        <script>window.onload=function(){window.print();}<\/script>
      </body></html>`);
    printWindow.document.close();
  };

  const handleShareWhatsApp = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return;
    const items = ((order as any).items || []).sort((a: any, b: any) => a.product_name.localeCompare(b.product_name));
    const createdByUser = users?.find((u: any) => u.id === (order as any).created_by);
    const date = new Date((order as any).created_at).toLocaleDateString("pt-PT");
    const time = new Date((order as any).created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

    let text = `📋 *PEDIDO — ${(order as any).store_name}*\n`;
    text += `👤 ${createdByUser?.name || "Funcionário"}\n`;
    text += `📅 ${date} às ${time}\n`;
    const totalUnits = countOrderUnits(items);
    text += `🔢 Quantidade de itens: ${totalUnits}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    const grouped: Record<string, any[]> = {};
    items.forEach((item: any) => {
      if (!grouped[item.section]) grouped[item.section] = [];
      grouped[item.section].push(item);
    });

    Object.entries(grouped).forEach(([section, sItems]) => {
      text += `📦 *${section}*\n`;
      sItems.forEach((item: any) => {
        text += `  • ${item.actual_qty ?? item.qty} ${item.unit} — ${item.product_name}\n`;
      });
      text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🛒 Total: ${totalUnits} ${totalUnits === 1 ? "item" : "itens"} (${items.length} ${items.length === 1 ? "produto" : "produtos"})\n`;
    if ((order as any).notes) {
      text += `\n📝 *Obs:* ${(order as any).notes}\n`;
    }
    text += `\n_Enviado via Lost Wind Gestão_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Print: Conference sheet
  const handlePrint = async (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    if (!order) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const items = (order as any).items || [];
    const showReadyValues = (order as any).status === "pronto" || (order as any).status === "entregue";
    const printedAt = new Date();

    const formatQty = (value: number) => {
      if (Number.isInteger(value)) return String(value);
      return value.toFixed(2).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
    };

    // Calculate subtotal (sem IVA) and total (com IVA) separately
    const financialSummary = showReadyValues
      ? items.reduce(
          (acc: { subtotal: number; total: number }, item: any) => {
            const e = getEffective(item);
            acc.subtotal += e.subtotal;
            acc.total += e.total;
            return acc;
          },
          { subtotal: 0, total: 0 },
        )
      : null;

    const logoBase64 = await getLogoBase64();

    const sectionsHtml = SECTIONS.filter((s) => items.some((i: any) => i.section === s)).map((section) => {
      const sectionItems = items.filter((i: any) => i.section === section);

      const rows = sectionItems.map((item: any) => {
        const qtyValue = formatQty(Number(item.qty));
        const actualQtyValue = formatQty(Number(item.actual_qty ?? item.qty));
        const actualUnitLabel = item.unit;
        const e = getEffective(item);
        const unitPriceSemIva = e.price;
        const lineTotalSemIva = e.subtotal;

        const realQtyContent = showReadyValues
          ? `<span style="font-weight:600;color:#2f2f2f;">${actualQtyValue}</span><span style="display:inline-block;width:6px;"></span><span style="font-size:10px;color:#2a2a2a;">${actualUnitLabel}</span>`
          : `<span style="display:inline-block;width:92px;height:14px;"></span>`;

        const priceCol = showReadyValues
          ? `<td style="padding:6px 10px;border:1px solid #d7d7d7;text-align:right;font-size:11px;color:#2a2a2a;">€${unitPriceSemIva.toFixed(2)}</td>
             <td style="padding:6px 10px;border:1px solid #d7d7d7;text-align:right;font-size:12px;color:#2a2a2a;font-weight:600;">€${lineTotalSemIva.toFixed(2)}</td>`
          : "";

        return `<tr>
          <td style="padding:6px 8px;border:1px solid #d7d7d7;text-align:center;width:40px;">
            <div style="width:16px;height:16px;border:2px solid #666;border-radius:3px;display:inline-block;"></div>
          </td>
          <td style="padding:6px 8px;border:1px solid #d7d7d7;text-align:center;font-size:13px;color:#2a2a2a;font-weight:700;width:50px;">${qtyValue}</td>
          <td style="padding:6px 10px;border:1px solid #d7d7d7;font-size:12px;color:#2a2a2a;font-weight:500;">${item.product_name}</td>
          <td style="padding:6px 10px;border:1px solid #d7d7d7;text-align:center;font-size:12px;color:#2a2a2a;">${realQtyContent}</td>
          ${priceCol}
        </tr>`;
      }).join("");

      const priceHeaders = showReadyValues
        ? `<th style="padding:5px 8px;font-size:9px;text-align:right;border:1px solid #d7d7d7;width:70px;">Preço</th>
           <th style="padding:5px 8px;font-size:9px;text-align:right;border:1px solid #d7d7d7;width:80px;">Total</th>`
        : "";

      return `<div style="margin-bottom:10px;">
        <div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;padding:4px 8px;background:#fef2f2;border-left:3px solid #c0392b;border-radius:2px;">${section}</div>
        <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
          <thead><tr style="background:#f5f5f5;">
            <th style="padding:5px 6px;font-size:9px;text-align:center;border:1px solid #d7d7d7;width:40px;">✓</th>
            <th style="padding:5px 6px;font-size:9px;text-align:center;border:1px solid #d7d7d7;width:50px;">Qtd</th>
            <th style="padding:5px 8px;font-size:9px;text-align:left;border:1px solid #d7d7d7;">Produto</th>
            <th style="padding:5px 8px;font-size:9px;text-align:center;border:1px solid #d7d7d7;width:130px;">Peso / Qtd Real</th>
            ${priceHeaders}
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    }).join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Pedido ${(order as any).store_name}</title>
      <style>
        @page { size:A4; margin:8mm; }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Arial','Helvetica Neue',sans-serif; padding:12px 16px; color:#333; font-size:12px; }
      </style></head>
      <body>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#555;margin-bottom:12px;">
          <div>${printedAt.toLocaleDateString("pt-PT")} ${printedAt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</div>
          <div>Pedido ${(order as any).store_name}</div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:14px;">
          <img src="${logoBase64}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'" />
          <div style="text-align:center;">
            <div style="font-size:20px;font-weight:800;color:#000;letter-spacing:0.5px;font-family:'Arial Black','Arial',sans-serif;">Lost Wind Churrasqueira</div>
            <div style="font-size:12px;color:#555;margin-top:2px;">Pedido de Stock — ${(order as any).store_name}</div>
          </div>
        </div>
        <div style="text-align:center;font-size:11px;color:#666;margin-bottom:10px;">${new Date((order as any).created_at).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })} às ${new Date((order as any).created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} · Estado: ${ORDER_STATUS_LABELS[(order as any).status as OrderStatus]}</div>
        <div style="font-size:10px;color:#555;margin:0 0 8px 4px;">📝 ${showReadyValues ? "Valores reais digitalizados" : "Qtd real / peso para preenchimento manual"}</div>
        ${sectionsHtml}
        ${financialSummary ? `
          <div style="margin-top:10px;border-top:2px solid #333;padding-top:8px;">
            <div style="display:flex;justify-content:flex-end;margin-bottom:4px;">
              <div style="display:flex;justify-content:space-between;width:220px;font-size:13px;color:#555;"><span>Subtotal (s/ IVA)</span><span style="font-weight:600;">€${financialSummary.subtotal.toFixed(2)}</span></div>
            </div>
            <div style="display:flex;justify-content:flex-end;">
              <div style="display:flex;justify-content:space-between;width:220px;font-size:15px;font-weight:800;color:#000;"><span>Total (c/ IVA)</span><span>€${financialSummary.total.toFixed(2)}</span></div>
            </div>
          </div>` : ""}
        ${(order as any).notes ? `<p style="margin-top:6px;font-size:10px;white-space:pre-line;"><strong>Notas:</strong> ${(order as any).notes}</p>` : ""}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px;padding-top:12px;border-top:1px solid #ddd;">
          <div style="text-align:center;">
            <p style="font-size:9px;color:#666;margin-bottom:32px;">Responsável do Armazém</p>
            <div style="border-top:1px solid #333;padding-top:4px;font-size:9px;font-weight:600;">Assinatura / Carimbo</div>
          </div>
          <div style="text-align:center;">
            <p style="font-size:9px;color:#666;margin-bottom:32px;">Motorista / Funcionário de Loja</p>
            <div style="border-top:1px solid #333;padding-top:4px;font-size:9px;font-weight:600;">Assinatura / Carimbo</div>
          </div>
        </div>
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

      <div className="flex items-center gap-3">
        <button onClick={() => setViewMode("hoje")} className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border transition-all font-medium ${viewMode === "hoje" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
          <CalendarDays className="w-4 h-4" /> Hoje
          <span className="ml-1 text-xs opacity-80">({todayOrders.length})</span>
        </button>
        <button onClick={() => setViewMode("historico")} className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border transition-all font-medium ${viewMode === "historico" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
          <History className="w-4 h-4" /> Histórico
          <span className="ml-1 text-xs opacity-80">({historicOrders.length})</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["todos", "pendente", "em_preparacao", "pronto", "entregue", "cancelado"] as const).map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`text-xs px-3 py-2 rounded-lg border transition-all ${filterStatus === s ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
            {s === "todos" ? "Todos" : ORDER_STATUS_LABELS[s]}
            {s !== "todos" && <span className="ml-1 opacity-60">({myOrders.filter((o: any) => o.status === s).length})</span>}
          </button>
        ))}
      </div>

      {viewMode === "historico" && historyStores.length > 0 && (
        <div className="border-b border-border">
          <div className="flex flex-wrap gap-1 -mb-px">
            <button
              onClick={() => setSelectedHistoryStore("todas")}
              className={`text-xs px-4 py-2 border-b-2 transition-all font-medium ${selectedHistoryStore === "todas" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Todas <span className="opacity-60">({historicOrders.length})</span>
            </button>
            {historyStores.map((store) => {
              const count = historicOrders.filter((o: any) => o.store_name === store).length;
              return (
                <button
                  key={store}
                  onClick={() => setSelectedHistoryStore(store)}
                  className={`text-xs px-4 py-2 border-b-2 transition-all font-medium ${selectedHistoryStore === store ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  {store} <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sortedOrders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">{viewMode === "hoje" ? "Nenhum pedido hoje" : "Nenhum pedido no histórico"}</p>
      ) : (
        <div className="space-y-3">
          {viewMode === "historico" && (
            <p className="text-xs text-muted-foreground">
              {selectedHistoryStore === "todas" ? "Pedidos anteriores a hoje (todas as lojas)" : `Histórico — ${selectedHistoryStore}`}
            </p>
          )}
          {sortedOrders.map((order: any) => {
            const expanded = expandedOrder === order.id;
            const isEditing = !!editingItems[order.id];
            const displayItems = isEditing ? editingItems[order.id] : (order.items || []);
            const hasActuals = (order.items || []).some((i: any) => i.actual_price != null);
            
            // Calculate order totals using effective (actual) values
            const orderTotals = (order.items || []).reduce(
              (acc: { subtotal: number; total: number }, i: any) => {
                const e = getEffective(i);
                acc.subtotal += e.subtotal;
                acc.total += e.total;
                return acc;
              },
              { subtotal: 0, total: 0 }
            );

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
                        {" · "}{countOrderUnits(order.items || [])} {countOrderUnits(order.items || []) === 1 ? "item" : "itens"}
                        {hasActuals && ` · €${orderTotals.total.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span role="button" onClick={(e) => { e.stopPropagation(); handleShareWhatsApp(order.id); }} className="p-1.5 rounded-md hover:bg-muted transition-colors text-green-500 hover:text-green-400" title="WhatsApp"><Share2 className="w-4 h-4" /></span>
                      <span role="button" onClick={(e) => { e.stopPropagation(); handlePrint(order.id); }} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Imprimir"><Printer className="w-4 h-4" /></span>
                      {(order.status === "pronto" || order.status === "entregue") && (
                        <span role="button" onClick={(e) => { e.stopPropagation(); handlePrintGuia(order.id); }} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Guia"><FileText className="w-4 h-4" /></span>
                      )}
                      {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {expanded && (
                    <div className="mt-4 space-y-4">
                      {order.notes && <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2 whitespace-pre-line">📝 {order.notes}</p>}

                      <div className="flex flex-wrap gap-2">
                        {canEditActuals(order.status) && !isEditing && (
                          <Button size="sm" variant="outline" onClick={() => startEditing(order.id, order.items || [])} className="text-xs">
                            ✏️ Preencher Valores Reais
                          </Button>
                        )}
                        {user.role === "admin" && (
                          <Button size="sm" variant="outline" onClick={() => openAddItem(order.id)} className="text-xs border-primary/40 text-primary hover:bg-primary/10">
                            <Plus className="w-3 h-3 mr-1" /> Adicionar Item
                          </Button>
                        )}
                      </div>

                      {SECTIONS.filter((s) => displayItems.some((i: any) => i.section === s)).map((section) => (
                        <div key={section}>
                          <p className="text-xs text-primary font-semibold mb-1">{section}</p>
                          <div className="space-y-1">
                            {displayItems.filter((i: any) => i.section === section).map((item: any) => (
                              <div key={item.id} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-foreground flex-1">
                                    {Number(item.qty)} {item.unit} — {item.product_name}
                                    {!isEditing && item.actual_qty != null && (
                                      <span className="text-primary text-xs ml-2">Real: {Number(item.actual_qty)} {item.unit}</span>
                                    )}
                                  </span>
                                  {user.role === "admin" && !isEditing && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(order.id, item.id, item.product_name)}
                                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                      title="Remover item"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
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
                          <>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal (s/ IVA)</span>
                              <span>€{orderTotals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-heading text-foreground">
                              <span>Total (c/ IVA)</span>
                              <span className="text-primary">€{orderTotals.total.toFixed(2)}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Valores de preço e IVA serão preenchidos após início da preparação.</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => handleShareWhatsApp(order.id)} className="text-xs text-green-500 border-green-500/30 hover:bg-green-500/10"><Share2 className="w-3 h-3 mr-1" /> WhatsApp</Button>
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
                        {(user.role === "admin") && (
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (!confirm("Tem certeza que deseja apagar este pedido? Os dados serão removidos permanentemente.")) return;
                            await deleteOrder.mutateAsync(order.id);
                            logActivity.mutate({ user_id: user.id, user_name: user.name, action: "Pedido apagado", details: `Pedido ${order.id.slice(0, 8)} — ${order.store_name}` });
                            toast.success("Pedido apagado com sucesso");
                          }} className="text-xs text-destructive border-destructive/30">
                            <Trash2 className="w-3 h-3 mr-1" /> Apagar
                          </Button>
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

      {/* Admin: Add items to existing order */}
      <Dialog open={!!addItemOrderId} onOpenChange={(o) => { if (!o) closeAddItem(); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Adicionar itens ao pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <Input
              placeholder="Pesquisar produto..."
              value={addItemSearch}
              onChange={(e) => setAddItemSearch(e.target.value)}
              className="h-9"
            />
            <div className="flex-1 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {(() => {
                const order = orders.find((o: any) => o.id === addItemOrderId);
                const existingIds = new Set(((order as any)?.items || []).map((i: any) => i.product_id));
                const term = addItemSearch.trim().toLowerCase();
                const filtered = products
                  .filter((p: any) => !existingIds.has(p.id))
                  .filter((p: any) => !term || p.name.toLowerCase().includes(term) || p.section.toLowerCase().includes(term));
                if (filtered.length === 0) {
                  return <p className="text-xs text-muted-foreground text-center p-6">Nenhum produto disponível.</p>;
                }
                return filtered.map((p: any) => {
                  const qty = addItemSelections[p.id] ?? 0;
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-muted/40">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.section} · {p.unit} · €{Number(p.unit_price).toFixed(2)}</p>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Qtd"
                        value={qty || ""}
                        onChange={(e) =>
                          setAddItemSelections((prev) => ({ ...prev, [p.id]: parseFloat(e.target.value) || 0 }))
                        }
                        className="w-24 h-8 text-xs"
                      />
                    </div>
                  );
                });
              })()}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {Object.values(addItemSelections).filter((q) => q > 0).length} produto(s) selecionado(s)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddItem}>Cancelar</Button>
            <Button onClick={confirmAddItems} disabled={addOrderItems.isPending}>
              {addOrderItems.isPending ? "A adicionar..." : "Adicionar ao pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
