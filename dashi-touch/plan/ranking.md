# Página /ranking - Guia de Implementação

## Objetivo
Implementar a página /ranking com sistema de gamificação, conforme definido nas mecânicas.

## Lista de Tarefas

1. **Criar página /ranking**
   - Estruturar rota e componente para exibir o ranking dos usuários/equipes, para os componentes sempre se atentar ao estilo do projeto.

2. **Exibir tabela de classificação**
   - Mostrar posições, nomes/avatares e XP acumulado de cada usuário ou equipe.

3. **Implementar sistema de XP**
   - Pontuação por status da tarefa (10 / 5 / 0 XP).
   - Acúmulo de XP por usuário.

4. **Definir níveis de progressão**
   - Escalonar faixas de XP para diferentes níveis.
   - Exibir nível atual e progresso para o próximo nível.

5. **Calcular e exibir ranking semanal/mensal**
   - Atualizar classificação individual e coletiva conforme XP acumulado.

6. **Exibir detalhes de performance em card**
   - Ao clicar no responsável na tabela, abrir card centralizado.
   - Card deve mostrar:
     - Histórico de XP por tarefa
     - Bônus de consistência (recompensas por histórico positivo)
     - Penalizações leves (0 ou -5 XP por atrasos)
     - Metas curtas/missões semanais cumpridas

7. **Implementar lógica de bônus de consistência**
   - Recompensar usuários que mantêm histórico positivo.

8. **Implementar penalização leve**
   - Aplicar penalizações por atrasos, mantendo equilíbrio do sistema.

9. **Criar sistema de missões/metas curtas**
   - Definir desafios semanais (ex: entregar 3 tasks adiantadas).
   - Recompensar usuários que cumprirem as metas.

10. **Garantir atualização automática dos dados**
    - Sincronizar dados de tarefas, XP, ranking e metas em tempo real ou via atualização periódica.

11. **Testar e validar funcionalidades**
    - Garantir que todos os fluxos estejam funcionando conforme esperado.

---

Este guia deve ser seguido para garantir a implementação completa e organizada da função de ranking gamificado.