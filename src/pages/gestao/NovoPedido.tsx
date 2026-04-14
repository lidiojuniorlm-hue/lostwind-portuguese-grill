import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts, useOrderMutations, useLogActivity } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import { SECTIONS, Section } from "@/types/warehouse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Minus, Trash2, Send, ShoppingCart, Loader2, Search, Share2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface CartItem {
  productId: string;
  productName: string;
  section: string;
  unit: string;
  qty: number;
  unitPrice: number;
  vatRate: number;
}

export default function NovoPedido() {
  const { user } = useAuth();
  const { data: products = [] } = useProducts();
  const { createOrder } = useOrderMutations();
  const logActivity = useLogActivity();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("Carnes");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lastOrderText, setLastOrderText] = useState("");

  if (!user || user.role !== "funcionario") return null;

  // When searching, show products from ALL sections; otherwise filter by active section
  const isSearching = searchTerm.trim().length > 0;

  const sectionProducts = products
    .filter((p) => isSearching ? true : p.section === activeSection)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) return prev.map((c) => c.productId === productId ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, {
        productId: product.id,
        productName: product.name,
        section: product.section,
        unit: product.unit,
        qty: 1,
        unitPrice: Number(product.unit_price),
        vatRate: Number(product.vat_rate),
      }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.productId === productId ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0));
  };

  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((c) => c.productId !== productId));
    else setCart((prev) => prev.map((c) => c.productId === productId ? { ...c, qty } : c));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const totalVat = cart.reduce((sum, i) => sum + i.unitPrice * i.qty * (i.vatRate / 100), 0);
  const total = subtotal + totalVat;

  const buildOrderText = (cartItems: CartItem[]) => {
    const now = new Date();
    const date = now.toLocaleDateString("pt-PT");
    const time = now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    const storeName = user.store || user.name;

    let text = `📋 *PEDIDO — ${storeName}*\n`;
    text += `👤 ${user.name}\n`;
    text += `📅 ${date} às ${time}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    const grouped: Record<string, CartItem[]> = {};
    cartItems.forEach((item) => {
      if (!grouped[item.section]) grouped[item.section] = [];
      grouped[item.section].push(item);
    });

    Object.entries(grouped).forEach(([section, items]) => {
      text += `📦 *${section}*\n`;
      items.forEach((item) => {
        text += `  • ${item.qty} ${item.unit} — ${item.productName}\n`;
      });
      text += `\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🛒 Total: ${cartItems.length} produtos\n`;
    if (notes.trim()) {
      text += `\n📝 *Obs:* ${notes}\n`;
    }
    text += `\n_Enviado via Lost Wind Gestão_`;
    return text;
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(lastOrderText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async () => {
    if (cart.length === 0) { toast.error("Adicione produtos ao pedido!"); return; }
    const orderText = buildOrderText(cart);
    try {
      await createOrder.mutateAsync({
        order: {
          store_name: user.store || user.name,
          created_by: user.id,
          notes,
          status: "pendente",
        },
        items: cart.map((c) => ({
          product_id: c.productId,
          product_name: c.productName,
          section: c.section as any,
          unit: c.unit,
          qty: c.qty,
          unit_price: c.unitPrice,
          vat_rate: c.vatRate,
        })),
      });
      logActivity.mutate({
        user_id: user.id,
        user_name: user.name,
        action: "Pedido criado",
        details: `${cart.length} itens para ${user.store || user.name}`,
      });
      toast.success("Pedido enviado ao armazém!");
      setLastOrderText(orderText);
      setShowShareDialog(true);
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar pedido");
    }
  };

  const getCartQty = (productId: string) => cart.find((c) => c.productId === productId)?.qty || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground">Novo Pedido</h2>
        <p className="text-sm text-muted-foreground">Loja: {user.store} · Entrega: amanhã</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button key={s} onClick={() => { setActiveSection(s); setSearchTerm(""); }} className={`text-xs px-3 py-2 rounded-lg border transition-all ${activeSection === s && !isSearching ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Pesquisar em todas as secções..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {sectionProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {isSearching ? "Nenhum produto encontrado" : "Sem produtos nesta secção"}
            </p>
          ) : (
            sectionProducts.map((product: any) => {
              const qty = getCartQty(product.id);
              return (
                <div key={product.id} className={`bg-card border rounded-lg p-3 flex items-center justify-between gap-3 transition-all ${qty > 0 ? "border-primary/30" : "border-border"}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span>{product.unit}</span>
                      {isSearching && <span className="text-primary/70">{product.section}</span>}
                    </div>
                  </div>
                  {qty === 0 ? (
                    <Button size="sm" variant="outline" onClick={() => addToCart(product.id)} className="shrink-0"><Plus className="w-4 h-4" /></Button>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(product.id, -1)} className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                        {qty === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <Input type="number" value={qty} onChange={(e) => setQty(product.id, parseInt(e.target.value) || 0)} className="w-16 h-8 text-center text-sm" min={0} />
                      <button onClick={() => updateQty(product.id, 1)} className="w-8 h-8 rounded bg-secondary flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h3 className="font-heading text-foreground">Resumo ({cart.length})</h3>
            </div>
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Carrinho vazio</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-auto mb-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-foreground truncate flex-1">{item.qty}x {item.productName}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <label className="text-xs text-muted-foreground block mb-1">Notas / Observações</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escreva observações...&#10;• Use Enter para nova linha&#10;• Use • para tópicos"
                className="text-sm min-h-[80px] resize-y"
                rows={3}
              />
            </div>
            <Button onClick={handleSubmit} disabled={cart.length === 0 || createOrder.isPending} className="w-full mt-4 bg-gradient-flame text-primary-foreground">
              {createOrder.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Enviar Pedido
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" /> Pedido Enviado!
            </DialogTitle>
            <DialogDescription>
              Partilhe uma cópia do pedido por WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-3 max-h-60 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap text-foreground font-sans">{lastOrderText}</pre>
          </div>
          <div className="flex gap-2">
            <Button onClick={shareToWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white">
              <Share2 className="w-4 h-4 mr-2" /> Enviar por WhatsApp
            </Button>
            <Button variant="outline" onClick={() => { setShowShareDialog(false); navigate("/gestao/pedidos"); }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
