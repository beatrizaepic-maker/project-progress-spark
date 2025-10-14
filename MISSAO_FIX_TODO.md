# Solução Cirúrgica - Sistema de Missões XP

## Objetivo: Conectar conclusão de tarefas com atualização de missões individuais

### Tarefa Única Crítica
**Modificar a função `editTask` no DataContext para atualizar missões individuais ao concluir tarefas**

### Implementação:
1. No arquivo `src/contexts/DataContext.tsx`, na função `editTask`, adicionar chamada para atualizar progresso de missões quando status da tarefa muda para 'completed'

2. Importar a função `processWeeklyMissions` do serviço de missões

3. Quando uma tarefa muda para 'completed', obter missões ativas do usuário, processar com a nova tarefa, e salvar missões atualizadas

### Benefícios:
- Solução única que resolve o problema central
- Conecta diretamente conclusão de tarefas com progresso de missões
- Usa componentes já existentes no sistema
- Atualização imediata ao concluir tarefas