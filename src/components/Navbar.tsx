import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo-lostwind.jpeg";

const navLinks = [
  { label: "Início", href: "#inicio" },
  { label: "Menu", href: "#menu" },
  { label: "Lojas", href: "#lojas" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contacto", href: "#contacto" },
  { label: "Gestão", href: "/gestao/login", isRoute: true },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-flame-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <a href="#inicio" className="flex items-center gap-3 group">
          <motion.img
            src={logo}
            alt="Lost Wind"
            className="h-11 md:h-14 w-auto rounded-full border-2 border-primary/30 group-hover:border-primary transition-colors duration-300"
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
          <span className="font-heading text-2xl md:text-3xl text-gradient-flame">LOST WIND</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="story-link text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 uppercase tracking-wider"
            >
              <span>{link.label}</span>
            </motion.a>
          ))}
          <motion.a
            href="#delivery"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-flame text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm shadow-flame-sm"
          >
            Pedir Delivery
          </motion.a>
        </div>

        {/* Mobile toggle */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-foreground p-2"
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-3 border-b border-border/30"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                href="#delivery"
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-flame text-primary-foreground px-5 py-3 rounded-lg font-semibold text-center shadow-flame-sm mt-2"
              >
                Pedir Delivery
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
