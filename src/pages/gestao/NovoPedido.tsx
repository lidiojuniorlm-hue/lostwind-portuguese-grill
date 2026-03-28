import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SECTIONS, Section, OrderItem } from "@/types/warehouse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Minus, Trash2, Send, ShoppingCart } from "lucide-react";

export default function NovoPedido() {
  const { user, products, addOrder } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("Carnes");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");

  if (!user || user.role !== "funcionario") return null;

  const sectionProducts = products.filter((p) => p.section === activeSection);

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) {
        return prev.map((c) => c.productId === productId ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        section: product.section,
        unit: product.unit,
        qty: 1,
        unitPrice: product.unitPrice,
        vatRate: product.vatRate,
      }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.productId === productId ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter((c) => c.qty > 0)
    );
  };

  const setQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.productId !== productId));
    } else {
      setCart((prev) => prev.map((c) => c.productId === productId ? { ...c, qty } : c));
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const totalVat = cart.reduce((sum, i) => sum + i.unitPrice * i.qty * (i.vatRate / 100), 0);
  const total = subtotal + totalVat;

  const handleSubmit = () => {
    if (cart.length === 0) { toast.error("Adicione produtos ao pedido!"); return; }
    const order = {
      id: `ORD-${Date.now()}`,
      storeId: user.id,
      storeName: user.store || user.name,
      items: cart,
      status: "pendente" as const,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      notes,
    };
    addOrder(order);
    toast.success("Pedido enviado ao armazém!");
    navigate("/gestao/pedidos");
  };

  const getCartQty = (productId: string) => cart.find((c) => c.productId === productId)?.qty || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground">Novo Pedido</h2>
        <p className="text-sm text-muted-foreground">Loja: {user.store} · Entrega: amanhã</p>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`text-xs px-3 py-2 rounded-lg border transition-all ${
              activeSection === s
                ? "bg-primary/20 border-primary text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2 space-y-2">
          {sectionProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sem produtos nesta secção</p>
          ) : (
            sectionProducts.map((product) => {
              const qty = getCartQty(product.id);
              return (
                <div
                  key={product.id}
                  className={`bg-card border rounded-lg p-3 flex items-center justify-between gap-3 transition-all ${
                    qty > 0 ? "border-primary/30" : "border-border"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span className="text-primary font-semibold">€{product.unitPrice.toFixed(2)}/{product.unit}</span>
                      <span>IVA {product.vatRate}%</span>
                    </div>
                  </div>
                  {qty === 0 ? (
                    <Button size="sm" variant="outline" onClick={() => addToCart(product.id)} className="shrink-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(product.id, -1)} className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                        {qty === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3" />}
                      </button>
                      <Input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(product.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8 text-center text-sm"
                        min={0}
                      />
                      <button onClick={() => updateQty(product.id, 1)} className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Cart summary */}
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
                    <span className="text-muted-foreground ml-2">€{(item.unitPrice * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IVA</span>
                <span>€{totalVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-heading text-foreground text-base pt-1">
                <span>Total</span>
                <span className="text-gradient-flame">€{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-muted-foreground block mb-1">Notas</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações..."
                className="text-sm"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={cart.length === 0}
              className="w-full mt-4 bg-gradient-flame text-primary-foreground"
            >
              <Send className="w-4 h-4 mr-2" /> Enviar Pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
