import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, Save, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserType } from '@/services/authService';

interface UserProfileEditProps {
  onClose?: () => void;
}

const UserProfileEdit: React.FC<UserProfileEditProps> = ({ onClose }) => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [editedUser, setEditedUser] = useState<Partial<UserType>>(user || {});
  const [isSaving, setIsSaving] = useState(false);

  // Estados para as notificações
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const handleChange = (field: keyof UserType, value: any) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await updateProfile(editedUser);
      if (response.success) {
        // Força atualização dos dados em todo o sistema
        refreshUser();
        
        // Pequeno delay para garantir que os dados foram atualizados
        setTimeout(() => {
          onClose?.();
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    // Simulação de upload - em produção, integraria com serviço de upload
    const avatarUrls = [
      '/avatars/user1.png',
      '/avatars/user2.png',
      '/avatars/admin.png',
      '/avatars/gabriel.png',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
      'https://api.dicebear.com/7.x/personas/svg?seed=' + Math.random()
    ];
    
    const randomAvatar = avatarUrls[Math.floor(Math.random() * avatarUrls.length)];
    handleChange('avatar', randomAvatar);
  };

  // Função de teste para simular mudanças rápidas
  const handleTestPersistence = async () => {
    const testData = {
      name: 'Teste Persistência',
      firstName: 'Teste',
      lastName: 'Persistência',
      position: 'Testador de Sistema',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
    };

    // Aplica as mudanças localmente primeiro
    setEditedUser(prev => ({ ...prev, ...testData }));
    
    // Depois salva
    await handleSave();
  };

  return (
    <div className="space-y-6">
      {/* Configurações do Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configurações do Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seção de identidade */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Identidade</h3>
            
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={editedUser.avatar} alt={editedUser.name} />
                <AvatarFallback className="bg-accent">
                  <User className="h-8 w-8 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <Label htmlFor="avatar">Avatar</Label>
                <div className="flex gap-2">
                  <Input 
                    id="avatar" 
                    value={editedUser.avatar || ''} 
                    onChange={(e) => handleChange('avatar', e.target.value)}
                    placeholder="/avatars/user1.png"
                  />
                  <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name"
                value={editedUser.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="João Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo/Função</Label>
              <Input 
                id="position"
                value={editedUser.position || ''}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Desenvolvedor Sênior"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Primeiro Nome</Label>
              <Input 
                id="firstName"
                value={editedUser.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="João"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input 
                id="lastName"
                value={editedUser.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Silva"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">Receber notificações por email</p>
            </div>
            <Switch 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>No App</Label>
              <p className="text-sm text-muted-foreground">Receber notificações dentro do app</p>
            </div>
            <Switch 
              checked={appNotifications} 
              onCheckedChange={setAppNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Push</Label>
              <p className="text-sm text-muted-foreground">Receber notificações push</p>
            </div>
            <Switch 
              checked={pushNotifications} 
              onCheckedChange={setPushNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Resumo Semanal</Label>
              <p className="text-sm text-muted-foreground">Receber resumo semanal de atividades</p>
            </div>
            <Switch 
              checked={weeklyDigest} 
              onCheckedChange={setWeeklyDigest}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>

        <Button 
          variant="secondary" 
          onClick={handleTestPersistence}
          disabled={isSaving}
        >
          Teste Rápido
        </Button>
        
        {onClose && (
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserProfileEdit;