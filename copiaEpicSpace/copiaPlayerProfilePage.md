# PlayerProfilePage.tsx — Documentação Estruturada

## Visão Geral
A página `PlayerProfilePage.tsx` exibe o perfil detalhado do jogador, incluindo informações pessoais, estatísticas, produtividade, distribuição de entregas, histórico de atividades, notificações e opções de edição. É uma interface rica, integrada ao Supabase para persistência e consulta de dados, e utiliza diversos hooks, contextos e componentes reutilizáveis.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Estrutura Visual e Componentes
- **Cabeçalho:**
  - Título dinâmico: "Meu Perfil" (se for o próprio usuário) ou "Perfil de [nome]".
  - Subtítulo: "Gerencie suas informações e visualize seu progresso".
  - Botão "Editar Perfil" (apenas para o próprio usuário), estilizado, com ícone de engrenagem.
- **PlayerProfileView:**
  - Exibe informações do perfil, estatísticas, tarefas e botões de ação (editar, enviar mensagem, notificações).
- **Produtividade Média:**
  - Card com média de produtividade, tarefas consideradas, seletor de temporada (atual ou específica), e mensagem de ausência de tarefas.
- **Distribuição de Entregas:**
  - Card com contadores de tarefas adiantadas, no prazo, atrasadas e de refação.
- **Atividade Recente:**
  - Card com lista das últimas atividades (tarefas, XP, log de atividades), ordenadas por data.
- **Modais:**
  - `ProfileEditModal`: edição do perfil.
  - `NotificationsModal`: exibição e gerenciamento de notificações.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Fluxos e Lógica
- **Sincronização de Perfil:**
  - Ao acessar o perfil atual, sincroniza dados do usuário autenticado com o contexto do player.
  - Atualiza o perfil se houver divergência entre dados locais e do usuário.
- **Carregamento de Métricas:**
  - Consulta métricas de produtividade, distribuição de entregas e breakdown de tarefas no Supabase.
  - Permite seleção de temporada para cálculo de produtividade.
- **Histórico de Atividades:**
  - Carrega logs de atividades e histórico de XP, combinando e ordenando para exibição.
- **Notificações:**
  - Carrega notificações do Supabase, marca como lidas individualmente ou em lote, e persiste status de leitura.
- **Tarefas:**
  - Carrega tarefas do usuário para breakdown e atividades recentes.
- **Edição de Perfil:**
  - Modal de edição disponível apenas para o próprio usuário.

## Estados e Hooks
- `useParams`: obtém o ID do player da rota.
- `usePlayer`, `useAuth`: contextos para dados do player e autenticação.
- `useState`: controla edição, notificações, métricas, atividades, temporadas, seleção de temporada, etc.
- `useEffect`: múltiplos efeitos para sincronização, carregamento de dados e atualização de métricas.

## Funções e Eventos
- `handleMarkAsRead`, `handleMarkAllAsRead`: marcam notificações como lidas e persistem no Supabase.
- `setIsEditing`, `setIsNotificationsOpen`: abrem/fecham modais.
- `setSelectedSeason`: altera temporada para cálculo de produtividade.
- `onEdit`, `onSendMessage`, `onNotifications`: handlers passados para componentes filhos.

## Checklist de Elementos e Fluxos
- [x] Cabeçalho dinâmico com título e botão de edição
- [x] Exibição de informações do perfil e estatísticas
- [x] Card de produtividade média com seletor de temporada
- [x] Card de distribuição de entregas
- [x] Card de atividade recente (tarefas, XP, log)
- [x] Modal de edição de perfil
- [x] Modal de notificações com marcação de leitura
- [x] Integração com Supabase para métricas, tarefas, notificações e logs
- [x] Sincronização automática de dados do usuário
- [x] Sem dados mock ou lógica de localStorage

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

---

> Esta documentação detalha todos os elementos, fluxos, estados e comportamentos da página `PlayerProfilePage.tsx` para permitir a reprodução fiel da tela, conforme implementado no sistema original.
