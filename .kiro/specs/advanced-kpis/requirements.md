# Requirements Document

## Introduction

Este documento define os requisitos para implementar KPIs estatísticos avançados na plataforma Epic Board. O objetivo é fornecer métricas detalhadas de performance, análise estatística e indicadores de prazo para melhorar o gerenciamento de projetos e tomada de decisões.

## Requirements

### Requirement 1

**User Story:** Como um gerente de projeto, eu quero visualizar KPIs executivos no dashboard, para que eu possa tomar decisões rápidas sobre o status geral do projeto.

#### Acceptance Criteria

1. WHEN o usuário acessa o dashboard THEN o sistema SHALL exibir o indicador de prazo do projeto com status visual (verde/amarelo/vermelho)
2. WHEN o usuário visualiza o dashboard THEN o sistema SHALL mostrar a média de atraso em dias com tendência (seta para cima/baixo)
3. WHEN o usuário acessa o dashboard THEN o sistema SHALL apresentar o desvio padrão das tarefas com classificação (baixa/média/alta variação)
4. WHEN o indicador de prazo é exibido THEN o sistema SHALL mostrar a porcentagem de conclusão do projeto
5. WHEN a média de atraso é calculada THEN o sistema SHALL considerar apenas dias úteis

### Requirement 2

**User Story:** Como um analista de dados, eu quero acessar estatísticas detalhadas na página de análise, para que eu possa realizar análises profundas de performance.

#### Acceptance Criteria

1. WHEN o usuário acessa a página Analytics THEN o sistema SHALL calcular e exibir a média de produção (tempo médio por tarefa)
2. WHEN as estatísticas são exibidas THEN o sistema SHALL mostrar a moda (tempo mais comum) com percentual de frequência
3. WHEN a mediana é calculada THEN o sistema SHALL remover outliers automaticamente e explicar o cálculo
4. WHEN o desvio padrão é exibido THEN o sistema SHALL incluir gráfico de distribuição das durações
5. WHEN a análise de atrasos é mostrada THEN o sistema SHALL apresentar distribuição e padrões temporais
6. WHEN gráficos são exibidos THEN o sistema SHALL permitir interação (zoom, filtros, tooltips)

### Requirement 3

**User Story:** Como um coordenador de equipe, eu quero ver informações operacionais detalhadas na página de tarefas, para que eu possa gerenciar tarefas específicas e seus prazos.

#### Acceptance Criteria

1. WHEN o usuário acessa a página Tasks THEN o sistema SHALL exibir data de início e fim para cada tarefa
2. WHEN uma tarefa tem atraso THEN o sistema SHALL calcular e mostrar atraso em dias úteis
3. WHEN o status de prazo é exibido THEN o sistema SHALL usar indicadores visuais coloridos (verde/amarelo/vermelho)
4. WHEN o usuário visualiza a tabela THEN o sistema SHALL permitir filtrar por status de prazo
5. WHEN uma tarefa está atrasada THEN o sistema SHALL destacar visualmente na tabela
6. WHEN o usuário passa o mouse sobre uma métrica THEN o sistema SHALL exibir tooltip com detalhes do cálculo

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero que os cálculos estatísticos sejam precisos e atualizados, para que eu possa confiar nas métricas apresentadas.

#### Acceptance Criteria

1. WHEN dados de tarefas são alterados THEN o sistema SHALL recalcular automaticamente todos os KPIs
2. WHEN outliers são detectados THEN o sistema SHALL aplicar método IQR (Interquartile Range) para remoção
3. WHEN dias úteis são calculados THEN o sistema SHALL considerar apenas segunda a sexta-feira, excluindo feriados
4. WHEN a moda é calculada THEN o sistema SHALL considerar intervalos de tempo agrupados (ex: 1-2 dias, 2-3 dias)
5. WHEN métricas são exibidas THEN o sistema SHALL mostrar timestamp da última atualização
6. WHEN cálculos falham THEN o sistema SHALL exibir mensagem de erro clara e manter valores anteriores

### Requirement 5

**User Story:** Como um stakeholder, eu quero visualizar indicadores de performance de forma clara e intuitiva, para que eu possa entender rapidamente o status do projeto.

#### Acceptance Criteria

1. WHEN KPIs são exibidos THEN o sistema SHALL usar cores consistentes (verde=bom, amarelo=atenção, vermelho=crítico)
2. WHEN números são apresentados THEN o sistema SHALL usar formatação adequada (decimais, unidades, separadores)
3. WHEN gráficos são mostrados THEN o sistema SHALL incluir legendas e labels explicativos
4. WHEN métricas complexas são exibidas THEN o sistema SHALL fornecer explicações em linguagem simples
5. WHEN o usuário acessa em dispositivos móveis THEN o sistema SHALL adaptar layout dos KPIs responsivamente
6. WHEN dados históricos existem THEN o sistema SHALL mostrar tendências com setas e percentuais de mudança