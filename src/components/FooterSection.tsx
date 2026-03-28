import { Instagram, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo-lostwind.jpeg";

const FooterSection = () => {
  return (
    <footer id="contacto" className="bg-card border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Lost Wind" className="h-12 w-auto rounded-full border-2 border-primary/30" />
              <span className="font-heading text-2xl text-gradient-flame">LOST WIND</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Churrasqueira Lost Wind — A arte do bom grelhado desde 2018. 
              Takeaway e entregas ao domicílio.
            </p>
            <a
              href="https://www.instagram.com/lostwindlda/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:opacity-80 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-sm">@lostwindlda</span>
            </a>
          </div>

          <div>
            <h4 className="font-heading text-lg text-foreground mb-4">CONTACTOS RÁPIDOS</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <a href="tel:+351914511336" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> Carregado: 914 511 336
              </a>
              <a href="tel:+351912397613" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> Barrada: 912 397 613
              </a>
              <a href="tel:+351936812318" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> Paredes: 936 812 318
              </a>
              <a href="tel:+351910111940" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" /> Povos: 910 111 940
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg text-foreground mb-4">HORÁRIO</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Segunda a Domingo</p>
              <p className="text-foreground font-medium">11:00 — 22:00</p>
            </div>
            <a
              href="#delivery"
              className="inline-block mt-6 bg-gradient-flame text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-flame-sm"
            >
              Encomendar Agora
            </a>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Lost Wind Lda. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
