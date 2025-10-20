# Solução para o Problema de Cálculo de Tarefas por Player

## Tarefa Única - Solução Cirúrgica, Rápida e Eficiente

### 1. Corrigir a Geração de IDs Únicos nas Tarefas

**Problema:** O sistema permite IDs duplicados para tarefas, causando sobreposição de cálculos e resultados incorretos a partir da segunda tarefa do mesmo player.

**Solução:**
- Modificar o método de geração de ID em `DataContext.tsx` para garantir IDs únicos mesmo após exclusões
- Substituir a lógica atual:
  ```typescript
  const existingIds = tasks.map(t => t.id);
  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  const newId = maxId + 1;
  ```
- Por uma lógica com verificação de existência:
  ```typescript
  let newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  while (tasks.some(t => t.id === newId)) {
    newId++;
  }
  ```

**Localização do Arquivo:** `src/contexts/DataContext.tsx`
**Linha:** Função `addTask`

**Impacto:** Esta única alteração resolverá o problema de sobreposição de cálculos, permitindo que cada tarefa seja tratada individualmente e que os pontos e métricas sejam calculados corretamente para todas as tarefas de um mesmo player.