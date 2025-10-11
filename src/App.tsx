import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUserDisplayName } from "@/utils/userSync";
import Navigation from "./components/Navigation";
import {
  CustomSidebar,
  CustomSidebarBody,
  CustomSidebarLink,
  useCustomSidebar
} from "./components/ui/custom-sidebar";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Home from "lucide-react/dist/esm/icons/home";
import CheckSquare from "lucide-react/dist/esm/icons/check-square";
import Edit3 from "lucide-react/dist/esm/icons/edit-3";
import SettingsIcon from "lucide-react/dist/esm/icons/settings";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import User from "lucide-react/dist/esm/icons/user";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Tasks from "./pages/Tasks";
import DataEditorPage from "./pages/DataEditor";
import SettingsPage from "./pages/Settings";
import RankingPage from "./pages/Ranking";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import ControlPage from "./pages/Control";

const queryClient = new QueryClient();

const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    label: "Análise",
    href: "/analytics",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    label: "Tarefas",
    href: "/tasks",
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    label: "Ranking",
    href: "/ranking",
    icon: <Trophy className="h-4 w-4" />,
  },
  {
    label: "Meu Perfil",
    href: "/profile/current",
    icon: <User className="h-4 w-4" />,
  },
  {
    label: "Editor",
    href: "/editor",
    icon: <Edit3 className="h-4 w-4" />,
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: <SettingsIcon className="h-4 w-4" />,
  },
];

const LogoSection = () => {
  const { open } = useCustomSidebar();
  const { user } = useAuth();

  // Função para obter o nome de exibição com limite de caracteres
  const getDisplayName = (user: any): string => {
    const displayName = getUserDisplayName(user);
    // Aplica limite de caracteres
    return displayName.length > 12 ? displayName.substring(0, 12) + '...' : displayName;
  };

  return (
    <div className={`flex items-center gap-2 px-2 py-4 mt-20 border-b border-border ${open ? 'justify-start' : 'justify-center'}`}>
      <div className="p-2 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 flex-shrink-0 rounded-full overflow-hidden">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="Avatar do usuário"
            className="h-6 w-6 object-cover rounded-full"
            onError={(e) => {
              // Fallback para avatar padrão se a imagem não carregar
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIgZmlsbD0iY3VycmVudENvbG9yIi8+Cjwvc3ZnPgo=";
            }}
          />
        ) : (
          <svg className="h-6 w-6 text-foreground" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        )}
      </div>
      {open && (
        <div className="font-bold text-lg text-foreground whitespace-nowrap overflow-hidden">
          {getDisplayName(user)}
        </div>
      )}
    </div>
  );
};

// Renderiza os links da sidebar com filtro por papel do usuário
const SidebarLinks: React.FC = () => {
  const { user } = useAuth();
  const rawRole = String((user as any)?.role || '').toLowerCase();
  const role: 'admin' | 'dev' | 'user' | 'manager' = (['admin','dev','user','manager'] as const).includes(rawRole as any) ? (rawRole as any) : 'user';
  const allowedForUser = new Set(['/tasks', '/ranking', '/profile/current']);
  const filtered = role === 'user'
    ? sidebarLinks.filter(l => allowedForUser.has(l.href) || l.href.startsWith('/profile'))
    : sidebarLinks; // admin/dev veem tudo

  return (
    <>
      {filtered.map((link) => (
        <CustomSidebarLink key={link.href} link={link} />
      ))}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          {/* Rota de login sem layout (sem sidebar e header) */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Todas as outras rotas com layout principal - Protegidas */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-background">
                <CustomSidebar>
                  <CustomSidebarBody className="gap-4">
                    <LogoSection />

                    {/* Navigation Links */}
                    <div className="flex-1 px-2">
                      <SidebarLinks />
                    </div>
                  </CustomSidebarBody>
                </CustomSidebar>

                <div className="md:ml-[60px] transition-all duration-300">
                  <Navigation />
                  <div className="pt-20">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/editor" element={<DataEditorPage />} />
                      <Route path="/ranking" element={<RankingPage />} />
                      <Route path="/profile/:playerId" element={<PlayerProfilePage />} />
                      <Route path="/profile" element={<PlayerProfilePage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/controle" element={<ProtectedRoute requireRole="manager"><ControlPage /></ProtectedRoute>} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
