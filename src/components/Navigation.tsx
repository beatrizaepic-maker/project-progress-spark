import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  CheckSquare, 
  Edit3, 
  Home, 
  Settings,
  TrendingUp
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: Home,
    },
    {
      path: "/analytics",
      label: "Análise",
      icon: TrendingUp,
    },
    {
      path: "/tasks",
      label: "Tarefas",
      icon: CheckSquare,
    },
    {
      path: "/editor",
      label: "Editor",
      icon: Edit3,
    },
    {
      path: "/settings",
      label: "Configurações",
      icon: Settings,
    },
  ];

  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2 py-4">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Project Spark</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;