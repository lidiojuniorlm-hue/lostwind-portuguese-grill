import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SECTIONS, type Section } from "@/types/warehouse";
import { Package, AlertTriangle, CheckCircle, Search } from "lucide-react";

export default function Inventario() {
  const { products, orders } = useAuth();
  const [search, setSearch] = useState("");
  const [filterSection, setFilterSection] = useState<string>("todas");

  // Calculate stock movements from orders
  const stockData = useMemo(() => {
    return products.map(p => {
      const totalOut = orders
        .filter(o => o.status !== "cancelado")
        .reduce((sum, o) => sum + o.items.filter(i => i.productId === p.id).reduce((s, i) => s + i.qty, 0), 0);

      const delivered = orders
        .filter(o => o.status === "entregue")
        .reduce((sum, o) => sum + o.items.filter(i => i.productId === p.id).reduce((s, i) => s + i.qty, 0), 0);

      const pending = orders
        .filter(o => ["pendente", "em_preparacao", "pronto"].includes(o.status))
        .reduce((sum, o) => sum + o.items.filter(i => i.productId === p.id).reduce((s, i) => s + i.qty, 0), 0);

      const estimatedStock = 100 - totalOut; // simulated initial stock of 100
      const status: "ok" | "low" | "critical" = estimatedStock <= 10 ? "critical" : estimatedStock <= 30 ? "low" : "ok";

      return { ...p, totalOut, delivered, pending, estimatedStock: Math.max(0, estimatedStock), status };
    });
  }, [products, orders]);

  const filtered = stockData.filter(p =>
    (filterSection === "todas" || p.section === filterSection) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = stockData.filter(p => p.status === "critical").length;
  const lowCount = stockData.filter(p => p.status === "low").length;
  const totalMovements = stockData.reduce((s, p) => s + p.totalOut, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground">Inventário & Stock</h2>
        <p className="text-sm text-muted-foreground">Controlo de stock e movimentações de produtos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Produtos</span>
            </div>
            <p className="text-xl font-heading text-foreground">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Total Movimentado</span>
            </div>
            <p className="text-xl font-heading text-foreground">{totalMovements}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Stock Baixo</span>
            </div>
            <p className="text-xl font-heading text-foreground">{lowCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Stock Crítico</span>
            </div>
            <p className="text-xl font-heading text-foreground">{criticalCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Pesquisar produto..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-foreground">
          <option value="todas">Todas as secções</option>
          {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stock Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 px-4">Produto</th>
                  <th className="text-left py-3 px-4">Secção</th>
                  <th className="text-center py-3 px-4">Unidade</th>
                  <th className="text-center py-3 px-4">Stock Est.</th>
                  <th className="text-center py-3 px-4">Pendente</th>
                  <th className="text-center py-3 px-4">Entregue</th>
                  <th className="text-center py-3 px-4">Total Saídas</th>
                  <th className="text-center py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-3 px-4 text-foreground font-medium">{p.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.section}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{p.unit}</td>
                    <td className="py-3 px-4 text-center text-foreground font-medium">{p.estimatedStock}</td>
                    <td className="py-3 px-4 text-center text-yellow-400">{p.pending || "-"}</td>
                    <td className="py-3 px-4 text-center text-green-400">{p.delivered || "-"}</td>
                    <td className="py-3 px-4 text-center text-foreground">{p.totalOut}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        p.status === "critical" ? "bg-destructive/20 text-destructive" :
                        p.status === "low" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {p.status === "critical" ? "Crítico" : p.status === "low" ? "Baixo" : "OK"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
