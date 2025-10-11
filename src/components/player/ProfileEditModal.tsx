import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import PlayerSettings from '@/components/player/PlayerSettings';
import { PlayerProfile } from '@/types/player';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PlayerProfile;
  onSaved?: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ open, onOpenChange, profile, onSaved }) => {
  const { updateProfile } = useAuth();
  const { updatePlayer } = usePlayer();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Editar Perfil</DialogTitle>
        </DialogHeader>
        <PlayerSettings
          profile={profile}
          onSave={(updatedProfile) => {
            const fullName = (updatedProfile.name || '').trim() || 'Usuário';
            const firstName = fullName.split(' ')[0] || fullName;
            const lastName = fullName.split(' ').slice(1).join(' ');

            updateProfile({
              name: fullName,
              firstName,
              lastName,
              position: updatedProfile.role || 'Membro da Equipe',
              avatar: updatedProfile.avatar
            }).then(() => {
              updatePlayer({
                ...updatedProfile,
                name: fullName,
                avatar: updatedProfile.avatar,
                role: updatedProfile.role || 'Membro da Equipe'
              });
              if (onSaved) onSaved();
              onOpenChange(false);
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
