import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders, useInventory, useProducts } from "@/hooks/useSupabaseData";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SECTIONS } from "@/types/warehouse";
import { Package, Search, AlertTriangle, CheckCircle2, ListChecks, Store as StoreIcon, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

type Aggregated = {
  product_id: string;
  product_name: string;
  section: string;
  unit: string;
  totalQty: number;
  byStore: Record<string, number>;
  stock: number;
};

export default function Contagem() {
  const { user } = useAuth();
  const { data: orders = [] } = useOrders(user?.role, user?.id, user?.store);
  const { data: inventory = [] } = useInventory();
  const { data: products = [] } = useProducts();
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string>("todas");

  // Stock map for the central warehouse
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    inventory.forEach((i: any) => {
      if (i.store_name === "Armazém") map[i.product_id] = Number(i.current_stock) || 0;
    });
    return map;
  }, [inventory]);

  // Only orders that still need to be picked/dispatched
  const activeOrders = useMemo(
    () => orders.filter((o: any) => o.status === "pendente" || o.status === "em_preparacao"),
    [orders],
  );

  const aggregated: Aggregated[] = useMemo(() => {
    const map = new Map<string, Aggregated>();
    activeOrders.forEach((o: any) => {
      (o.items || []).forEach((it: any) => {
        const key = it.product_id;
        const qty = Number(it.actual_qty ?? it.qty) || 0;
        const existing = map.get(key);
        if (existing) {
          existing.totalQty += qty;
          existing.byStore[o.store_name] = (existing.byStore[o.store_name] || 0) + qty;
        } else {
          map.set(key, {
            product_id: it.product_id,
            product_name: it.product_name,
            section: it.section,
            unit: it.unit,
            totalQty: qty,
            byStore: { [o.store_name]: qty },
            stock: stockMap[it.product_id] ?? 0,
          });
        }
      });
    });
    return Array.from(map.values()).map((a) => ({ ...a, stock: stockMap[a.product_id] ?? 0 }));
  }, [activeOrders, stockMap]);

  const filtered = aggregated
    .filter((a) => (sectionFilter === "todas" ? true : a.section === sectionFilter))
    .filter((a) => a.product_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.section.localeCompare(b.section) || a.product_name.localeCompare(b.product_name));

  const totals = useMemo(() => {
    const totalLines = aggregated.length;
    const insufficient = aggregated.filter((a) => a.stock < a.totalQty).length;
    const stores = new Set(activeOrders.map((o: any) => o.store_name)).size;
    return { totalLines, insufficient, stores, ordersCount: activeOrders.length };
  }, [aggregated, activeOrders]);

  // Group by section
  const bySection = useMemo(() => {
    const map: Record<string, Aggregated[]> = {};
    filtered.forEach((a) => {
      if (!map[a.section]) map[a.section] = [];
      map[a.section].push(a);
    });
    return map;
  }, [filtered]);

  const handlePrint = () => window.print();

  return (
    <div className="p-4 md:p-6 space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div>
          <h1 className="font-heading text-3xl tracking-wide flex items-center gap-2">
            <ListChecks className="h-7 w-7 text-primary" />
            Contagem de Saída
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lista consolidada de produtos a separar para os pedidos ativos
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" /> Imprimir
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
        <KpiCard icon={<Package className="h-5 w-5" />} label="Produtos" value={totals.totalLines} tone="primary" />
        <KpiCard icon={<ListChecks className="h-5 w-5" />} label="Pedidos ativos" value={totals.ordersCount} tone="info" />
        <KpiCard icon={<StoreIcon className="h-5 w-5" />} label="Lojas" value={totals.stores} tone="accent" />
        <KpiCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Stock insuficiente"
          value={totals.insufficient}
          tone={totals.insufficient > 0 ? "danger" : "success"}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Procurar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sectionFilter === "todas" ? "default" : "outline"}
            size="sm"
            onClick={() => setSectionFilter("todas")}
          >
            Todas
          </Button>
          {SECTIONS.map((s) => (
            <Button
              key={s}
              variant={sectionFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setSectionFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">Contagem de Saída</h1>
        <p className="text-sm">{new Date().toLocaleString("pt-PT")}</p>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Sem produtos para separar no momento.</p>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {Object.entries(bySection).map(([section, items]) => (
          <div key={section}>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="font-heading text-xl tracking-wide">{section}</h2>
              <Badge variant="secondary" className="ml-1">{items.length}</Badge>
            </div>
            <div className="grid gap-2">
              {items.map((a) => {
                const ok = a.stock >= a.totalQty;
                const ratio = a.totalQty > 0 ? Math.min(1, a.stock / a.totalQty) : 1;
                return (
                  <Card
                    key={a.product_id}
                    className={cn(
                      "overflow-hidden transition-colors border",
                      ok ? "border-border" : "border-destructive/40",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Product */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{a.product_name}</span>
                            {ok ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(a.byStore).map(([store, qty]) => (
                              <span
                                key={store}
                                className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                              >
                                {store}: <span className="text-foreground font-medium">{qty}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Qty needed */}
                        <div className="flex items-center gap-6 md:gap-8">
                          <div className="text-center">
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">A separar</div>
                            <div className="text-2xl font-bold text-primary leading-tight">
                              {a.totalQty}
                              <span className="text-sm font-normal text-muted-foreground ml-1">{a.unit}</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Stock</div>
                            <div
                              className={cn(
                                "text-2xl font-bold leading-tight",
                                ok ? "text-foreground" : "text-destructive",
                              )}
                            >
                              {a.stock}
                              <span className="text-sm font-normal text-muted-foreground ml-1">{a.unit}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stock bar */}
                      <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden print:hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            ok ? "bg-green-500" : "bg-destructive",
                          )}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                      {!ok && (
                        <p className="text-xs text-destructive mt-2">
                          Faltam {a.totalQty - a.stock} {a.unit} no armazém
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "primary" | "info" | "accent" | "success" | "danger";
}) {
  const toneClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    info: "bg-blue-500/10 text-blue-500",
    accent: "bg-amber-500/10 text-amber-500",
    success: "bg-green-500/10 text-green-500",
    danger: "bg-destructive/10 text-destructive",
  };
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", toneClasses[tone])}>
          {icon}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold leading-tight">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}