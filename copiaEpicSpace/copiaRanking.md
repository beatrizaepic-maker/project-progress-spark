# Ranking.tsx — Documentação Estruturada

## Visão Geral
A página `Ranking.tsx` exibe o ranking gamificado dos usuários da plataforma EPIC Space, apresentando XP, níveis, missões, streaks, bônus de consistência e estatísticas resumo. Permite exportação de dados, visualização detalhada de desempenho e integração com temporadas e eventos em tempo real. Toda a lógica é baseada em dados reais persistidos no Supabase e/ou backend dedicado.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Estrutura Visual e Componentes
- **Cabeçalho:**
  - Título "Ranking de Gamificação" com ícone de troféu.
  - Subtítulo explicativo.
  - Botões: Exportar CSV, Exportar PDF, Atualizar (com loading), e label de última atualização.
- **Seletor de Período:**
  - Botões "Semanal" e "Mensal" para alternar o ranking exibido.
- **Estatísticas Resumo:**
  - Cards para: Total de XP, Missões Completas, Maior Sequência (streak), Usuários Ativos.
- **Tabela de Ranking:**
  - Exibe posição, nome, avatar, XP, nível, XP semanal/mensal, missões, bônus, streak.
  - Seletor de temporada (dropdown) para filtrar ranking por temporada.
- **Modal de Detalhes do Usuário:**
  - Exibe detalhes de XP, histórico, missões, streaks, penalidades, etc.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Fluxos e Lógica
- **Carregamento de Dados:**
  - Busca dados do ranking via API/backend Supabase.
  - Busca temporadas disponíveis e seleciona a mais recente por padrão.
  - Atualiza ranking automaticamente a cada 5 minutos e via SSE (Server-Sent Events) em tempo real.
- **Cálculo e Ordenação:**
  - XP semanal/mensal determina a posição; em caso de empate, XP total é critério de desempate.
  - Nível é calculado a partir do XP total.
  - Ranking é recalculado e posições atualizadas dinamicamente.
- **Exportação:**
  - Exporta ranking atual para CSV (cliente) e PDF (cliente, usando jsPDF + autoTable).
- **Detalhes do Usuário:**
  - Ao clicar em um usuário, exibe modal com detalhes de desempenho, histórico de XP, missões, streaks, penalidades, etc.
  - Respeita restrições de acesso: usuários comuns só podem ver seus próprios detalhes.
- **Atualização Dinâmica:**
  - O ranking é atualizado automaticamente ao receber eventos de tarefas ou via SSE.

## Estados e Hooks
- `useState`: controla lista de usuários, usuário selecionado, loading, abas, temporadas, tarefas recentes, etc.
- `useEffect`: carrega dados iniciais, temporadas, ranking, configura SSE e listeners de eventos.
- `useCallback`, `useMemo`: otimizam cálculos e filtragens do ranking.

## Funções e Eventos
- `calculateRankingData`: calcula e ordena o ranking conforme XP e período.
- `updateRankingData`: busca e atualiza dados do ranking.
- `handleExportCSV`, `handleExportPDF`: exportam dados do ranking.
- `handleUserClick`: exibe detalhes do usuário selecionado, com restrição de acesso.
- `getPositionIcon`: retorna ícone de troféu conforme posição.
- Eventos SSE e listeners de tarefas para atualização automática.

## Checklist de Elementos e Fluxos
- [x] Cabeçalho com título, botões de exportação e atualização
- [x] Seletor de período (semanal/mensal)
- [x] Cards de estatísticas resumo
- [x] Tabela de ranking com seletor de temporada
- [x] Modal de detalhes do usuário
- [x] Exportação para CSV e PDF
- [x] Atualização automática via SSE e eventos
- [x] Restrições de acesso a detalhes
- [x] Sem dados mock ou lógica de localStorage

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

---

> Esta documentação detalha todos os elementos, fluxos, estados e comportamentos da página `Ranking.tsx` para permitir a reprodução fiel da tela, conforme implementado no sistema original.
