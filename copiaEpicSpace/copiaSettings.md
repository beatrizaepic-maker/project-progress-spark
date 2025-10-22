# Settings.tsx — Documentação Estruturada

## Visão Geral
A página `Settings.tsx` é o painel de configurações avançadas do sistema de gamificação, produtividade, missões, streaks, temporadas e níveis da plataforma EPIC Space. Permite ajuste fino de todos os parâmetros do sistema, persistência no Supabase, visualização de dados de usuários, tarefas, logs e acesso a cards DEV-only para depuração e sincronização.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Estrutura Visual e Componentes
- **Cards de Configuração:**
  - Cada área do sistema (produtividade, missões, streak, temporadas, níveis, conquistas) possui um card visual com título, ícone e campos de ajuste.
  - Cards utilizam o componente `SettingsCard` para padronização visual.
- **Inputs e Selects:**
  - Inputs com label (`LabeledInput`) para valores numéricos e texto.
  - Selects customizados (`SelectInput`) para opções como frequência, tipo de missão, temporada, etc.
- **Botões com efeito de partículas:**
  - `ParticleButton` exibe animação visual ao salvar configurações.
- **Tabela de Usuários:**
  - Exibe dados processados de usuários, produtividade, XP, último acesso, etc.
- **Cards DEV-only:**
  - Cards exclusivos para desenvolvedores, como testador de sincronização e debug de persistência.
- **Toasts e Modais:**
  - Toasts de confirmação/erro e modal de confirmação para ajustes críticos.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Fluxos e Lógica
- **Carregamento Inicial:**
  - Ao montar, carrega todas as configurações do Supabase: produtividade, missões, streak, temporadas, usuários, tarefas, regras de nível, logs de acesso.
  - Processa dados para exibição na tabela e cards.
- **Ajuste de Parâmetros:**
  - Permite ajuste de percentuais de produtividade, XP por tarefa, bônus de streak, regras de nível, metas semanais, frequência de recompensas, etc.
  - Permite criar, editar e ativar missões, com campos para nome, descrição, tipo, meta, XP, frequência, vigência e status.
  - Permite criar e editar temporadas, com datas e nomes customizados.
- **Persistência:**
  - Salva todas as configurações no Supabase, com feedback visual.
  - Salva missões, temporadas, streaks, produtividade e regras de nível.
- **Acesso e Permissões:**
  - Permite ajuste de nível de acesso dos usuários (Player, Adm, DEV).
  - Cards DEV-only visíveis apenas para usuários com permissão.
- **Sincronização e Debug:**
  - Cards DEV permitem testar sincronização de usuários e visualizar dados brutos de persistência.
- **Feedback Visual:**
  - Toasts e animações de partículas confirmam ações do usuário.

## Estados e Hooks
- `useState`: controla todos os campos de configuração, listas, seleção, loading, toasts, modais, etc.
- `useEffect`: carrega dados iniciais, atualiza campos ao selecionar missão/temporada, processa dados para tabela.

## Funções e Eventos
- `handleSave`, `handleSaveMission`, `handleSaveSeason`, `saveStreakCard`: salvam configurações no Supabase.
- `applyAccessLevel`, `applyDailyStreak`, `applyDailyStreakConfig`: aplicam ajustes e exibem feedback.
- `handleSelectSeason`, `setSelectedMissionIdx`: controlam seleção de temporada/missão.
- `loadSettings`: carrega e processa todos os dados do Supabase.

## Checklist de Elementos e Fluxos
- [x] Cards de configuração para produtividade, missões, streak, temporadas, níveis
- [x] Inputs e selects customizados
- [x] Botões com efeito de partículas
- [x] Tabela de usuários com dados processados
- [x] Cards DEV-only para debug e sincronização
- [x] Toasts e modais de confirmação
- [x] Persistência de todas as configurações no Supabase
- [x] Ajuste de níveis de acesso
- [x] Sem dados mock ou lógica de localStorage

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

---

> Esta documentação detalha todos os elementos, fluxos, estados e comportamentos da página `Settings.tsx` para permitir a reprodução fiel da tela, conforme implementado no sistema original.
