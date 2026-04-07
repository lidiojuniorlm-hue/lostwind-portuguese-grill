import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroImg from "@/assets/hero-grill.jpg";
import logo from "@/assets/logo-lostwind.jpeg";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <motion.img
          src={heroImg}
          alt="Grelhados na brasa"
          className="w-full h-full object-cover"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="flex flex-col items-start max-w-3xl">
          {/* Logo animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <img
              src={logo}
              alt="Lost Wind Logo"
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/40 shadow-flame"
            />
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-7xl lg:text-8xl font-heading leading-[0.9] mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.span
              className="text-foreground block"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              CHURRASQUEIRA
            </motion.span>
            <motion.span
              className="text-gradient-flame block"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              LOST WIND
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-xl mb-2 font-body italic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            A Arte do Bom Grelhado
          </motion.p>

          <motion.p
            className="text-base md:text-lg text-muted-foreground max-w-xl mb-8 font-body"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            Sabor autêntico, qualidade incomparável e paixão em cada refeição.
            9 lojas para melhor o servir — takeaway & entregas ao domicílio.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <motion.a
              href="#lojas"
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px -10px hsl(0 78% 50% / 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-flame text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg shadow-flame text-center"
            >
              🔥 Nossas Lojas
            </motion.a>
            <motion.a
              href="#menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-border bg-secondary/50 backdrop-blur text-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-secondary transition-colors text-center"
            >
              Ver Menu
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#galeria" className="animate-float block">
            <ArrowDown className="w-6 h-6 text-muted-foreground" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
