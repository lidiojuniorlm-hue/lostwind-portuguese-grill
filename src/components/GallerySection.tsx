import { motion } from "framer-motion";
import lwCarvao from "@/assets/lw-carvao.jpg";
import lwBifranga from "@/assets/lw-bifranga.jpg";
import lwBuffet from "@/assets/lw-buffet.jpg";

const images = [
  { src: lwCarvao, alt: "Luz, Carvão, Ação — Espetadas e grelhados na brasa", label: "Grelhados na Brasa" },
  { src: lwBifranga, alt: "Bifranga à Lost — Especialidade da casa", label: "Bifranga à Lost" },
  { src: lwBuffet, alt: "Buffet Livre com 8 tipos de carnes diferentes", label: "Buffet Livre" },
];

const GallerySection = () => {
  return (
    <section id="galeria" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-widest">Galeria</span>
          <h2 className="text-4xl md:text-6xl font-heading mt-2 text-foreground">
            O NOSSO <span className="text-gradient-flame">SABOR</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Cada peça grelhada com dedicação e o tempero que só a Lost Wind tem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {images.map((img, i) => (
            <motion.div
              key={img.label}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative rounded-2xl overflow-hidden border border-border shadow-lg"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-lg font-heading text-foreground">{img.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
