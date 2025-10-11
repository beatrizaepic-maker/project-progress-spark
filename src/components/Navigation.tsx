import React from "react";
import logoEpic from "@/LOGOEPIC.png";
import LivingNebulaShader from "./effects/LivingNebulaShader";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import ProfileEditModal from "@/components/player/ProfileEditModal";
import { usePlayer } from "@/contexts/PlayerContext";
import type { PlayerProfile } from "@/types/player";

const Navigation = () => {
  const { user, logout } = useAuth();
  const { state } = usePlayer();
  const [openProfileModal, setOpenProfileModal] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass overflow-hidden">
      <LivingNebulaShader />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 py-4">
            <img src={logoEpic} alt="Epic Logo" className="h-10 w-10 drop-shadow-sm" />
            <span className="font-bold text-2xl text-foreground text-shadow ethnocentric-header">
              Epic Board
            </span>
          </div>
          
          {/* Menu do usuário */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      Perfil: {user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    // Radix uses onSelect for keyboard/mouse selection. Prevent default to keep menu open logic consistent
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    if (e.shiftKey) {
                      // Abrir modal reutilizando o mesmo do /profile/current
                      setOpenProfileModal(true);
                    } else {
                      navigate('/profile/current');
                    }
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Editar Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Modal de Edição de Perfil (Shift+Click) */}
      {(() => {
        const fallbackProfile: PlayerProfile | null = user
          ? {
              id: String(user.id),
              name: user.name || 'Usuário',
              username: undefined,
              avatar: user.avatar || '/avatars/user1.png',
              role: user.position || 'Membro da Equipe',
              department: undefined,
              joinedDate: new Date().toISOString(),
              isActive: true,
              xp: 0,
              level: 1,
              weeklyXp: 0,
              monthlyXp: 0,
              streak: 0,
              bestStreak: 0,
              missionsCompleted: 0,
              tasksCompleted: 0,
              notificationPreferences: {
                email: true,
                inApp: true,
                push: false,
                weeklySummary: true,
                missionUpdates: true,
                taskReminders: true,
              },
              privacySettings: {
                profileVisibility: 'team',
                xpVisibility: 'team',
                activityVisibility: 'team',
                shareWithTeam: true,
              },
              theme: 'dark',
            }
          : null;
        const profileToUse = state.profile || fallbackProfile;
        return profileToUse ? (
          <ProfileEditModal
            open={openProfileModal}
            onOpenChange={setOpenProfileModal}
            profile={profileToUse}
          />
        ) : null;
      })()}
    </nav>
  );
};

export default Navigation;