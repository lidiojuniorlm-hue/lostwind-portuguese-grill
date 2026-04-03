import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/gestao/Login.tsx";
import GestaoLayout from "./components/gestao/GestaoLayout.tsx";
import Dashboard from "./pages/gestao/Dashboard.tsx";
import NovoPedido from "./pages/gestao/NovoPedido.tsx";
import Pedidos from "./pages/gestao/Pedidos.tsx";
import Relatorios from "./pages/gestao/Relatorios.tsx";
import Inventario from "./pages/gestao/Inventario.tsx";
import Financeiro from "./pages/gestao/Financeiro.tsx";
import Fornecedores from "./pages/gestao/Fornecedores.tsx";
import Produtos from "./pages/gestao/Produtos.tsx";
import Utilizadores from "./pages/gestao/Utilizadores.tsx";
import Configuracoes from "./pages/gestao/Configuracoes.tsx";
import Atividade from "./pages/gestao/Atividade.tsx";
import Validades from "./pages/gestao/Validades.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gestao/login" element={<LoginPage />} />
            <Route path="/gestao" element={<GestaoLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="novo-pedido" element={<NovoPedido />} />
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="fornecedores" element={<Fornecedores />} />
              <Route path="produtos" element={<Produtos />} />
              <Route path="utilizadores" element={<Utilizadores />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="atividade" element={<Atividade />} />
              <Route path="validades" element={<Validades />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
