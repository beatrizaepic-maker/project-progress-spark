# Documentação do Banco de Dados - Dashi-Touch

## Sumário
1. [Visão Geral](#visão-geral)
2. [Estrutura de Dados](#estrutura-de-dados)
3. [Entidades e Relacionamentos](#entidades-e-relacionamentos)
4. [Tabelas do Banco de Dados](#tabelas-do-banco-de-dados)
5. [Operações CRUD](#operações-crud)
6. [Regras de Negócio e Cálculos](#regras-de-negócio-e-cálculos)
7. [Considerações de Segurança](#considerações-de-segurança)
8. [Performance e Indexação](#performance-e-indexação)
9. [Backup e Recuperação](#backup-e-recuperação)
10. [Integração com Frontend](#integração-com-frontend)
11. [Endpoints de API Relevantes](#endpoints-de-api-relevantes)
12. [Configurações e Variáveis de Ambiente](#configurações-e-variáveis-de-ambiente)

## Visão Geral

Este documento descreve a estrutura e funcionamento do banco de dados para o sistema Dashi-Touch, uma aplicação de gamificação para acompanhamento de produtividade e ranking de desenvolvedores.

### Objetivo do Sistema
O sistema Dashi-Touch permite o acompanhamento de tarefas, cálculo de produtividade baseado em cumprimento de prazos, ranking de usuários e métricas de desempenho, com vistas a promover a melhoria contínua e engajamento dos desenvolvedores.

### Arquitetura Atual
- **Backend**: Servidor Express.js (Node.js) com armazenamento em memória
- **Frontend**: Aplicação React com TypeScript
- **Persistência**: localStorage no frontend para dados locais, backend com dados em memória
- **API**: REST API para comunicação entre frontend e backend

## Estrutura de Dados

### Entidades Principais

#### 1. Usuário (User)
Representa um membro do time, jogador no sistema de gamificação.

**Atributos:**
- `id` (string): Identificador único do usuário
- `name` (string): Nome completo do usuário
- `avatar` (string): URL para imagem de avatar
- `xp` (number): Experiência total (calculada a partir da média percentual das tarefas * 10)
- `level` (number): Nível do usuário (calculado a partir do XP)
- `weeklyXp` (number): XP acumulado na semana
- `monthlyXp` (number): XP acumulado no mês
- `missionsCompleted` (number): Número de missões completadas
- `consistencyBonus` (number): Bônus de consistência (calculado a partir do streak)
- `streak` (number): Número de dias consecutivos de atividade

#### 2. Tarefa (Task)
Representa uma unidade de trabalho atribuída a um usuário.

**Atributos:**
- `id` (string): Identificador único da tarefa
- `title` (string): Título descritivo da tarefa
- `status` (string): Status da tarefa ('completed' | 'overdue' | 'pending' | 'refacao')
- `completedDate` (string): Data e hora de conclusão (opcional)
- `dueDate` (string): Data e hora de vencimento
- `assignedTo` (string): ID do usuário responsável
- `completedEarly` (boolean): Indica se a tarefa foi concluída antes do prazo (opcional)

#### 3. Missão (Mission)
Objetivos específicos que os usuários podem completar para ganhar recompensas.

**Atributos:**
- `id` (string): Identificador único da missão
- `title` (string): Título descritivo da missão
- `description` (string): Descrição da missão
- `xpReward` (number): XP recompensado ao completar a missão
- `completed` (boolean): Indica se a missão foi completada
- `deadline` (string): Data limite para completar a missão
- `userId` (string): ID do usuário atribuído (opcional, para missões individuais)

#### 4. Histórico de XP (XpHistory)
Registro de alterações de XP do usuário.

**Atributos:**
- `id` (string): Identificador único do registro
- `userId` (string): ID do usuário que ganhou/foi penalizado
- `xp` (number): Quantidade de XP ganha (positivo) ou perdida (negativo)
- `source` (string): Origem do XP ('task' | 'mission' | 'bonus' | 'penalty' | 'streak')
- `description` (string): Descrição da ação que gerou o XP
- `timestamp` (string): Data e hora do evento

#### 5. Submissão Incorreta (IncorrectSubmission)
Registro de submissões consideradas incorretas (usado para desempate no ranking).

**Atributos:**
- `id` (string): Identificador único do registro
- `playerId` (string): ID do jogador
- `taskId` (string): ID da tarefa associada (opcional)
- `competitionId` (string): ID da competição (opcional, pode ser nulo)
- `timestamp` (string): Data e hora da submissão incorreta

#### 6. Tarefa Persistente (PersistentTask)
Versão persistente de tarefa para cálculo de produtividade.

**Atributos:**
- `id` (string): Identificador único da tarefa
- `playerId` (string): ID do jogador (equivalente a assignedTo)
- `competitionId` (string): ID da competição (opcional, pode ser nulo)
- `titulo` (string): Título da tarefa (opcional)
- `prazo` (string): Data de vencimento (equivalente a dueDate)
- `dataConclusao` (string): Data de conclusão (equivalente a completedDate, opcional)
- `emRefacao` (boolean): Indica se a tarefa está em refação
- `classificacaoEntrega` (string): Classificação da entrega ('adiantada' | 'no_prazo' | 'atrasada' | 'refacao')
- `percentualProdutividade` (number): Percentual de produtividade (0-100)

#### 7. Agregado de Jogador (PlayerAggregate)
Dados agregados de produtividade por jogador e competição.

**Atributos:**
- `playerId` (string): ID do jogador
- `competitionId` (string): ID da competição (opcional, pode ser nulo)
- `somaPercentuais` (number): Soma dos percentuais de produtividade
- `totalTarefas` (number): Total de tarefas consideradas no cálculo
- `mediaPercentual` (number): Média percentual de produtividade
- `xpExibido` (number): XP exibido no ranking (média * 10 arredondado)
- `submissoesIncorretas` (number): Total de submissões incorretas (apenas para desempate)

## Entidades e Relacionamentos

### Diagrama de Entidades e Relacionamentos (DER)

```
[User] 1 ---- * [Task] (assignedTo)
[User] 1 ---- * [Mission] (userId)
[User] 1 ---- * [XpHistory] (userId)
[Task] 1 ---- * [IncorrectSubmission] (taskId)
[User] 1 ---- * [IncorrectSubmission] (playerId)
[User] 1 ---- * [PersistentTask] (playerId)
[User] 1 ---- * [PlayerAggregate] (playerId)
```

### Relacionamentos
- Um usuário pode ter muitas tarefas atribuídas
- Um usuário pode ter muitas missões atribuídas
- Um usuário pode ter muitos registros de histórico de XP
- Um usuário pode ter muitas submissões incorretas
- Uma tarefa pode estar associada a zero ou uma submissão incorreta
- Um usuário pode ter muitas tarefas persistentes
- Um usuário pode ter muitos agregados de produtividade (por competição)

## Tabelas do Banco de Dados

### users
Armazena os dados básicos dos usuários.

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  weeklyXp INT DEFAULT 0,
  monthlyXp INT DEFAULT 0,
  missionsCompleted INT DEFAULT 0,
  consistencyBonus INT DEFAULT 0,
  streak INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### tasks
Armazena as tarefas atribuídas aos usuários.

```sql
CREATE TABLE tasks (
  id VARCHAR(255) PRIMARY KEY NOT NULL,
  title VARCHAR(500) NOT NULL,
  status ENUM('completed', 'overdue', 'pending', 'refacao') NOT NULL,
  completed_date TIMESTAMP NULL,
  due_date TIMESTAMP NOT NULL,
  assigned_to VARCHAR(255) NOT NULL,
  completed_early BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
);
```

### missions
Armazena as missões que podem ser completadas pelos usuários.

```sql
CREATE TABLE missions (
  id VARCHAR(255) PRIMARY KEY NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  xp_reward INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  deadline TIMESTAMP NOT NULL,
  user_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### xp_history
Registra as alterações de XP dos usuários.

```sql
CREATE TABLE xp_history (
  id VARCHAR(255) PRIMARY KEY NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  xp INT NOT NULL,
  source ENUM('task', 'mission', 'bonus', 'penalty', 'streak') NOT NULL,
  description VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### incorrect_submissions
Registra submissões incorretas para desempate no ranking.

```sql
CREATE TABLE incorrect_submissions (
  id VARCHAR(255) PRIMARY KEY NOT NULL,
  player_id VARCHAR(255) NOT NULL,
  task_id VARCHAR(255) NULL,
  competition_id VARCHAR(255) NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
```

### persistent_tasks
Versão persistente das tarefas para cálculo de produtividade.

```sql
CREATE TABLE persistent_tasks (
  id VARCHAR(255) PRIMARY KEY NOT NULL,
  player_id VARCHAR(255) NOT NULL,
  competition_id VARCHAR(255) NULL,
  titulo VARCHAR(500),
  prazo TIMESTAMP NOT NULL,
  data_conclusao TIMESTAMP NULL,
  em_refacao BOOLEAN DEFAULT FALSE,
  classificacao_entrega ENUM('adiantada', 'no_prazo', 'atrasada', 'refacao') NOT NULL,
  percentual_produtividade INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### player_aggregates
Dados agregados de produtividade por jogador e competição.

```sql
CREATE TABLE player_aggregates (
  player_id VARCHAR(255) NOT NULL,
  competition_id VARCHAR(255) NULL,
  soma_percentuais DECIMAL(10,2) DEFAULT 0.00,
  total_tarefas INT DEFAULT 0,
  media_percentual DECIMAL(5,2) DEFAULT 0.00,
  xp_exibido INT DEFAULT 0,
  submissoes_incorretas INT DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, competition_id),
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Operações CRUD

### Usuários (Users)
- **CREATE**: Inserir novo usuário com informações básicas
- **READ**: Obter informações completas de um ou mais usuários, incluindo XP e nível calculados
- **UPDATE**: Atualizar informações do usuário ou calcular novo XP/nível baseado em tarefas
- **DELETE**: Remover usuário e todas as entidades associadas (tarefas, histórico de XP, etc.)

### Tarefas (Tasks)
- **CREATE**: Inserir nova tarefa com status e datas
- **READ**: Obter tarefas de um usuário, todas as tarefas ou tarefas filtradas
- **UPDATE**: Atualizar status, datas de conclusão ou vencimento, ou mover para refação
- **DELETE**: Remover tarefa (cascata para histórico de XP relacionado)

### Missões (Missions)
- **CREATE**: Criar nova missão com recompensa e prazo
- **READ**: Obter missões de um usuário ou todas as missões ativas
- **UPDATE**: Marcar missão como completada ou atualizar informações
- **DELETE**: Remover missão

## Regras de Negócio e Cálculos

### 1. Cálculo de XP
O XP é calculado baseado na média percentual de produtividade das tarefas, com a fórmula: `XP = roundHalfUp((somaPercentuais / totalTarefas) * 10)`

#### Classificação de Entrega e Percentuais:
- **Tarefa adiantada**: 100% de produtividade
- **Tarefa no prazo**: 90% de produtividade
- **Tarefa atrasada**: 50% de produtividade
- **Tarefa em refação**: 40% de produtividade (quando reconcluída)
- **Tarefa não completada**: 0% (não entra no cálculo da média)

### 2. Cálculo de Nível
O nível é determinado com base no XP total acumulado, seguindo a seguinte escala:
- Nível 1: 0 XP
- Nível 2: 100 XP
- Nível 3: 250 XP
- Nível 4: 500 XP
- Nível 5: 1000 XP
- Nível 6: 2000 XP
- Nível 7: 4000 XP
- Nível 8: 8000 XP

### 3. Cálculo de Bônus de Consistência
O bônus de consistência é calculado com base no streak (dias consecutivos de atividade):
- 0-2 dias: 0 XP de bônus
- 3-6 dias: até 20 XP de bônus (2 por dia)
- 7+ dias: até 50 XP de bônus (1 por dia, com máximo de 50)

### 4. Desempate no Ranking
Quando usuários têm o mesmo XP, o desempate é feito por:
1. Menor número de submissões incorretas
2. Primeiro a concluir tarefas (menor timestamp de primeira conclusão)

### 5. Atualização de Ranking
O ranking é recalculado automaticamente quando:
- Uma tarefa é atualizada (status, datas de conclusão ou vencimento)
- Uma missão é completada
- Uma flag de administração é alterada (afetando o modo de scoring)

### 6. Modo de Scoring
O sistema suporta dois modos de cálculo de produtividade:
- **Modo Legado**: Cada tarefa completada vale 10 XP
- **Modo Produtividade**: XP baseado na média percentual de completude (como descrito acima)

As flags de administração permitem aplicar diferentes modos por competição e fazer rollouts parciais entre modos.

## Considerações de Segurança

### 1. Autenticação e Autorização
- Implementar sistema de autenticação robusto (JWT, OAuth)
- Controle de acesso baseado em funções (RBAC) para diferentes níveis de usuário (admin, dev, user)
- Proteger endpoints de gerenciamento e configuração

### 2. Validação de Dados
- Validar todos os inputs recebidos via API
- Verificar integridade das referências entre entidades
- Sanitizar dados antes de persistir no banco

### 3. Privilégios de Banco de Dados
- Usar contas de banco de dados com privilégios mínimos
- Separar contas para leitura e escrita quando possível
- Criptografar conexão com o banco de dados

### 4. Auditoria
- Manter logs de todas as operações críticas
- Registrar tentativas de acesso não autorizado
- Monitorar alterações de flags administrativas

## Performance e Indexação

### Índices Recomendados
- `users(id)` - PK
- `tasks(assigned_to)` - FK e filtro comum
- `tasks(due_date)` - Filtro por data de vencimento
- `tasks(status)` - Filtro por status
- `persistent_tasks(player_id)` - FK e agrupamento
- `persistent_tasks(competition_id)` - Agrupamento por competição
- `xp_history(user_id)` - FK e filtro por usuário
- `incorrect_submissions(player_id)` - FK e desempate

### Estratégias de Performance
- Cache de resultados de ranking (recálculo a cada 15s no protótipo)
- Índices compostos para consultas frequentes (ex: player_id + competition_id)
- Particionamento de dados históricos (antigos em tabelas separadas)
- Consultas otimizadas para endpoints de relatório (CSV export)

## Backup e Recuperação

### Estratégias de Backup
- Backup completo do banco de dados diariamente
- Backup incremental a cada 6 horas
- Cópias off-site para proteção contra desastres
- Testar periodicamente a restauração dos backups

### Recuperação de Dados
- Procedimentos documentados para recuperação de desastres
- Ponto de recuperação objetivo (RPO) de no máximo 1 hora
- Objetivo de tempo de recuperação (RTO) de no máximo 2 horas

## Integração com Frontend

### DTOs (Data Transfer Objects)
O sistema utiliza DTOs para garantir que apenas os dados apropriados sejam expostos ao frontend, mantendo a lógica de negócio protegida:

#### DTO do Ranking (RankingEntryDTO)
- Exibe: ID, nome, avatar, XP, nível, XP semanal e mensal, missões completadas, bônus de consistência, streak
- Não inclui: percentuais de produtividade (apenas para desempate interno)

#### DTO do Perfil (PlayerProfileDTO)
- Exibe: ID, nome, avatar, nível, missões completadas, streak
- Também inclui: produtividade (total considerado, média percentual) e distribuição de entregas
- Detalhes de produtividade visíveis apenas no perfil individual

### Camadas de Serviço
- **gamificationService**: Lógica de negócio e cálculos
- **dtoTransformers**: Conversão de modelos internos para DTOs
- **mockApi**: Camada de abstração para chamadas API (ou mock local)
- **modelStore**: Persistência local (localStorage) e migração de dados

## Endpoints de API Relevantes

### Rankings
- `GET /api/ranking` - Retorna o ranking completo
- `GET /api/reports/ranking.csv` - Exporta ranking em CSV

### Perfis de Jogadores
- `GET /api/profiles/:id` - Retorna perfil detalhado de um jogador

### Tarefas
- `POST /api/tasks/update` - Atualiza status de uma tarefa
- `GET /api/reports/productivity.csv` - Exporta produtividade em CSV
- `GET /api/reports/incorrect.csv` - Exporta submissões incorretas em CSV

### Administração
- `POST /api/seed` - Carrega dados iniciais (usuários e tarefas)
- `POST /api/reprocess` - Recalcula ranking manualmente
- `POST /api/admin/flags` - Define flags administrativas globais
- `POST /api/admin/flags/competition` - Define flags por competição

### Métricas e Saúde
- `GET /api/health` - Verifica estado do sistema
- `GET /api/health/xp-drift` - Verifica consistência de cálculo de XP
- `GET /api/metrics` - Obtém métricas de desempenho
- `GET /api/metrics/prom` - Métricas no formato Prometheus

### SSE (Server-Sent Events)
- `GET /api/events` - Eventos de atualização em tempo real (ex: ranking atualizado)

## Configurações e Variáveis de Ambiente

### Configurações de Gamificação
As configurações de percentuais de produtividade podem ser ajustadas via localStorage:
- `early`: 100% (padrão)
- `on_time`: 90% (padrão)
- `late`: 50% (padrão)
- `refacao`: 40% (padrão)

### Variáveis de Ambiente
- `PORT`: Porta do servidor (padrão: 3001)
- `NODE_ENV`: Ambiente de execução (development, production)
- `DATABASE_URL`: URL de conexão com o banco de dados (quando implementado)
