import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppUser, Order, Product } from "@/types/warehouse";
import { INITIAL_PRODUCTS, INITIAL_USERS } from "@/data/warehouse-data";

interface AuthContextType {
  user: AppUser | null;
  users: AppUser[];
  products: Product[];
  orders: Order[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: AppUser) => void;
  updateUser: (user: AppUser) => void;
  deleteUser: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  updateOrderItems: (orderId: string, items: Order["items"]) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => loadFromStorage("lw_user", null));
  const [users, setUsers] = useState<AppUser[]>(() => loadFromStorage("lw_users", INITIAL_USERS));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage("lw_products", INITIAL_PRODUCTS));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage("lw_orders", []));

  useEffect(() => { localStorage.setItem("lw_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("lw_products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("lw_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => {
    if (user) localStorage.setItem("lw_user", JSON.stringify(user));
    else localStorage.removeItem("lw_user");
  }, [user]);

  const login = (email: string, password: string) => {
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) { setUser(found); return true; }
    return false;
  };

  const logout = () => setUser(null);

  const addUser = (u: AppUser) => setUsers((prev) => [...prev, u]);
  const updateUser = (u: AppUser) => setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
  const deleteUser = (id: string) => setUsers((prev) => prev.filter((x) => x.id !== id));

  const addProduct = (p: Product) => setProducts((prev) => [...prev, p]);
  const updateProduct = (p: Product) => setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  const deleteProduct = (id: string) => setProducts((prev) => prev.filter((x) => x.id !== id));

  const addOrder = (o: Order) => setOrders((prev) => [...prev, o]);
  const updateOrderStatus = (orderId: string, status: Order["status"]) =>
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  const updateOrderItems = (orderId: string, items: Order["items"]) =>
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, items } : o)));

  return (
    <AuthContext.Provider
      value={{ user, users, products, orders, login, logout, addUser, updateUser, deleteUser, addProduct, updateProduct, deleteProduct, addOrder, updateOrderStatus, updateOrderItems }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
