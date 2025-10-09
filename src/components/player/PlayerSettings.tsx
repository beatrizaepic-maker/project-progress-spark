// src/components/player/PlayerSettings.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, User, Save, SettingsIcon as Settings } from 'lucide-react';
import { PlayerProfile } from '@/types/player';
import { updatePlayerProfile } from '@/services/playerService';

interface PlayerSettingsProps {
  profile: PlayerProfile;
  onSave: (updatedProfile: PlayerProfile) => void;
  className?: string;
}

const PlayerSettings: React.FC<PlayerSettingsProps> = ({ profile, onSave, className }) => {
  const [editedProfile, setEditedProfile] = useState<PlayerProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof PlayerProfile, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: keyof PlayerProfile['notificationPreferences'], value: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field: keyof PlayerProfile['privacySettings'], value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings!,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simula um atraso de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(editedProfile);
    setIsSaving(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Settings className="text-primary" />
          Configurações do Perfil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção de identidade */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Identidade</h3>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={editedProfile.avatar} alt={editedProfile.name} />
              <AvatarFallback className="bg-accent">
                <User className="h-8 w-8 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar</Label>
              <div className="flex gap-2">
                <Input 
                  id="avatar" 
                  value={editedProfile.avatar} 
                  onChange={(e) => handleChange('avatar', e.target.value)}
                  placeholder="URL do avatar"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                value={editedProfile.name} 
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Cargo/Função</Label>
              <Input 
                id="role" 
                value={editedProfile.role || ''} 
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Ex: Desenvolvedor, Designer, Gerente"
              />
            </div>
          </div>
        </div>

        {/* Preferências de notificação */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground">Notificações</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Email
                </Label>
                <p className="text-xs text-muted-foreground">Receber notificações por email</p>
              </div>
              <Switch 
                id="email-notifications"
                checked={editedProfile.notificationPreferences?.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="in-app-notifications" className="text-sm font-medium">
                  No App
                </Label>
                <p className="text-xs text-muted-foreground">Receber notificações dentro do app</p>
              </div>
              <Switch 
                id="in-app-notifications"
                checked={editedProfile.notificationPreferences?.inApp}
                onCheckedChange={(checked) => handleNotificationChange('inApp', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Push
                </Label>
                <p className="text-xs text-muted-foreground">Receber notificações push</p>
              </div>
              <Switch 
                id="push-notifications"
                checked={editedProfile.notificationPreferences?.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-summary" className="text-sm font-medium">
                  Resumo Semanal
                </Label>
                <p className="text-xs text-muted-foreground">Receber resumo semanal de atividades</p>
              </div>
              <Switch 
                id="weekly-summary"
                checked={editedProfile.notificationPreferences?.weeklySummary}
                onCheckedChange={(checked) => handleNotificationChange('weeklySummary', checked)}
              />
            </div>
          </div>
        </div>

        {/* Configurações de privacidade */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground">Privacidade</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profile-visibility">Visibilidade do Perfil</Label>
              <Select 
                value={editedProfile.privacySettings?.profileVisibility}
                onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
              >
                <SelectTrigger id="profile-visibility">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="team">Time</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="xp-visibility">Visibilidade de XP</Label>
              <Select 
                value={editedProfile.privacySettings?.xpVisibility}
                onValueChange={(value) => handlePrivacyChange('xpVisibility', value)}
              >
                <SelectTrigger id="xp-visibility">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="team">Time</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <Label htmlFor="share-with-team" className="text-sm font-medium">
                Compartilhar com Time
              </Label>
              <p className="text-xs text-muted-foreground">Compartilhar informações com o time</p>
            </div>
            <Switch 
              id="share-with-team"
              checked={editedProfile.privacySettings?.shareWithTeam}
              onCheckedChange={(checked) => handlePrivacyChange('shareWithTeam', checked as any)}
            />
          </div>
        </div>

        {/* Preferência de tema */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-lg font-semibold text-foreground">Aparência</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select 
                value={editedProfile.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => handleChange('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Botão de salvar */}
        <div className="pt-4">
          <Button 
            className="w-full md:w-auto" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="mr-2">Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerSettings;