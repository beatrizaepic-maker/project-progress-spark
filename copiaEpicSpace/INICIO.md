# INICIO

Use o prompt abaixo para iniciar a recriação da plataforma EPIC Space em outra IDE.

```prompt
Quero uma aplicação web chamada "EPIC Space" construída com Vite + React + TypeScript, Tailwind CSS, shadcn-ui, React Router e React Query. Estruture o código em `/src` com os seguintes elementos principais:

1. **Contextos e Serviços**
   - `AuthContext` com suporte a login/logout, roles (`admin`, `dev`, `manager`, `user`) e avatar do usuário.
   - `DataContext` que fornece tarefas, qualidade de dados, KPIs e operações `import/export`.
   - Cliente Supabase configurado em `src/lib/supabase.ts` para buscar a tabela `tasks`.
   - Hooks especializados (`useKPIs`, `useAnalyticsKPIs`, `useToast`, `useGlobalContext`) para cálculo de indicadores e toasts.

   NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

2. **Layout e Navegação**
   - Sidebar personalizada (`CustomSidebar`) com links e ícones (lucide-react) para: Dashboard, Analytics, Tasks, Ranking, Profile, Editor, Settings e rota restrita `/controle` para `manager`.
   - Componente `Navigation` fixo no topo com breadcrumbs/atalhos.
   - Uso de `ProtectedRoute` para bloquear rotas por autenticação e papel.

   NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

3. **Páginas Principais**
   - `Dashboard`: cards métricos, KPIs avançados, exportação PDF, blocos “Critical Players” e seção resumo estatístico com animações framer-motion.
   - `Analytics`: gráficos (usando componentes `Charts`, partículas de sucesso, botões de recálculo, toasts informativos, indicadores de versão/cache).
   - `Tasks`: tabela completa com filtros rápidos, temporadas, exportação/importação JSON, gráfico de linha de tarefas concluídas vs pendentes.
   - Outras páginas base (DataEditor, Ranking, PlayerProfilePage, Settings, Control, NotFound, Login) conectadas aos contextos.

   NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

4. **Estilo e Experiência**
   - Tema escuro com gradientes neon (roxo/pink), sombras profundas, bordas roxas e efeitos hover animados.
   - Componentes compartilhados (`TaskTable`, `MetricsCards`, `Charts`, `DataEditor`, `KPILoadingIndicator`, `InsufficientDataDisplay`) alinhados ao tema.
   - Sistema de toasts integrado (shadcn `Toaster` + `Sonner`).

   NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

Monte o esqueleto do projeto com rotas definidas, NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.
