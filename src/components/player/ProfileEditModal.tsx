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
import { supabase } from '@/lib/supabase';

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PlayerProfile;
  onSaved?: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ open, onOpenChange, profile, onSaved }) => {
  const { updateProfile, refreshUser } = useAuth();
  const { updatePlayer } = usePlayer();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Editar Perfil</DialogTitle>
        </DialogHeader>
          <PlayerSettings
          profile={profile}
          onSave={async (updatedProfile) => {
            const fullName = (updatedProfile.name || '').trim() || 'Usuário';
            const firstName = fullName.split(' ')[0] || fullName;
            const lastName = fullName.split(' ').slice(1).join(' ');

            try {
              // Atualiza metadata no supabase auth (via authService)
              await updateProfile({
                name: fullName,
                firstName,
                lastName,
                position: updatedProfile.role || 'Membro da Equipe',
                avatar: updatedProfile.avatar
              });

              // Força atualização do usuário para garantir que os dados estejam sincronizados
              await refreshUser();

              // Persistir também na tabela player_profiles via Supabase
              if (profile?.id) {
                const upsertPayload = {
                  user_id: profile.id,
                  name: fullName,
                  avatar: updatedProfile.avatar,
                  role: updatedProfile.role || profile.role,
                  theme: updatedProfile.theme || profile.theme,
                  updated_at: new Date().toISOString()
                };

                const { error } = await supabase
                  .from('player_profiles')
                  .upsert(upsertPayload, { onConflict: 'user_id' });

                if (error) {
                  console.error('Erro ao salvar player_profiles:', error);
                  throw error;
                }
              }

              // Atualiza o contexto local do player para refletir as mudanças
              updatePlayer({
                ...updatedProfile,
                name: fullName,
                avatar: updatedProfile.avatar,
                role: updatedProfile.role || 'Membro da Equipe'
              });

              if (onSaved) onSaved();
              onOpenChange(false);
            } catch (err) {
              console.error('Erro ao salvar perfil:', err);
              // fechar modal é intencional apenas após sucesso; manter aberto para correção
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
