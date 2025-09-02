import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Tasks from "./pages/Tasks";
import DataEditorPage from "./pages/DataEditor";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

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

  return (
    <div className={`flex items-center gap-2 px-2 py-4 mt-20 border-b border-border ${open ? 'justify-start' : 'justify-center'}`}>
      <div className="p-2 bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 flex-shrink-0">
        <img
          src="/LOGOEPIC.png"
          alt="EPIC Logo"
          className="h-6 w-6 object-contain"
        />
      </div>
      {open && (
        <div className="font-bold text-lg text-foreground whitespace-nowrap overflow-hidden">
          Epic Board
        </div>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="min-h-screen bg-background">
          <CustomSidebar>
            <CustomSidebarBody className="gap-4">
              <LogoSection />

              {/* Navigation Links */}
              <div className="flex-1 px-2">
                {sidebarLinks.map((link) => (
                  <CustomSidebarLink key={link.href} link={link} />
                ))}
              </div>
            </CustomSidebarBody>
          </CustomSidebar>

          <div className="md:ml-[60px] transition-all duration-300">
            <Navigation />
            <div className="pt-20">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/editor" element={<DataEditorPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
