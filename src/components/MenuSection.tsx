import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import dishChicken from "@/assets/grill-takeaway.jpg";
import dishRibs from "@/assets/flyer-lostwind.jpg";
import dishFish from "@/assets/restaurant-interior.jpg";

const categories = [
  {
    title: "Frango Grelhado",
    description: "O nosso frango grelhado na brasa, suculento e temperado com a receita especial Lost Wind. Takeaway & Delivery.",
    price: "desde €5,50",
    image: dishChicken,
    popular: true,
  },
  {
    title: "A Arte do Bom Grelhado",
    description: "Especialidade exclusiva Lost Wind — qualidade incomparável, sabor autêntico desde 2018.",
    price: "Menu Completo",
    image: dishRibs,
    popular: true,
  },
  {
    title: "Buffet & Acompanhamentos",
    description: "Alheira, chouriço, arroz, e muito mais — tudo preparado com ingredientes frescos do dia.",
    price: "desde €2,00",
    image: dishFish,
    popular: false,
  },
];

const menuItems = [
  { name: "½ Frango", price: "€5,50", category: "Frangos" },
  { name: "Frango Inteiro", price: "€9,90", category: "Frangos" },
  { name: "Espetada Mista", price: "€8,50", category: "Espetadas" },
  { name: "Espetada de Frango", price: "€6,90", category: "Espetadas" },
  { name: "Costelas de Porco", price: "€8,90", category: "Carnes" },
  { name: "Entremeada", price: "€7,50", category: "Carnes" },
  { name: "Picanha na Brasa", price: "€12,90", category: "Carnes" },
  { name: "Dourada Grelhada", price: "€9,50", category: "Peixes" },
  { name: "Robalo Grelhado", price: "€11,90", category: "Peixes" },
  { name: "Batata Frita", price: "€2,50", category: "Acompanhamentos" },
  { name: "Arroz", price: "€2,00", category: "Acompanhamentos" },
  { name: "Salada Mista", price: "€3,00", category: "Acompanhamentos" },
];

const MenuSection = () => {
  return (
    <section id="menu" className="py-20 md:py-32 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Nosso Menu</span>
          <h2 className="text-4xl md:text-6xl font-heading mt-2 text-foreground">
            ESPECIALIDADES <span className="text-gradient-flame">NA BRASA</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Grelhados preparados com paixão, usando apenas os melhores ingredientes e carvão de qualidade.
          </p>
        </motion.div>

        {/* Featured dishes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {categories.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              {item.popular && (
                <div className="absolute top-4 right-4 bg-gradient-flame text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Popular
                </div>
              )}
              <div className="p-6 relative">
                <h3 className="text-xl font-heading text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                <p className="text-primary font-semibold mt-3">{item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full menu list */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 md:p-10"
        >
          <h3 className="text-2xl md:text-3xl font-heading text-foreground mb-8 text-center">
            MENU <span className="text-gradient-flame">COMPLETO</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
            {menuItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <span className="text-foreground font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({item.category})</span>
                </div>
                <span className="text-primary font-semibold">{item.price}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MenuSection;
