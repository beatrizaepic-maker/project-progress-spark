import { DataProvider } from "@/contexts/DataContext";
import { getTasksData, getGamificationUsers, getSystemUsers, getGamificationTasks } from "@/services/localStorageData";
import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Save from "lucide-react/dist/esm/icons/save";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import Target from "lucide-react/dist/esm/icons/target";
import Star from "lucide-react/dist/esm/icons/star";
import Award from "lucide-react/dist/esm/icons/award";
import Gift from "lucide-react/dist/esm/icons/gift";
import SettingsIcon from "lucide-react/dist/esm/icons/settings";
import Info from "lucide-react/dist/esm/icons/info";
import X from "lucide-react/dist/esm/icons/x";
import UserDataDebug from "@/components/debug/UserDataDebug";
import UserSyncTester from "@/components/debug/UserSyncTester";
import Flame from "lucide-react/dist/esm/icons/flame";
import { getDailyStreakBonusXp, setDailyStreakBonusXp, isStreakEnabled, setStreakEnabled, getStreakIncludeIn, setStreakIncludeIn } from "@/config/streak";
import { getAllLastAccess } from "@/services/authService";
import { LevelRule, getLevelRules, setLevelRules, isThisMonth, isThisWeek, updateRanking, calculateUserProductivity } from "@/services/gamificationService";
import { getSeasonConfig, setSeasonConfig, isInSeason, getDefaultSeason, type SeasonConfig } from "@/config/season";

// Tipos para os componentes
interface LabeledInputProps {
  label: string;
  id: string;
  type?: string;
  min?: number;
  max?: number;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}

// Componente para efeito de partículas no botão
type ParticleButtonProps = ButtonProps & {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

const ParticleButton = ({ children, onClick, className, variant = "default", size = "default", ...props }: ParticleButtonProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowParticles(true);
    
    if (onClick) onClick(e);
    
    // Resetar partículas após 1.6 segundos
    setTimeout(() => {
      setShowParticles(false);
    }, 1600);
  };

  const SuccessParticles = () => {
    if (!buttonRef || !showParticles) return null;

    const rect = buttonRef.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const particleCount = 23;

    return (
      <>
        {Array.from({ length: particleCount }).map((_, i) => (
          <motion.div
            key={i}
            className="fixed w-1 h-1 rounded-full bg-[#FF0066]"
            style={{ left: centerX, top: centerY }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 150],
              y: [0, (Math.random() - 0.5) * 150],
            }}
            transition={{
              duration: 1.6,
              delay: i * 0.03,
              ease: "easeOut",
            }}
          />
        ))}
      </>
    );
  };

  return (
    <>
      {showParticles && <SuccessParticles />}
      <Button
        ref={setButtonRef}
        onClick={handleClick}
        className={`bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold rounded-none shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105 transition-all ${className}`}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </Button>
    </>
  );
};

// Componente de card reutilizável
const SettingsCard = ({ title, children, icon: Icon }) => {
  return (
    <div className="bg-[#1A1A2E] p-6 border-2 border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-[#FF0066]" size={24} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Componente de input com label
const LabeledInput: React.FC<LabeledInputProps> = ({ label, id, type = "text", min, max, ...props }) => {
  const inputProps = {
    id,
    type,
    min,
    max,
    className: "border-[#6A0DAD] focus:border-[#FF0066] bg-[#1A1A2E]/60 text-white",
    ...props
  };
  
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#C0C0C0]">
        {label}
      </label>
      <Input {...inputProps} />
    </div>
  );
};

// Componente de seletor
interface SelectInputProps {
  label: string;
  id: string;
  options: Array<{value: string, label: string}>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  [key: string]: any;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, options, ...props }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#C0C0C0]">
        {label}
      </label>
      <select
        id={id}
        className="flex h-10 w-full rounded-md border border-[#6A0DAD] bg-[#1A1A2E]/60 px-3 py-2 text-base text-white focus:border-[#FF0066] focus:outline-none"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1A1A2E]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Tipos de missões
type MissionType = 
  | 'complete_tasks'           // Completar N tarefas
  | 'complete_early'           // Completar N tarefas adiantadas
  | 'attend_meetings'          // Participar de N reuniões
  | 'review_peer_tasks'        // Revisar N tarefas de colegas
  | 'streak_days'              // Manter sequência por N dias
  | 'no_delays'                // Não atrasar nenhuma tarefa
  | 'high_effort_tasks';       // Completar tarefas de alta dificuldade


const Settings = () => {
  // Detecta se o usuário atual é DEV
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('epic_user_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const isDevUser = currentUser?.role === 'DEV' || currentUser?.access === 'DEV';
  const [pointsPerTask, setPointsPerTask] = useState(10);
  const [earlyTaskPercentage, setEarlyTaskPercentage] = useState(() => {
    const config = localStorage.getItem('epic_productivity_config_v1');
    return config ? JSON.parse(config).early || 110 : 110;
  });
  const [onTimeTaskPercentage, setOnTimeTaskPercentage] = useState(() => {
    const config = localStorage.getItem('epic_productivity_config_v1');
    return config ? JSON.parse(config).on_time || 100 : 100;
  });
  const [delayedTaskPercentage, setDelayedTaskPercentage] = useState(() => {
    const config = localStorage.getItem('epic_productivity_config_v1');
    return config ? JSON.parse(config).late || 50 : 50;
  });
  const [refactoredTaskPercentage, setRefactoredTaskPercentage] = useState(() => {
    const config = localStorage.getItem('epic_productivity_config_v1');
    return config ? JSON.parse(config).refacao || 40 : 40;
  });
  const [bonusPercentage, setBonusPercentage] = useState(20);
  const [levelThreshold, setLevelThreshold] = useState(100);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [rewardFrequency, setRewardFrequency] = useState("weekly");
  const [showToast, setShowToast] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ player: "", xp: 0, item: "" });
  const [modalJustification, setModalJustification] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [dailyStreakXp, setDailyStreakXp] = useState<number>(() => getDailyStreakBonusXp());
  const [streakEnabled, setStreakEnabledState] = useState<boolean>(() => isStreakEnabled());
  const [streakInclude, setStreakInclude] = useState<{ total: boolean; weekly: boolean; monthly: boolean }>(() => getStreakIncludeIn());
  
  // Estados para configuração do sistema de níveis
  const [levelRules, setLevelRulesState] = useState<LevelRule[]>(() => getLevelRules());
  const [showLevelDetails, setShowLevelDetails] = useState(false);
  // Estados para configuração de Missões
    const [missionName, setMissionName] = useState("");
    const [missionDescription, setMissionDescription] = useState("");
    const [missionType, setMissionType] = useState<MissionType>('complete_tasks');
    const [missionTarget, setMissionTarget] = useState(1);
    const [missionXpReward, setMissionXpReward] = useState(10);
    const [missionFrequency, setMissionFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [missionStart, setMissionStart] = useState("");
    const [missionEnd, setMissionEnd] = useState("");
    const [missionContinuous, setMissionContinuous] = useState(false);
    const [missionActive, setMissionActive] = useState(true);
    // Lista de missões e seleção
    const [missionList, setMissionList] = useState(() => {
      try {
        const stored = localStorage.getItem('epic_mission_list_v1');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    });
    const [selectedMissionIdx, setSelectedMissionIdx] = useState<number>(-1);

    // Atualiza campos ao selecionar missão
    useEffect(() => {
      if (selectedMissionIdx >= 0 && missionList[selectedMissionIdx]) {
        const m = missionList[selectedMissionIdx];
        setMissionName(m.name || "");
        setMissionDescription(m.description || "");
        setMissionType(m.type || 'complete_tasks');
        setMissionTarget(m.target || 1);
        setMissionXpReward(m.xpReward || 10);
        setMissionFrequency(m.frequency || 'weekly');
        setMissionStart(m.start || "");
        setMissionEnd(m.end || "");
        setMissionContinuous(!!m.continuous);
        setMissionActive(!!m.active);
      } else {
        setMissionName("");
        setMissionDescription("");
        setMissionType('complete_tasks');
        setMissionTarget(1);
        setMissionXpReward(10);
        setMissionFrequency('weekly');
        setMissionStart("");
        setMissionEnd("");
        setMissionContinuous(false);
        setMissionActive(true);
      }
    }, [selectedMissionIdx, missionList]);
  
  // Estado para a configuração de temporada
  const [season, setSeason] = useState<SeasonConfig>(() => {
    const saved = getSeasonConfig();
    return saved || {
      name: '',
      description: '',
      startIso: new Date().toISOString(),
      endIso: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias a partir de hoje
    };
  });
  // Estado para lista e seleção de temporadas
  const [seasonList, setSeasonList] = useState<SeasonConfig[]>(() => {
    try {
      const stored = localStorage.getItem('epic_season_list_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState<number>(0);

  const handleSaveSeason = () => {
    try {
      if (!season.name || !season.startIso || !season.endIso) {
        toast({
          title: "❌ Dados incompletos",
          description: "Preencha Nome, Início e Fim da temporada.",
          variant: "destructive",
        });
        return;
      }
      const start = new Date(season.startIso).getTime();
      const end = new Date(season.endIso).getTime();
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
        toast({
          title: "❌ Período inválido",
          description: "A data de início deve ser anterior ou igual à data de término.",
          variant: "destructive",
        });
        return;
      }
      // Atualiza ou adiciona temporada
      let updatedList = [...seasonList];
      const idx = updatedList.findIndex(s => s.startIso === season.startIso && s.endIso === season.endIso);
      if (idx >= 0) {
        updatedList[idx] = season;
      } else {
        updatedList.push(season);
      }
      setSeasonList(updatedList);
      localStorage.setItem('epic_season_list_v1', JSON.stringify(updatedList));
      setSelectedSeasonIdx(updatedList.length - 1);
      setSeasonConfig(season);
      toast({
        title: "✅ Temporada salva",
        description: `${season.name} (${new Date(season.startIso).toLocaleDateString('pt-BR')} — ${new Date(season.endIso).toLocaleDateString('pt-BR')})`,
        className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
        duration: 3000,
      });
    } catch (e: any) {
      toast({ title: "Erro ao salvar temporada", description: String(e?.message || e), variant: "destructive" });
    }
  };

  // Handler para seleção de temporada
  const handleSelectSeason = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setSelectedSeasonIdx(idx);
  setSeason(seasonList[idx] || getDefaultSeason());
  };

  // Usuários canônicos (Auth DB)
  const taskData = getTasksData();
  const systemUsers = getSystemUsers();
  const users = systemUsers.map(u => u.name);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedAccess, setSelectedAccess] = useState<'Player' | 'Adm' | 'DEV'>("Player");
  const [accessLevels, setAccessLevels] = useState<Record<string, 'Player' | 'Adm' | 'DEV'>>({});

  const applyAccessLevel = () => {
    if (!selectedUser) {
      toast({
        title: "ℹ️ Selecione um usuário",
        description: "Escolha um usuário para alterar o nível de acesso.",
        className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
        duration: 3000,
      });
      return;
    }

    setAccessLevels(prev => ({ ...prev, [selectedUser]: selectedAccess }));
    toast({
      title: "✅ Nível de acesso atualizado",
      description: `${selectedUser} agora é ${selectedAccess}.`,
      className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
  };

  const handleSave = () => {
    // Salvar as regras de níveis
    setLevelRules(levelRules);
    
    // Aqui iria a lógica para salvar as outras configurações
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const applyDailyStreak = () => {
    setDailyStreakBonusXp(dailyStreakXp);
    toast({
      title: "✅ Bônus diário atualizado",
      description: `Novo valor: +${dailyStreakXp} XP por login diário`,
      className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
  };

  const applyDailyStreakConfig = () => {
    setStreakEnabled(streakEnabled);
    setStreakIncludeIn(streakInclude);
    toast({
      title: "✅ Configuração de streak salva",
      description: `Status: ${streakEnabled ? 'Ativo' : 'Inativo'} • Inclusão: ${[
        streakInclude.total ? 'Total' : null,
        streakInclude.weekly ? 'Semanal' : null,
        streakInclude.monthly ? 'Mensal' : null,
      ].filter(Boolean).join(', ') || 'Nenhuma'}`,
      className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
  };

  // Salvar tudo do card de Streak (um único botão)
  const saveStreakCard = () => {
    setDailyStreakBonusXp(dailyStreakXp);
    setStreakEnabled(streakEnabled);
    setStreakIncludeIn(streakInclude);
    toast({
      title: "✅ Streak atualizado",
      description: `Bônus diário: +${dailyStreakXp} XP • Status: ${streakEnabled ? 'Ativo' : 'Inativo'} • Inclusão: ${[
        streakInclude.total ? 'Total' : null,
        streakInclude.weekly ? 'Semanal' : null,
        streakInclude.monthly ? 'Mensal' : null,
      ].filter(Boolean).join(', ') || 'Nenhuma'}`,
      className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
  };

  // Função para salvar missão (pode ser expandida para persistência real)
  const handleSaveMission = () => {
    if (!missionName) {
      toast({
        title: "❌ Nome obrigatório",
        description: "Informe o nome da missão.",
        variant: "destructive",
      });
      return;
    }
    if (!missionContinuous && (!missionStart || !missionEnd)) {
      toast({
        title: "❌ Vigência obrigatória",
        description: "Informe início e fim ou marque como contínuo.",
        variant: "destructive",
      });
      return;
    }
    const missionObj = {
      name: missionName,
      description: missionDescription,
      type: missionType,
      target: missionTarget,
      xpReward: missionXpReward,
      frequency: missionFrequency,
      start: missionStart,
      end: missionEnd,
      continuous: missionContinuous,
      active: missionActive,
    };
    let updatedList = [...missionList];
    if (selectedMissionIdx >= 0 && missionList[selectedMissionIdx]) {
      updatedList[selectedMissionIdx] = missionObj;
    } else {
      updatedList.push(missionObj);
      setSelectedMissionIdx(updatedList.length - 1);
    }
    setMissionList(updatedList);
    localStorage.setItem('epic_mission_list_v1', JSON.stringify(updatedList));
    toast({
      title: "✅ Missão salva",
      description: `Missão "${missionName}" configurada com sucesso!`,
      className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
    // Avalia e aplica missões globais após salvar/ativar
    try {
      const { evaluateAndApplyAllMissions } = require('@/services/missionService');
      evaluateAndApplyAllMissions();
    } catch (e) {
      console.warn('Falha ao avaliar missões após salvar:', e);
    }
  };

  return (
    <DataProvider initialTasks={taskData}>
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Configurações */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-[#FF0066] to-[#6A0DAD] bg-clip-text text-transparent">
                Configurações de Gamificação
              </span>
            </h2>
            <p className="text-[#C0C0C0]">Personalize seu sistema de gamificação e pontuação</p>
          </div>

          <div className="w-full flex flex-col" style={{ gap: '25px' }}>
            {/* Pontos e Conquistas Especiais (agora inclui configurações de pontuação) */}
            <SettingsCard title="Pontos e Conquistas Especiais" icon={Award}>
              {/* Nenhum campo de pontuação geral exibido conforme solicitado */}
              {/* Tabela de conquistas especiais */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#6A0DAD]/80 to-[#FF0066]/80 text-white">
                      <th className="px-3 py-2 font-semibold">Opção</th>
                      <th className="px-3 py-2 font-semibold">Pontuação</th>
                      <th className="px-3 py-2 font-semibold">Ativo</th>
                      {/* Observação column removed as requested */}
                      <th className="px-3 py-2 font-semibold">Player</th>
                      <th className="px-3 py-2 font-semibold">Ajuste Individual (XP)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1A1A2E] divide-y divide-[#6A0DAD]/30">
                    {[ 
                      { label: "Solucionar um problema criativo" },
                      { label: "Ajudar um Épico" },
                      { label: "Feedback recebido com elogio do cliente ou gestores" },
                      { label: "Criar uma melhoria de processo" },
                      { label: "Entrega acima da média" },
                    ].map((item, idx) => {
                      // Estados locais para cada linha
                      const [selectedUser, setSelectedUser] = React.useState("");
                      const [xpValue, setXpValue] = React.useState(0);
                      const [saving, setSaving] = React.useState(false);

                      const handleSaveXP = () => {
                        // Abrir modal de confirmação com os dados da linha
                        setModalData({ player: selectedUser, xp: xpValue, item: item.label });
                        setModalJustification("");
                        setConfirmModalOpen(true);
                      };

                      return (
                        <tr key={item.label} className="hover:bg-[#6A0DAD]/10">
                          <td className="px-3 py-2 text-white font-medium">{item.label}</td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              defaultValue={10}
                              className="w-20 border-[#6A0DAD] bg-[#1A1A2E]/60 text-white"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" className="w-4 h-4 accent-[#FF0066]" defaultChecked />
                          </td>
                          {/* Observação cell removed */}
                          <td className="px-3 py-2">
                            <select
                              className="w-40 rounded-md border-[#FF0066] bg-[#1A1A2E]/60 text-white px-2 py-1"
                              value={selectedUser}
                              onChange={e => setSelectedUser(e.target.value)}
                            >
                              <option value="">Selecione...</option>
                              {getSystemUsers().map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 flex gap-2 items-center">
                            <Input
                              type="number"
                              min={-100}
                              max={100}
                              value={xpValue}
                              onChange={e => setXpValue(Number(e.target.value))}
                              className="w-24 border-[#FF0066] bg-[#1A1A2E]/60 text-white"
                              placeholder="XP +/-"
                            />
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold rounded-none shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105 transition-all px-3 py-1 text-xs"
                              disabled={!selectedUser || xpValue === 0 || saving}
                              onClick={handleSaveXP}
                            >
                              {saving ? "Salvando..." : "SALVAR"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SettingsCard>

            {/* Streak Diário (unificado) - posicionado logo abaixo do card anterior */}
            <SettingsCard title="Streak Diário (Login)" icon={Flame}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <LabeledInput
                  label="XP por login diário"
                  id="dailyStreakXp"
                  type="number"
                  min={0}
                  max={100}
                  value={dailyStreakXp}
                  onChange={(e) => setDailyStreakXp(Math.max(0, Number(e.target.value)))}
                />
                <div className="md:col-span-2">
                  <p className="text-sm text-[#C0C0C0] mb-3">
                    O bônus é creditado no primeiro login do dia. Ele soma ao XP do ranking (total, semanal e mensal),
                    sem afetar o cálculo percentual de produtividade das tarefas.
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="streakEnabled"
                    className="w-4 h-4 accent-[#FF0066]"
                    checked={streakEnabled}
                    onChange={(e) => setStreakEnabledState(e.target.checked)}
                  />
                  <label htmlFor="streakEnabled" className="text-white text-sm">Ativar bônus diário de login</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeTotal"
                      className="w-4 h-4 accent-[#FF0066]"
                      checked={streakInclude.total}
                      onChange={(e) => setStreakInclude(prev => ({ ...prev, total: e.target.checked }))}
                    />
                    <label htmlFor="includeTotal" className="text-white text-sm">Somar ao XP Total</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeWeekly"
                      className="w-4 h-4 accent-[#FF0066]"
                      checked={streakInclude.weekly}
                      onChange={(e) => setStreakInclude(prev => ({ ...prev, weekly: e.target.checked }))}
                    />
                    <label htmlFor="includeWeekly" className="text-white text-sm">Somar ao XP Semanal</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeMonthly"
                      className="w-4 h-4 accent-[#FF0066]"
                      checked={streakInclude.monthly}
                      onChange={(e) => setStreakInclude(prev => ({ ...prev, monthly: e.target.checked }))}
                    />
                    <label htmlFor="includeMonthly" className="text-white text-sm">Somar ao XP Mensal</label>
                  </div>
                </div>
                <ParticleButton onClick={saveStreakCard} className="w-full md:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Salvar Streak
                </ParticleButton>
              </div>
            </SettingsCard>
            
            {/* Tabela de Usuários do Sistema */}
            <SettingsCard title="Usuários do Sistema" icon={Target}>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#6A0DAD]/80 to-[#FF0066]/80 text-white">
                        <th className="px-4 py-3 font-semibold">Nome</th>
                        <th className="px-4 py-3 font-semibold">E-mail</th>
                        <th className="px-4 py-3 font-semibold">% Aproveitamento</th>
                        <th className="px-4 py-3 font-semibold">XP Total</th>
                        <th className="px-4 py-3 font-semibold">Último Acesso</th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#1A1A2E] divide-y divide-[#6A0DAD]/30">
                      {(() => {
                        // Carrega usuários canônicos + gamificação
                        const gamificationUsers = getGamificationUsers();
                        const canonical = getSystemUsers();
                        const allGamTasks = getGamificationTasks() || [];
                        
                        // Obter logs de acesso
                        const accessLogs = getAllLastAccess();
                        
                        // Mapeia os logs de acesso para nomes de usuários
                        const accessLogsByName: Record<string, string> = {};
                        canonical.forEach(user => {
                          if (accessLogs[user.id]) {
                            // Converte a data ISO para formato legível
                            const date = new Date(accessLogs[user.id]);
                            accessLogsByName[user.name] = new Intl.DateTimeFormat('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).format(date);
                          }
                        });
                        
                        // Define temporada vigente (padrão: mês atual). Futuro: ler de settings.
                        const inSeason = (date?: string) => isInSeason(date);

                        // Agrupa tarefas de gamificação por usuário (apenas da temporada)
                        const userTasksMap: Record<string, import("@/services/gamificationService").Task[]> = {};
                        allGamTasks.forEach(t => {
                          if (!t.assignedTo) return;
                          // Considera completedDate ou dueDate para janela da temporada
                          if (!inSeason(t.completedDate || t.dueDate)) return;
                          if (!userTasksMap[t.assignedTo]) userTasksMap[t.assignedTo] = [];
                          userTasksMap[t.assignedTo].push(t);
                        });

                        // Ranking atualizado para XP Total real
                        const rankedUsers = updateRanking(gamificationUsers, allGamTasks);
                        
                        // Combina dados (canônicos primeiro)
                        const allUsers = Array.from(new Set([
                          ...canonical.map(u => u.name),
                          ...gamificationUsers.map(u => u.name),
                        ]));
                        
                        // Se não há usuários, mostra mensagem
                        if (allUsers.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="px-4 py-6 text-center text-[#C0C0C0]">
                                Nenhum usuário cadastrado no sistema.
                              </td>
                            </tr>
                          );
                        }
                        
                        return allUsers.map((userName, idx) => {
                          // Dados canônicos + gamificação
                          const sysUser = canonical.find(u => u.name === userName);
                          const gamUser = gamificationUsers.find(u => u.name === userName);
                          const gamUserId = gamUser?.id || sysUser?.id || '';
                          const userTaskList = gamUserId ? (userTasksMap[gamUserId] || []) : [];
                          
                          // Calcula estatísticas
                          const prod = calculateUserProductivity(userTaskList);
                          const utilizationPercent = prod.averagePercentRounded;
                          
                          // Último acesso (usa o registro de log de acesso mais recente)
                          const lastAccess = accessLogsByName[userName] || 'Não disponível';
                          
                          // XP Total (da gamificação - ranking real)
                          const ranked = rankedUsers.find(u => u.name === userName);
                          const xpTotal = ranked ? ranked.xp : (gamUser?.xp || 0);
                          
                          // E-mail real do Auth DB quando disponível
                          const email = sysUser?.email || `${userName.toLowerCase().replace(/\s+/g, '.')}@empresa.com.br`;
                          
                          return (
                            <tr key={idx} className="hover:bg-[#6A0DAD]/10">
                              <td className="px-4 py-3 text-white">{userName}</td>
                              <td className="px-4 py-3 text-[#C0C0C0]">{email}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="w-full bg-[#1A1A2E] rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] h-2 rounded-full" 
                                      style={{ width: `${utilizationPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-white">{utilizationPercent}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium text-[#FF0066]">{xpTotal} XP</td>
                              <td className="px-4 py-3 text-[#C0C0C0]">{lastAccess}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-end mt-2">
                  <p className="text-sm text-[#C0C0C0]">
                    <span className="text-[#FF0066] font-medium">Nota:</span> A porcentagem de utilização é calculada com base nas tarefas concluídas vs. total de tarefas atribuídas.
                  </p>
                </div>
              </div>
            </SettingsCard>
            {/* Removido: duplicidade de 'Pontos e Conquistas Especiais' */}

              {/* Grid de dois em dois para os demais cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {/* Nível de Acesso de Usuários */}
                <SettingsCard title="Nível de Acesso de Usuários" icon={SettingsIcon}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectInput
                      label="Usuário"
                      id="accessUser"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      options={[{ value: "", label: "Selecione..." }, ...users.map(u => ({ value: u, label: u }))]}
                    />
                    <SelectInput
                      label="Nível de acesso"
                      id="accessLevel"
                      value={selectedAccess}
                      onChange={(e) => setSelectedAccess(e.target.value as 'Player' | 'Adm' | 'DEV')}
                      options={[
                        { value: 'Player', label: 'Player' },
                        { value: 'Adm', label: 'Adm' },
                        { value: 'DEV', label: 'DEV' },
                      ]}
                    />
                    <div className="flex items-end">
                      <Button
                        onClick={applyAccessLevel}
                        className="w-full bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-2 rounded-none transition-colors shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105"
                      >
                        APLICAR
                      </Button>
                    </div>
                  </div>

                  {Object.keys(accessLevels).length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Níveis aplicados nesta sessão</h4>
                      <ul className="text-sm text-[#C0C0C0] space-y-1 list-disc pl-5">
                        {Object.entries(accessLevels).map(([user, level]) => (
                          <li key={user}>
                            <span className="text-white">{user}</span> → <span className="text-[#FF0066] font-medium">{level}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </SettingsCard>
                {/* Sistema de Níveis */}
                <SettingsCard title="Sistema de Níveis" icon={Trophy}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <SelectInput
                      label="Nível"
                      id="unique-level-dropdown"
                      value={String(levelRules[0]?.level || 1)}
                      onChange={e => {
                        const newLevel = Number(e.target.value);
                        const updatedRules = [...levelRules];
                        updatedRules[0] = { ...updatedRules[0], level: newLevel };
                        setLevelRulesState(updatedRules);
                      }}
                      options={Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: `Nível ${i + 1}` }))}
                      className="w-full border-[#6A0DAD] focus:border-[#FF0066] bg-[#1A1A2E]/60 text-white"
                    />
                    <div className="space-y-2 w-full">
                      <label htmlFor="unique-xp-input" className="block text-sm font-medium text-[#C0C0C0]">XP necessário</label>
                      <Input
                        id="unique-xp-input"
                        type="number"
                        min={0}
                        value={levelRules[0]?.xpRequired || 0}
                        onChange={e => {
                          const newValue = Number(e.target.value);
                          const updatedRules = [...levelRules];
                          updatedRules[0] = { ...updatedRules[0], xpRequired: newValue };
                          setLevelRulesState(updatedRules);
                        }}
                        className="w-full border-[#6A0DAD] focus:border-[#FF0066] bg-[#1A1A2E]/60 text-white"
                        placeholder="Digite o valor de XP"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <ParticleButton onClick={() => setLevelRules(levelRules)} className="w-full bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-2 rounded-none transition-colors shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105">
                        <Save size={16} /> SALVAR
                      </ParticleButton>
                      <Button
                        type="button"
                        className="w-full bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] text-white font-semibold px-4 py-2 rounded-none transition-colors shadow-lg hover:from-[#6A0DAD]/80 hover:to-[#FF0066]/80 hover:shadow-xl transform hover:scale-105"
                        onClick={() => setShowLevelDetails(true)}
                      >
                        Detalhes
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <input 
                      type="checkbox" 
                      id="levelNotification" 
                      className="w-4 h-4 accent-[#FF0066]" 
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    />
                    <label htmlFor="levelNotification" className="text-white text-sm">
                      Ativar notificações para subida de nível
                    </label>
                  </div>
                  {/* Modal de detalhes dos níveis */}
                  {typeof showLevelDetails !== 'undefined' && showLevelDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/50" onClick={() => setShowLevelDetails(false)} />
                      <div className="relative z-50 w-full max-w-md p-6 bg-[#1A1A2E] border border-[#6A0DAD] rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-4">Configuração dos Níveis</h3>
                        <table className="min-w-full text-sm text-left rounded-xl overflow-hidden mb-4">
                          <thead>
                            <tr className="bg-gradient-to-r from-[#6A0DAD]/80 to-[#FF0066]/80 text-white">
                              <th className="px-3 py-2 font-semibold">Nível</th>
                              <th className="px-3 py-2 font-semibold">Nome</th>
                              <th className="px-3 py-2 font-semibold">XP necessário</th>
                            </tr>
                          </thead>
                          <tbody className="bg-[#1A1A2E] divide-y divide-[#6A0DAD]/30">
                            {levelRules.length > 0 ? (
                              levelRules.map((rule) => (
                                <tr key={rule.level} className="hover:bg-[#6A0DAD]/10">
                                  <td className="px-3 py-2 text-white font-medium">Nível {rule.level}</td>
                                  <td className="px-3 py-2 text-[#C0C0C0]">{rule.name || '---'}</td>
                                  <td className="px-3 py-2 text-[#FF0066]">{rule.xpRequired ? `${rule.xpRequired} XP` : '---'}</td>
                                </tr>
                              ))
                            ) : (
                              // Exibe uma mensagem quando não há níveis configurados
                              <tr>
                                <td colSpan={3} className="px-3 py-8 text-center text-[#C0C0C0]">
                                  Nenhuma configuração de nível foi definida ainda.
                                  <br />
                                  Configure um nível usando o formulário acima e clique em "SALVAR".
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            className="bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-2 rounded-none"
                            onClick={() => setShowLevelDetails(false)}
                          >
                            Fechar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </SettingsCard>
                {/* Recompensas e Prêmios */}
                <SettingsCard title="Configuração de Temporadas" icon={Gift}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Seletor de temporadas */}
                    <div className="col-span-2 mb-2">
                      <label htmlFor="seasonSelector" className="block text-sm font-medium text-[#C0C0C0] mb-1">Selecionar temporada</label>
                      <select
                        id="seasonSelector"
                        value={selectedSeasonIdx}
                        onChange={handleSelectSeason}
                        className="w-full rounded-md border border-[#6A0DAD] bg-[#1A1A2E]/60 px-3 py-2 text-base text-white focus:border-[#FF0066] focus:outline-none"
                      >
                        {seasonList.length === 0 ? (
                          <option value={0} disabled>Nenhuma temporada cadastrada</option>
                        ) : (
                          seasonList.map((s, idx) => (
                            <option key={idx} value={idx}>
                              {s.name} ({new Date(s.startIso).toLocaleDateString('pt-BR')} - {new Date(s.endIso).toLocaleDateString('pt-BR')})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    {/* Campos de edição da temporada selecionada */}
                    <LabeledInput
                      label="Nome da temporada"
                      id="seasonName"
                      value={season.name}
                      onChange={(e) => setSeason(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="space-y-2">
                      <label htmlFor="seasonDescription" className="block text-sm font-medium text-[#C0C0C0]">Descrição</label>
                      <textarea
                        id="seasonDescription"
                        value={season.description || ''}
                        onChange={(e) => setSeason(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full h-24 p-2 rounded-md bg-[#1A1A2E]/60 border border-[#6A0DAD] text-white focus:border-[#FF0066] focus:outline-none"
                        placeholder="Ex.: Temporada Especial de Fim de Ano"
                      />
                    </div>
                    <LabeledInput
                      label="Início"
                      id="seasonStart"
                      type="date"
                      value={season.startIso ? new Date(season.startIso).toISOString().slice(0,10) : ''}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        date.setHours(0,0,0,0);
                        setSeason(prev => ({ ...prev, startIso: date.toISOString() }));
                      }}
                    />
                    <LabeledInput
                      label="Fim"
                      id="seasonEnd"
                      type="date"
                      value={season.endIso ? new Date(season.endIso).toISOString().slice(0,10) : ''}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        date.setHours(23,59,59,999);
                        setSeason(prev => ({ ...prev, endIso: date.toISOString() }));
                      }}
                    />
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    <ParticleButton onClick={handleSaveSeason} className="min-w-32 flex justify-center">
                      <Save size={16} /> Salvar Temporada
                    </ParticleButton>
                  </div>
                </SettingsCard>

                {/* Missões */}
                <SettingsCard title="Missões" icon={Info}>
                  <div className="space-y-4">
                    {/* Seletor de missão */}
                    <SelectInput
                      label="Selecionar missão"
                      id="missionSelector"
                      value={selectedMissionIdx >= 0 ? String(selectedMissionIdx) : ""}
                      onChange={e => setSelectedMissionIdx(Number(e.target.value))}
                      options={[{ value: "", label: "Nova missão" }, ...missionList.map((m, idx) => ({ value: String(idx), label: m.name || `Missão ${idx + 1}` }))]}
                    />
                    <LabeledInput
                      label="Nome da missão"
                      id="missionName"
                      value={missionName}
                      onChange={e => setMissionName(e.target.value)}
                    />
                    <div className="space-y-2">
                      <label htmlFor="missionDescription" className="block text-sm font-medium text-[#C0C0C0]">Descrição</label>
                      <textarea
                        id="missionDescription"
                        value={missionDescription}
                        onChange={e => setMissionDescription(e.target.value)}
                        className="w-full h-20 p-2 rounded-md bg-[#1A1A2E]/60 border border-[#6A0DAD] text-white focus:border-[#FF0066] focus:outline-none"
                        placeholder="Descreva a missão..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectInput
                        label="Tipo de missão"
                        id="missionType"
                        value={missionType}
                        onChange={e => setMissionType(e.target.value as MissionType)}
                        options={[
                          { value: 'complete_tasks', label: 'Completar tarefas' },
                          { value: 'complete_early', label: 'Completar tarefas adiantadas' },
                          { value: 'attend_meetings', label: 'Participar de reuniões' },
                          { value: 'review_peer_tasks', label: 'Revisar tarefas de colegas' },
                          { value: 'streak_days', label: 'Manter sequência de dias' },
                          { value: 'no_delays', label: 'Não atrasar tarefas' },
                          { value: 'high_effort_tasks', label: 'Completar tarefas de alta dificuldade' },
                        ]}
                      />
                      <SelectInput
                        label="Frequência"
                        id="missionFrequency"
                        value={missionFrequency}
                        onChange={e => setMissionFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                        options={[
                          { value: 'daily', label: 'Diária' },
                          { value: 'weekly', label: 'Semanal' },
                          { value: 'monthly', label: 'Mensal' },
                        ]}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <LabeledInput
                        label="Objetivo"
                        id="missionTarget"
                        type="number"
                        min={1}
                        value={missionTarget}
                        onChange={e => setMissionTarget(Number(e.target.value))}
                      />
                      <LabeledInput
                        label="Recompensa (XP)"
                        id="missionXpReward"
                        type="number"
                        min={1}
                        value={missionXpReward}
                        onChange={e => setMissionXpReward(Number(e.target.value))}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <div className="space-y-2">
                        <label htmlFor="missionPeriod" className="block text-sm font-medium text-[#C0C0C0]">Vigência</label>
                        <div className="flex gap-2 items-center">
                          <LabeledInput
                            id="missionStart"
                            label="Início"
                            type="date"
                            value={missionStart}
                            onChange={e => setMissionStart(e.target.value)}
                            disabled={missionContinuous}
                          />
                          <LabeledInput
                            id="missionEnd"
                            label="Fim"
                            type="date"
                            value={missionEnd}
                            onChange={e => setMissionEnd(e.target.value)}
                            disabled={missionContinuous}
                          />
                        </div>
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="missionContinuous"
                            className="w-4 h-4 accent-[#FF0066]"
                            checked={missionContinuous}
                            onChange={e => setMissionContinuous(e.target.checked)}
                          />
                          <label htmlFor="missionContinuous" className="ml-2 text-white text-sm">Contínuo</label>
                        </div>
                      </div>
                      <div className="flex items-center mt-6 md:mt-0">
                        <input
                          type="checkbox"
                          id="missionActive"
                          className="w-4 h-4 accent-[#FF0066]"
                          checked={missionActive}
                          onChange={e => setMissionActive(e.target.checked)}
                        />
                        <label htmlFor="missionActive" className="ml-2 text-white text-sm">Ativo</label>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <ParticleButton onClick={handleSaveMission} className="min-w-32 flex justify-center">
                        <Save size={16} /> Salvar Missão
                      </ParticleButton>
                    </div>
                  </div>
                </SettingsCard>

                {/* Configurações Avançadas */}
                <SettingsCard title="Configurações Avançadas" icon={SettingsIcon}>
                  <div className="space-y-3">
                    <SelectInput 
                      label="Modo de exibição do ranking" 
                      id="rankingDisplay"
                      options={[
                        { value: "all", label: "Exibir todos os jogadores" },
                        { value: "top10", label: "Apenas top 10" },
                        { value: "department", label: "Agrupar por departamento" }
                      ]}
                    />
                  
                    <div className="flex items-center space-x-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="resetMonthly" 
                        className="w-4 h-4 accent-[#FF0066]" 
                      />
                      <label htmlFor="resetMonthly" className="text-white text-sm">
                        Reiniciar rankings mensalmente
                      </label>
                    </div>
                  
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="showAchievements" 
                        className="w-4 h-4 accent-[#FF0066]" 
                        defaultChecked
                      />
                      <label htmlFor="showAchievements" className="text-white text-sm">
                        Exibir conquistas no perfil público
                      </label>
                    </div>
                  </div>
                </SettingsCard>

                {/* Percentual de Ganho por Tarefa */}
                <SettingsCard title="Percentual de Ganho por Tarefa" icon={Star}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LabeledInput 
                      label="Tarefa Adiantada (%)" 
                      id="earlyTaskPercentage" 
                      type="number"
                      min={-100}
                      max={200}
                      value={earlyTaskPercentage}
                      onChange={(e) => setEarlyTaskPercentage(Number(e.target.value))}
                    />
                    <LabeledInput 
                      label="Tarefa Concluída na Data (%)" 
                      id="onTimeTaskPercentage" 
                      type="number"
                      min={-100}
                      max={200}
                      value={onTimeTaskPercentage}
                      onChange={(e) => setOnTimeTaskPercentage(Number(e.target.value))}
                    />
                    <LabeledInput 
                      label="Tarefa Concluída com Atraso (%)" 
                      id="delayedTaskPercentage" 
                      type="number"
                      min={-100}
                      max={200}
                      value={delayedTaskPercentage}
                      onChange={(e) => setDelayedTaskPercentage(Number(e.target.value))}
                    />
                    <LabeledInput 
                      label="Tarefa com Refatoração (%)" 
                      id="refactoredTaskPercentage" 
                      type="number"
                      min={-100}
                      max={200}
                      value={refactoredTaskPercentage}
                      onChange={(e) => setRefactoredTaskPercentage(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <ParticleButton
                      onClick={() => {
                        // Persistir no localStorage
                        localStorage.setItem('epic_productivity_config_v1', JSON.stringify({
                          early: earlyTaskPercentage,
                          on_time: onTimeTaskPercentage,
                          late: delayedTaskPercentage,
                          refacao: refactoredTaskPercentage,
                        }));
                        toast({
                          title: "Percentuais salvos!",
                          description: "Os percentuais de ganho por tarefa foram atualizados e já impactam os cálculos da plataforma.",
                          className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
                          duration: 3000,
                        });
                      }}
                      className="min-w-32 flex justify-center"
                    >
                      <Save size={16} /> Salvar
                    </ParticleButton>
                  </div>
                </SettingsCard>
              </div>
          </div>

          <div className="flex justify-end mt-8">
            <ParticleButton onClick={handleSave} className="min-w-32 flex justify-center">
              <Save size={16} /> Salvar Configurações
            </ParticleButton>
          </div>
        </section>

        {/* Modal de confirmação de ajuste de XP */}
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmModalOpen(false)} />
            <div className="relative z-50 w-full max-w-lg p-6 bg-[#1A1A2E] border border-[#6A0DAD] rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Confirmar ajuste de XP</h3>
              <p className="text-sm text-[#C0C0C0] mb-4">Player: <span className="font-medium text-white">{modalData.player}</span></p>
              <p className="text-sm text-[#C0C0C0] mb-4">Ajuste: <span className="font-medium text-white">{modalData.xp > 0 ? `+${modalData.xp}` : modalData.xp} XP</span> ({modalData.xp > 0 ? 'Adição' : 'Redução'})</p>
              <div className="mb-4">
                <label className="block text-sm text-[#C0C0C0] mb-2">Justificativa (opcional)</label>
                <textarea
                  value={modalJustification}
                  onChange={(e) => setModalJustification(e.target.value)}
                  className="w-full h-24 p-2 rounded-md bg-[#0f172a]/30 border border-[#6A0DAD] text-white"
                  placeholder="Motivo ou observação..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 rounded-md bg-transparent border border-[#6A0DAD] text-white" onClick={() => setConfirmModalOpen(false)}>Cancelar</button>
                <button
                  className="px-4 py-2 rounded-none bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold"
                  onClick={async () => {
                    setConfirmLoading(true);
                    // Simular envio
                    await new Promise((res) => setTimeout(res, 1000));
                    setConfirmLoading(false);
                    setConfirmModalOpen(false);
                    // Toast de sucesso (estilo epic)
                    toast({
                      title: "Ajuste aplicado com sucesso",
                      description: `${modalData.player} recebeu ${modalData.xp > 0 ? `+${modalData.xp}` : modalData.xp} XP.`,
                      className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
                      duration: 3000,
                    });
                  }}
                >
                  {confirmLoading ? 'Enviando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Cards DEV-only: Testador de Sincronização de Usuário e Debug: Dados de Persistência */}
        {isDevUser && (
          <>
            {/* Testador de sincronização */}
            <div className="mt-8">
              <UserSyncTester />
            </div>
            {/* Debug de dados do usuário */}
            <div className="mt-8">
              <UserDataDebug />
            </div>
          </>
        )}

        {/* Toast de confirmação */}
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 flex items-center gap-2 bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] text-white px-4 py-3 rounded-md shadow-lg"
          >
            <Award className="h-5 w-5" />
            <span>Configurações salvas com sucesso!</span>
            <button onClick={() => setShowToast(false)} className="ml-2 text-white hover:text-gray-200">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </main>
    </DataProvider>
  );
};

export default Settings;