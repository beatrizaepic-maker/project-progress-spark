import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";
import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
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
const LabeledInput = ({ label, id, type = "text", min, max, ...props }) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#C0C0C0]">
        {label}
      </label>
      <Input 
        id={id} 
        type={type} 
        min={min}
        max={max}
        className="border-[#6A0DAD] focus:border-[#FF0066] bg-[#1A1A2E]/60 text-white"
        {...props} 
      />
    </div>
  );
};

// Componente de seletor
const SelectInput = ({ label, id, options, ...props }) => {
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


const Settings = () => {
  const [pointsPerTask, setPointsPerTask] = useState(10);
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

  // Usuários cadastrados (derivados dos responsáveis cadastrados nas tarefas mock)
  const users = Array.from(new Set(mockTaskData.map(t => t.responsavel))).filter(Boolean) as string[];
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
    // Aqui iria a lógica para salvar as configurações
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <DataProvider initialTasks={mockTaskData}>
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
              {/* Configurações de pontuação geral */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <LabeledInput 
                  label="Pontos por tarefa concluída" 
                  id="pointsPerTask" 
                  type="number"
                  min={1}
                  max={100}
                  value={pointsPerTask}
                  onChange={(e) => setPointsPerTask(Number(e.target.value))}
                />
                <LabeledInput 
                  label="Bônus por conquista (XP)" 
                  id="bonusXP" 
                  type="number"
                  min={0}
                  max={100}
                  value={bonusPercentage}
                  onChange={(e) => setBonusPercentage(Number(e.target.value))}
                />
                <LabeledInput 
                  label="Penalidade por atraso (XP)" 
                  id="penaltyXP" 
                  type="number"
                  min={0}
                  max={100}
                  value={levelThreshold} // Você pode criar um estado específico se quiser
                  onChange={(e) => setLevelThreshold(Number(e.target.value))} // Idem
                />
              </div>
              {/* Tabela de conquistas especiais */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#6A0DAD]/80 to-[#FF0066]/80 text-white">
                      <th className="px-3 py-2 font-semibold">Opção</th>
                      <th className="px-3 py-2 font-semibold">Pontuação</th>
                      <th className="px-3 py-2 font-semibold">Ativo</th>
                      <th className="px-3 py-2 font-semibold">Observação</th>
                      <th className="px-3 py-2 font-semibold">Player</th>
                      <th className="px-3 py-2 font-semibold">Ajuste Individual (XP)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#1A1A2E] divide-y divide-[#6A0DAD]/30">
                    {[
                      { label: "Entrega com antecedência" },
                      { label: "Solucionar um problema criativo" },
                      { label: "Ajudar um Épico" },
                      { label: "Feedback recebido com elogio do cliente ou gestores" },
                      { label: "Cumprir todas as tarefas da semana no prazo" },
                      { label: "Toda a equipe entrega sem atrasos na semana" },
                      { label: "Criar uma melhoria de processo" },
                      { label: "Manter consistência por um mês sem atrasos" },
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
                          <td className="px-3 py-2">
                            <Input
                              type="text"
                              placeholder="Observação..."
                              className="w-full border-[#6A0DAD] bg-[#1A1A2E]/60 text-white"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              className="w-32 rounded-md border-[#FF0066] bg-[#1A1A2E]/60 text-white px-2 py-1"
                              value={selectedUser}
                              onChange={e => setSelectedUser(e.target.value)}
                            >
                              <option value="">Selecione...</option>
                              <option value="joao">João</option>
                              <option value="maria">Maria</option>
                              <option value="carlos">Carlos</option>
                              <option value="ana">Ana</option>
                              <option value="lucas">Lucas</option>
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
                  <LabeledInput 
                    label="Pontos necessários por nível" 
                    id="levelThreshold" 
                    type="number"
                    min={50}
                    max={1000}
                    value={levelThreshold}
                    onChange={(e) => setLevelThreshold(Number(e.target.value))}
                  />
                  <SelectInput 
                    label="Progresso de nível" 
                    id="levelProgress"
                    options={[
                      { value: "linear", label: "Linear (igual para todos níveis)" },
                      { value: "exponential", label: "Exponencial (aumenta a cada nível)" }
                    ]}
                  />
                  <div className="flex items-center space-x-2 pt-2">
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
                </SettingsCard>

                {/* Recompensas e Prêmios */}
                <SettingsCard title="Recompensas e Prêmios (Em análise)" icon={Gift}>
                  <SelectInput 
                    label="Frequência de recompensas" 
                    id="rewardFrequency"
                    value={rewardFrequency}
                    onChange={(e) => setRewardFrequency(e.target.value)}
                    options={[
                      { value: "daily", label: "Diária" },
                      { value: "weekly", label: "Semanal" },
                      { value: "monthly", label: "Mensal" }
                    ]}
                  />
                  <SelectInput 
                    label="Tipo de recompensa" 
                    id="rewardType"
                    options={[
                      { value: "badge", label: "Emblemas" },
                      { value: "title", label: "Títulos" },
                      { value: "theme", label: "Temas personalizados" },
                      { value: "mixed", label: "Sistema misto" }
                    ]}
                  />
                  <div className="flex items-center space-x-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="rareRewards" 
                      className="w-4 h-4 accent-[#FF0066]" 
                    />
                    <label htmlFor="rareRewards" className="text-white text-sm">
                      Incluir recompensas raras (probabilidade de 5%)
                    </label>
                  </div>
                </SettingsCard>

                {/* Sobre */}
                <SettingsCard title="Sobre" icon={Info}>
                  <div className="space-y-2 text-sm text-[#C0C0C0]">
                    <p>Versão: 1.5.0</p>
                    <p>Última atualização: Outubro 2025</p>
                    <p>Sistema de Gamificação: v2.0</p>
                    <p>Desenvolvido por 🐰DashiTecnology®</p>
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

        {/* Debug de dados do usuário */}
        <div className="mt-8">
          <UserDataDebug />
        </div>

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