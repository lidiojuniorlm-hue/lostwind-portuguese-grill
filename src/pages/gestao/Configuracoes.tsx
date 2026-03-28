import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Building2, Truck, FileText, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface CompanySettings {
  companyName: string;
  nif: string;
  address: string;
  phone: string;
  email: string;
  warehouseAddress: string;
  defaultDeliveryTime: string;
  guiaPrefix: string;
  invoicePrefix: string;
  logoUrl: string;
}

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: "Lost Wind Churrasqueira, Lda.",
  nif: "500 000 000",
  address: "Rua do Armazém, 123 — Carregado",
  phone: "+351 263 000 000",
  email: "geral@lostwind.pt",
  warehouseAddress: "Armazém Central, Carregado",
  defaultDeliveryTime: "Dia seguinte",
  guiaPrefix: "GT",
  invoicePrefix: "FT",
  logoUrl: "",
};

function loadSettings(): CompanySettings {
  try {
    const s = localStorage.getItem("lw_settings");
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export default function Configuracoes() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>(loadSettings);
  const [hasChanges, setHasChanges] = useState(false);

  if (!user || user.role !== "admin") return null;

  const update = (key: keyof CompanySettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem("lw_settings", JSON.stringify(settings));
    setHasChanges(false);
    toast.success("Configurações guardadas com sucesso!");
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("lw_settings");
    setHasChanges(false);
    toast.info("Configurações repostas ao padrão");
  };

  const handleClearData = () => {
    if (confirm("Tem a certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem("lw_orders");
      localStorage.removeItem("lw_suppliers");
      localStorage.removeItem("lw_settings");
      toast.success("Dados limpos. Recarregue a página para ver as alterações.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground tracking-wide">Configurações</h2>
          <p className="text-sm text-muted-foreground font-normal">Definições da empresa e do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="w-4 h-4 mr-1" /> Repor
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-1" /> Guardar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Nome da Empresa</Label><Input value={settings.companyName} onChange={e => update("companyName", e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs">NIF</Label><Input value={settings.nif} onChange={e => update("nif", e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs">Morada</Label><Input value={settings.address} onChange={e => update("address", e.target.value)} className="text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Telefone</Label><Input value={settings.phone} onChange={e => update("phone", e.target.value)} className="text-sm" /></div>
              <div><Label className="text-xs">Email</Label><Input value={settings.email} onChange={e => update("email", e.target.value)} className="text-sm" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" /> Logística
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Morada do Armazém</Label><Input value={settings.warehouseAddress} onChange={e => update("warehouseAddress", e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs">Tempo de Entrega Padrão</Label><Input value={settings.defaultDeliveryTime} onChange={e => update("defaultDeliveryTime", e.target.value)} className="text-sm" /></div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Prefixo Guias de Transporte</Label><Input value={settings.guiaPrefix} onChange={e => update("guiaPrefix", e.target.value)} className="text-sm" /></div>
              <div><Label className="text-xs">Prefixo Faturas</Label><Input value={settings.invoicePrefix} onChange={e => update("invoicePrefix", e.target.value)} className="text-sm" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2">
              <Settings className="w-4 h-4 text-destructive" /> Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground font-normal">Limpar todos os pedidos, fornecedores e configurações. Os produtos e utilizadores serão mantidos.</p>
            <Button variant="outline" size="sm" onClick={handleClearData} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Limpar Todos os Dados
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
