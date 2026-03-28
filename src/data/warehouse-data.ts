import { Product, AppUser } from "@/types/warehouse";

export const INITIAL_PRODUCTS: Product[] = [
  // Carnes
  { id: "c1", name: "Frango Inteiro", section: "Carnes", unit: "kg", unitPrice: 3.20, vatRate: 6 },
  { id: "c2", name: "Costelas de Porco", section: "Carnes", unit: "kg", unitPrice: 5.50, vatRate: 6 },
  { id: "c3", name: "Entremeada", section: "Carnes", unit: "kg", unitPrice: 4.80, vatRate: 6 },
  { id: "c4", name: "Picanha", section: "Carnes", unit: "kg", unitPrice: 12.90, vatRate: 6 },
  { id: "c5", name: "Espetada Mista", section: "Carnes", unit: "un", unitPrice: 2.50, vatRate: 6 },
  { id: "c6", name: "Chouriço", section: "Carnes", unit: "kg", unitPrice: 6.00, vatRate: 6 },
  { id: "c7", name: "Asa de Frango", section: "Carnes", unit: "kg", unitPrice: 3.80, vatRate: 6 },
  { id: "c8", name: "Lombo de Porco", section: "Carnes", unit: "kg", unitPrice: 5.90, vatRate: 6 },

  // Peixes
  { id: "p1", name: "Dourada", section: "Peixes", unit: "kg", unitPrice: 8.50, vatRate: 6 },
  { id: "p2", name: "Robalo", section: "Peixes", unit: "kg", unitPrice: 9.90, vatRate: 6 },
  { id: "p3", name: "Salmão", section: "Peixes", unit: "kg", unitPrice: 11.00, vatRate: 6 },
  { id: "p4", name: "Sardinha", section: "Peixes", unit: "kg", unitPrice: 4.50, vatRate: 6 },
  { id: "p5", name: "Bacalhau", section: "Peixes", unit: "kg", unitPrice: 14.00, vatRate: 6 },

  // Secos e Molhados
  { id: "sm1", name: "Arroz Agulha", section: "Secos e Molhados", unit: "kg", unitPrice: 1.20, vatRate: 6 },
  { id: "sm2", name: "Azeite Extra Virgem", section: "Secos e Molhados", unit: "lt", unitPrice: 5.50, vatRate: 23 },
  { id: "sm3", name: "Óleo Vegetal", section: "Secos e Molhados", unit: "lt", unitPrice: 1.80, vatRate: 23 },
  { id: "sm4", name: "Sal Grosso", section: "Secos e Molhados", unit: "kg", unitPrice: 0.60, vatRate: 23 },
  { id: "sm5", name: "Batata", section: "Secos e Molhados", unit: "kg", unitPrice: 0.90, vatRate: 6 },
  { id: "sm6", name: "Cebola", section: "Secos e Molhados", unit: "kg", unitPrice: 1.10, vatRate: 6 },
  { id: "sm7", name: "Alho", section: "Secos e Molhados", unit: "kg", unitPrice: 4.50, vatRate: 6 },
  { id: "sm8", name: "Molho Piri-Piri", section: "Secos e Molhados", unit: "lt", unitPrice: 3.20, vatRate: 23 },

  // Embalagens
  { id: "e1", name: "Caixa Alumínio P", section: "Embalagens", unit: "un", unitPrice: 0.12, vatRate: 23 },
  { id: "e2", name: "Caixa Alumínio M", section: "Embalagens", unit: "un", unitPrice: 0.18, vatRate: 23 },
  { id: "e3", name: "Caixa Alumínio G", section: "Embalagens", unit: "un", unitPrice: 0.25, vatRate: 23 },
  { id: "e4", name: "Saco Plástico P", section: "Embalagens", unit: "un", unitPrice: 0.03, vatRate: 23 },
  { id: "e5", name: "Saco Plástico G", section: "Embalagens", unit: "un", unitPrice: 0.05, vatRate: 23 },
  { id: "e6", name: "Guardanapos (pct 100)", section: "Embalagens", unit: "pct", unitPrice: 1.50, vatRate: 23 },
  { id: "e7", name: "Talheres Descartáveis", section: "Embalagens", unit: "pct", unitPrice: 2.00, vatRate: 23 },

  // Bebidas
  { id: "b1", name: "Coca-Cola 33cl", section: "Bebidas", unit: "un", unitPrice: 0.45, vatRate: 23 },
  { id: "b2", name: "Coca-Cola 1.5L", section: "Bebidas", unit: "un", unitPrice: 1.10, vatRate: 23 },
  { id: "b3", name: "Água 50cl", section: "Bebidas", unit: "un", unitPrice: 0.15, vatRate: 6 },
  { id: "b4", name: "Água 1.5L", section: "Bebidas", unit: "un", unitPrice: 0.25, vatRate: 6 },
  { id: "b5", name: "Sumol Laranja 33cl", section: "Bebidas", unit: "un", unitPrice: 0.50, vatRate: 23 },
  { id: "b6", name: "Cerveja Super Bock", section: "Bebidas", unit: "un", unitPrice: 0.55, vatRate: 23 },
  { id: "b7", name: "Cerveja Sagres", section: "Bebidas", unit: "un", unitPrice: 0.55, vatRate: 23 },
  { id: "b8", name: "Vinho Tinto (box 5L)", section: "Bebidas", unit: "un", unitPrice: 4.50, vatRate: 13 },
];

export const INITIAL_USERS: AppUser[] = [
  { id: "u1", name: "Admin", email: "admin@lostwind.pt", password: "admin123", role: "admin" },
  { id: "u2", name: "Armazém Central", email: "armazem@lostwind.pt", password: "armazem123", role: "armazem" },
  { id: "u3", name: "Carregado Centro", email: "carregado@lostwind.pt", password: "loja123", role: "funcionario", store: "Carregado Centro" },
  { id: "u4", name: "Barrada", email: "barrada@lostwind.pt", password: "loja123", role: "funcionario", store: "Barrada – Carregado" },
  { id: "u5", name: "Paredes", email: "paredes@lostwind.pt", password: "loja123", role: "funcionario", store: "Paredes – Alenquer" },
  { id: "u6", name: "Povos", email: "povos@lostwind.pt", password: "loja123", role: "funcionario", store: "Povos – VFX" },
  { id: "u7", name: "Arruda", email: "arruda@lostwind.pt", password: "loja123", role: "funcionario", store: "Arruda dos Vinhos" },
];

export const STORES = [
  "Carregado Centro",
  "Barrada – Carregado",
  "Paredes – Alenquer",
  "Povos – VFX",
  "Arruda dos Vinhos",
];
