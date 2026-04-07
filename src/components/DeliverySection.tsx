import { motion } from "framer-motion";
import { Truck, Clock, Bell } from "lucide-react";
import grillTakeaway from "@/assets/grill-takeaway.jpg";

const DeliverySection = () => {
  return (
    <section id="delivery" className="py-20 md:py-32 bg-gradient-dark">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Delivery</span>
          <h2 className="text-4xl md:text-6xl font-heading mt-2 text-foreground">
            PEÇA <span className="text-gradient-flame">EM CASA</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <img
              src={grillTakeaway}
              alt="Takeaway Lost Wind"
              className="w-full h-64 object-cover"
            />
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-5 py-2 mb-6">
                <Clock className="w-4 h-4 text-accent-foreground" />
                <span className="text-sm font-medium text-accent-foreground">Disponível em breve</span>
              </div>

              <h3 className="text-2xl font-heading text-foreground mb-4">
                Estamos a preparar o sistema de pedidos online
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Em breve poderá encomendar diretamente pelo nosso site. Por agora, pode ligar ou visitar qualquer uma das nossas 9 lojas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-5 py-3">
                  <Truck className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground">Entregas ao domicílio</span>
                </div>
                <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-5 py-3">
                  <Bell className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground">Takeaway em todas as lojas</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DeliverySection;
