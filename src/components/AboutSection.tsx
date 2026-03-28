import { motion } from "framer-motion";
import { Flame, Users, Award, Heart } from "lucide-react";
import interiorImg from "@/assets/restaurant-interior.jpg";

const stats = [
  { icon: Flame, label: "Desde", value: "2018" },
  { icon: Users, label: "Clientes Satisfeitos", value: "50K+" },
  { icon: Award, label: "Lojas", value: "5" },
  { icon: Heart, label: "Paixão", value: "100%" },
];

const AboutSection = () => {
  return (
    <section id="sobre" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-widest">Sobre Nós</span>
            <h2 className="text-4xl md:text-5xl font-heading mt-2 text-foreground leading-tight">
              A ARTE DO BOM <span className="text-gradient-flame">GRELHADO</span>
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              A Churrasqueira Lost Wind nasceu em setembro de 2018 no Carregado, fruto da visão e dedicação 
              do casal Aleteia Domingues e Cleverson Quintino. O que começou como um sonho rapidamente 
              se tornou referência regional para quem aprecia um autêntico grelhado na brasa.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Com 5 lojas espalhadas pela região — Carregado (2 lojas), Paredes (Alenquer), 
              Povos (Vila Franca de Xira) e Arruda dos Vinhos — a Lost Wind continua a crescer, 
              mantendo sempre o compromisso com a qualidade, o sabor e a dedicação aos clientes.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed italic border-l-2 border-primary pl-4">
              "Empreender é fazer negócio na adversidade, arriscar mesmo quando tudo caminha para 
              ficarmos quietinhos, e compartilhar os mesmos sonhos com os nossos colaboradores."
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-3 bg-card rounded-xl border border-border">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-heading text-gradient-flame">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-flame">
              <img src={interiorImg} alt="Interior Lost Wind" className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-primary rounded-xl p-4 shadow-flame hidden md:block">
              <div className="text-3xl font-heading text-primary-foreground">7+</div>
              <div className="text-xs text-primary-foreground/80">Anos de<br/>Experiência</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
