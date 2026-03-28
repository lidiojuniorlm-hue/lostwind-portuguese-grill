import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";

const stores = [
  {
    name: "Carregado Centro",
    address: "Rua Alferes Machado Ferrão, 24 – Carregado",
    phones: ["914 511 336", "263 142 566"],
    hours: "Seg-Dom: 11h00 - 22h00",
    mapUrl: "https://maps.google.com/?q=Rua+Alferes+Machado+Ferrão+24+Carregado",
    flagship: true,
  },
  {
    name: "Barrada – Carregado",
    address: "Rua Gil Eanes, Urbanização da Barrada – Carregado",
    phones: ["263 097 552", "912 397 613"],
    hours: "Seg-Dom: 11h00 - 22h00",
    mapUrl: "https://maps.google.com/?q=Rua+Gil+Eanes+Barrada+Carregado",
    flagship: false,
  },
  {
    name: "Paredes – Alenquer",
    address: "Rua do Pedrógão, Paredes – Alenquer",
    phones: ["263 116 779", "936 812 318"],
    hours: "Seg-Dom: 11h00 - 22h00",
    mapUrl: "https://maps.google.com/?q=Rua+do+Pedrógão+Paredes+Alenquer",
    flagship: false,
  },
  {
    name: "Povos – Vila Franca de Xira",
    address: "Rua José da Costa e Silva – Povos, Vila Franca de Xira",
    phones: ["910 111 940", "910 142 751"],
    hours: "Seg-Dom: 11h00 - 22h00",
    mapUrl: "https://maps.google.com/?q=Rua+José+da+Costa+e+Silva+Povos+Vila+Franca+de+Xira",
    flagship: false,
  },
  {
    name: "Arruda dos Vinhos",
    address: "Arruda dos Vinhos",
    phones: ["—"],
    hours: "Seg-Dom: 11h00 - 22h00",
    mapUrl: "https://maps.google.com/?q=Lost+Wind+Arruda+dos+Vinhos",
    flagship: false,
  },
];

const StoresSection = () => {
  return (
    <section id="lojas" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Nossas Lojas</span>
          <h2 className="text-4xl md:text-6xl font-heading mt-2 text-foreground">
            ENCONTRE A <span className="text-gradient-flame">LOST WIND</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            5 lojas para melhor o servir. Visite-nos ou peça entrega ao domicílio.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, i) => (
            <motion.div
              key={store.name}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={`relative bg-card rounded-xl p-6 border transition-all duration-300 hover:shadow-flame-sm ${
                store.flagship ? "border-primary/50 shadow-flame-sm" : "border-border hover:border-primary/30"
              }`}
            >
              {store.flagship && (
                <div className="absolute -top-3 left-6 bg-gradient-flame text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  Loja Original
                </div>
              )}

              <h3 className="text-xl font-heading text-foreground mb-4 mt-1">{store.name}</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{store.address}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    {store.phones.map((p, j) => (
                      <a key={j} href={`tel:${p.replace(/\s/g, "")}`} className="block hover:text-primary transition-colors">
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{store.hours}</span>
                </div>
              </div>

              <a
                href={store.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block text-center border border-primary/30 text-primary rounded-lg py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                Ver no Mapa
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoresSection;
