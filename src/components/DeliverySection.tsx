import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Minus, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";
import grillTakeaway from "@/assets/grill-takeaway.jpg";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

const deliveryMenu = [
  { id: 1, name: "½ Frango", price: 5.5 },
  { id: 2, name: "Frango Inteiro", price: 9.9 },
  { id: 3, name: "Espetada Mista", price: 8.5 },
  { id: 4, name: "Espetada de Frango", price: 6.9 },
  { id: 5, name: "Costelas de Porco", price: 8.9 },
  { id: 6, name: "Entremeada", price: 7.5 },
  { id: 7, name: "Picanha na Brasa", price: 12.9 },
  { id: 8, name: "Dourada Grelhada", price: 9.5 },
  { id: 9, name: "Batata Frita", price: 2.5 },
  { id: 10, name: "Arroz", price: 2.0 },
  { id: 11, name: "Salada Mista", price: 3.0 },
];

const stores = [
  { name: "Carregado Centro", phone: "914511336" },
  { name: "Barrada – Carregado", phone: "912397613" },
  { name: "Paredes – Alenquer", phone: "936812318" },
  { name: "Povos – VFX", phone: "910111940" },
  { name: "Arruda dos Vinhos", phone: "" },
];

const DeliverySection = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStore, setSelectedStore] = useState(stores[0]);

  const addItem = (item: typeof deliveryMenu[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...item, qty: 1 }];
    });
    toast.success(`${item.name} adicionado!`);
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleOrder = () => {
    if (cart.length === 0) {
      toast.error("Adicione items ao pedido!");
      return;
    }
    const message = `Olá! Gostaria de fazer um pedido na Lost Wind ${selectedStore.name}:\n\n${cart
      .map((c) => `• ${c.qty}x ${c.name} — €${(c.price * c.qty).toFixed(2)}`)
      .join("\n")}\n\nTotal: €${total.toFixed(2)}`;
    const encoded = encodeURIComponent(message);

    if (selectedStore.phone) {
      window.open(`https://wa.me/351${selectedStore.phone}?text=${encoded}`, "_blank");
    } else {
      toast.info("Contacte a loja por telefone para encomendar.");
    }
  };

  return (
    <section id="delivery" className="py-20 md:py-32 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Delivery</span>
          <h2 className="text-4xl md:text-6xl font-heading mt-2 text-foreground">
            PEÇA <span className="text-gradient-flame">EM CASA</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Monte o seu pedido e encomende diretamente por WhatsApp ou telefone.
          </p>
          <img src={grillTakeaway} alt="Takeaway & Delivery Lost Wind" className="mt-8 mx-auto rounded-2xl max-w-md w-full shadow-flame border border-border" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Menu items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Store selector */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <label className="text-sm text-muted-foreground block mb-2">Escolha a loja:</label>
              <div className="flex flex-wrap gap-2">
                {stores.map((store) => (
                  <button
                    key={store.name}
                    onClick={() => setSelectedStore(store)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                      selectedStore.name === store.name
                        ? "bg-primary/20 border-primary text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {store.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliveryMenu.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addItem(item)}
                  className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-all text-left"
                >
                  <div>
                    <span className="text-foreground font-medium">{item.name}</span>
                    <span className="text-primary font-semibold block text-sm mt-1">€{item.price.toFixed(2)}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-heading text-foreground">O Seu Pedido</h3>
              </div>

              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">O carrinho está vazio</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-foreground truncate block">{item.name}</span>
                        <span className="text-xs text-muted-foreground">€{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded bg-secondary flex items-center justify-center">
                          {item.qty === 1 ? <Trash2 className="w-3 h-3 text-destructive" /> : <Minus className="w-3 h-3 text-muted-foreground" />}
                        </button>
                        <span className="text-sm w-6 text-center text-foreground">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded bg-secondary flex items-center justify-center">
                          <Plus className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-border pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-medium">Total</span>
                  <span className="text-xl font-heading text-gradient-flame">€{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={cart.length === 0}
                className="w-full bg-gradient-flame text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-flame-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Encomendar via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
