import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings, useSettingsMutation } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Building2, Truck, FileText, Save, RotateCcw, Loader2 } from "lucide-react";
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
};

export default function Configuracoes() {
  const { user } = useAuth();
  const { data: settingsMap, isLoading } = useSettings();
  const saveSetting = useSettingsMutation();
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settingsMap) {
      setSettings({
        companyName: (settingsMap.company_name as any) || DEFAULT_SETTINGS.companyName,
        nif: (settingsMap.company_nif as any) || DEFAULT_SETTINGS.nif,
        address: (settingsMap.company_address as any) || DEFAULT_SETTINGS.address,
        phone: (settingsMap.company_phone as any) || DEFAULT_SETTINGS.phone,
        email: (settingsMap.company_email as any) || DEFAULT_SETTINGS.email,
        warehouseAddress: (settingsMap.warehouse_address as any) || DEFAULT_SETTINGS.warehouseAddress,
        defaultDeliveryTime: (settingsMap.delivery_time as any) || DEFAULT_SETTINGS.defaultDeliveryTime,
        guiaPrefix: (settingsMap.guia_prefix as any) || DEFAULT_SETTINGS.guiaPrefix,
        invoicePrefix: (settingsMap.invoice_prefix as any) || DEFAULT_SETTINGS.invoicePrefix,
      });
    }
  }, [settingsMap]);

  if (!user || user.role !== "admin") return null;

  const update = (key: keyof CompanySettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const pairs: [string, any][] = [
      ["company_name", settings.companyName],
      ["company_nif", settings.nif],
      ["company_address", settings.address],
      ["company_phone", settings.phone],
      ["company_email", settings.email],
      ["warehouse_address", settings.warehouseAddress],
      ["delivery_time", settings.defaultDeliveryTime],
      ["guia_prefix", settings.guiaPrefix],
      ["invoice_prefix", settings.invoicePrefix],
    ];
    for (const [key, value] of pairs) {
      await saveSetting.mutateAsync({ key, value });
    }
    setHasChanges(false);
    toast.success("Configurações guardadas com sucesso!");
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-heading text-foreground tracking-wide">Configurações</h2>
          <p className="text-sm text-muted-foreground font-normal">Definições da empresa e do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}><RotateCcw className="w-4 h-4 mr-1" /> Repor</Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || saveSetting.isPending}>
            {saveSetting.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Guardar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Dados da Empresa</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2"><Truck className="w-4 h-4 text-primary" /> Logística</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs">Morada do Armazém</Label><Input value={settings.warehouseAddress} onChange={e => update("warehouseAddress", e.target.value)} className="text-sm" /></div>
            <div><Label className="text-xs">Tempo de Entrega Padrão</Label><Input value={settings.defaultDeliveryTime} onChange={e => update("defaultDeliveryTime", e.target.value)} className="text-sm" /></div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm font-heading tracking-wide flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Documentos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Prefixo Guias</Label><Input value={settings.guiaPrefix} onChange={e => update("guiaPrefix", e.target.value)} className="text-sm" /></div>
              <div><Label className="text-xs">Prefixo Faturas</Label><Input value={settings.invoicePrefix} onChange={e => update("invoicePrefix", e.target.value)} className="text-sm" /></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
