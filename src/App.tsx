import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/gestao/Login.tsx";
import RegisterPage from "./pages/gestao/Register.tsx";
import GestaoLayout from "./components/gestao/GestaoLayout.tsx";
import Dashboard from "./pages/gestao/Dashboard.tsx";

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
            <Route path="/gestao/register" element={<RegisterPage />} />
            <Route path="/gestao" element={<GestaoLayout />}>
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
