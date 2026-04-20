export type Section = "Carnes" | "Secos e Molhados" | "Peixes" | "Embalagens" | "Bebidas" | "Limpeza" | "Hortifrúti";

export const SECTIONS: Section[] = ["Carnes", "Bebidas", "Secos e Molhados", "Peixes", "Embalagens", "Limpeza", "Hortifrúti"];

export type VatRate = 6 | 13 | 23;

export interface Product {
  id: string;
  name: string;
  section: Section;
  unit: string;
  unitPrice: number;
  vatRate: VatRate;
}

export type UserRole = "funcionario" | "armazem" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  store?: string;
}

export type OrderStatus = "pendente" | "em_preparacao" | "pronto" | "entregue" | "cancelado";

export interface OrderItem {
  productId: string;
  productName: string;
  section: Section;
  unit: string;
  qty: number;
  unitPrice: number;
  vatRate: VatRate;
  actualQty?: number;
  actualPrice?: number;
  actualVat?: number;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  createdBy: string;
  notes?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendente: "Pendente",
  em_preparacao: "Em Preparação",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pendente: "bg-yellow-500/20 text-yellow-400",
  em_preparacao: "bg-blue-500/20 text-blue-400",
  pronto: "bg-green-500/20 text-green-400",
  entregue: "bg-muted text-muted-foreground",
  cancelado: "bg-destructive/20 text-destructive",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  funcionario: "Funcionário",
  armazem: "Armazém",
  admin: "Administrador",
};
