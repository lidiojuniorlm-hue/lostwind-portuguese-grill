import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/warehouse";
import { Clock, ClipboardList, Package, TrendingUp, ArrowRight } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "order_created" | "status_changed";
  description: string;
  store: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
}

export default function Atividade() {
  const { user, orders, users } = useAuth();

  const activities: ActivityItem[] = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(o => {
        const creator = users.find(u => u.id === o.createdBy);
        const total = o.items.reduce((s, i) => s + i.unitPrice * i.qty * (1 + i.vatRate / 100), 0);
        return {
          id: o.id,
          type: "order_created" as const,
          description: `Pedido criado por ${creator?.name || "—"} para ${o.storeName}`,
          store: o.storeName,
          date: o.createdAt,
          status: o.status,
          total,
          itemCount: o.items.length,
        };
      });
  }, [orders, users]);

  const today = new Date().toLocaleDateString("pt-PT");
  const todayCount = activities.filter(a => new Date(a.date).toLocaleDateString("pt-PT") === today).length;

  const last7days = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return activities.filter(a => new Date(a.date) >= cutoff).length;
  }, [activities]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading text-foreground tracking-wide">Histórico de Atividade</h2>
        <p className="text-sm text-muted-foreground font-normal">Registo cronológico de todas as operações</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground font-normal">Hoje</span></div>
          <p className="text-xl font-heading text-foreground">{todayCount}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><ClipboardList className="w-4 h-4 text-blue-400" /><span className="text-xs text-muted-foreground font-normal">Últimos 7 dias</span></div>
          <p className="text-xl font-heading text-foreground">{last7days}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><Package className="w-4 h-4 text-green-400" /><span className="text-xs text-muted-foreground font-normal">Total Registos</span></div>
          <p className="text-xl font-heading text-foreground">{activities.length}</p>
        </CardContent></Card>
        <Card className="bg-card border-border"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-accent" /><span className="text-xs text-muted-foreground font-normal">Valor Total</span></div>
          <p className="text-xl font-heading text-foreground">€{activities.reduce((s, a) => s + a.total, 0).toFixed(0)}</p>
        </CardContent></Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm font-heading tracking-wide">Timeline</CardTitle></CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 font-normal">Nenhuma atividade registada</p>
          ) : (
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {activities.map((activity, idx) => {
                const d = new Date(activity.date);
                const prevDate = idx > 0 ? new Date(activities[idx - 1].date).toLocaleDateString("pt-PT") : null;
                const currentDate = d.toLocaleDateString("pt-PT");
                const showDateHeader = currentDate !== prevDate;

                return (
                  <div key={activity.id}>
                    {showDateHeader && (
                      <div className="sticky top-0 bg-card py-2 z-10">
                        <span className="text-xs text-primary font-heading tracking-wide">{d.toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {idx < activities.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-foreground font-normal">{activity.description}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-normal ${ORDER_STATUS_COLORS[activity.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                            {ORDER_STATUS_LABELS[activity.status as keyof typeof ORDER_STATUS_LABELS]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground font-normal">
                          <span>{d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
                          <span>{activity.itemCount} itens</span>
                          <span>€{activity.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
