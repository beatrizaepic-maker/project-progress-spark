import { DataProvider } from "@/contexts/DataContext";
import { mockTaskData } from "@/data/projectData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Trophy, Target, Star, Award, Gift, Settings as SettingsIcon, Info, X } from "lucide-react";

// Componente para efeito de partículas no botão
const ParticleButton = ({ children, onClick, className, variant, size, ...props }) => {
  const [showParticles, setShowParticles] = useState(false);
  const [buttonRef, setButtonRef] = useState(null);

  const handleClick = async (e) => {
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
    <div className="bg-[#1A1A2E] p-6 border-2 border-[#6A0DAD] rounded-xl shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sistema de Pontos */}
            <SettingsCard title="Sistema de Pontos" icon={Star}>
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
                label="Bônus para conclusão antecipada (%)" 
                id="bonusPercentage" 
                type="number"
                min={0}
                max={100}
                value={bonusPercentage}
                onChange={(e) => setBonusPercentage(Number(e.target.value))}
              />
              
              <SelectInput 
                label="Penalidade para atraso" 
                id="penaltyType"
                options={[
                  { value: "none", label: "Sem penalidade" },
                  { value: "fixed", label: "Valor fixo (-5 pontos)" },
                  { value: "percentage", label: "Percentual (-10% por dia)" }
                ]}
              />
            </SettingsCard>

            {/* Metas e Objetivos */}
            <SettingsCard title="Metas e Objetivos" icon={Target}>
              <LabeledInput 
                label="Meta semanal (tarefas)" 
                id="weeklyGoal" 
                type="number"
                min={1}
                max={50}
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              />
              
              <SelectInput 
                label="Tipo de meta prioritária" 
                id="goalType"
                options={[
                  { value: "tasks", label: "Número de tarefas" },
                  { value: "points", label: "Total de pontos" },
                  { value: "streak", label: "Dias consecutivos" }
                ]}
              />
              
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="publicGoals" 
                  className="w-4 h-4 accent-[#FF0066]" 
                />
                <label htmlFor="publicGoals" className="text-white text-sm">
                  Tornar metas visíveis para outros usuários
                </label>
              </div>
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
            <SettingsCard title="Recompensas e Prêmios" icon={Gift}>
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
                <p>Versão: 1.3.0</p>
                <p>Última atualização: Janeiro 2024</p>
                <p>Sistema de Gamificação: v2.0</p>
                <p>Desenvolvido por DashiTecnology®</p>
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

          <div className="flex justify-end mt-8">
            <ParticleButton onClick={handleSave} className="min-w-32 flex justify-center">
              <Save size={16} /> Salvar Configurações
            </ParticleButton>
          </div>
        </section>

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