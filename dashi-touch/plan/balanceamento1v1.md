# Balanceamento de Pontuação 1v1

## Introdução
Este documento detalha o novo método de cálculo de pontuação para o ranking das competições 1v1, focando no balanceamento e na valorização da qualidade das entregas dos players.

## Lógica do Cálculo
O sistema de pontuação foi reformulado para considerar não apenas a quantidade de tarefas concluídas, mas principalmente a qualidade e o tempo de entrega de cada tarefa. O cálculo segue os seguintes passos:

1. **Atribuição de Percentual por Tarefa**
   - Cada tarefa concluída pelo player recebe um percentual de produtividade, conforme a qualidade da entrega:
     - Entrega adiantada: **100%**
     - Entrega no prazo: **90%**
     - Entrega atrasada: **50%**
     - Tarefa em refação: **40%**
   - Outros percentuais podem ser definidos conforme critérios adicionais de avaliação.

2. **Cálculo do Aproveitamento Total**
   - Os percentuais atribuídos a cada tarefa são somados, formando o total de aproveitamento do player.

3. **Média Percentual de Aproveitamento**
   - O total de aproveitamento é dividido pelo número total de tarefas executadas pelo player, gerando a média percentual de produtividade.

4. **Conversão para XP**
   - A média percentual é multiplicada por 10 para ser convertida em XP, que será exibido no ranking.
   - Fórmula:
     $$\text{XP} = \left(\frac{\sum \text{percentuais das tarefas}}{\text{total de tarefas}}\right) \times 10$$

## Exemplo Prático
Suponha que um player executou 4 tarefas com os seguintes percentuais:
- Tarefa 1: 100% (adiantada)
- Tarefa 2: 90% (no prazo)
- Tarefa 3: 50% (atrasada)
- Tarefa 4: 40% (refação)

Cálculo:
- Soma dos percentuais: 100 + 90 + 50 + 40 = 280
- Total de tarefas: 4
- Média percentual: 280 / 4 = 70
- XP exibido no ranking: 70 × 10 = **700 XP**

## Benefícios do Novo Método
- Valoriza a qualidade e o comprometimento do player.
- Desestimula entregas atrasadas e refações.
- Promove um ranking mais justo e equilibrado.
- Permite ajustes e personalizações conforme critérios da competição.

## Considerações Finais
Este método pode ser adaptado para incluir novos critérios de avaliação, conforme a evolução das competições e feedback dos participantes. O objetivo é garantir que o ranking reflita de forma fiel a produtividade e eficiência dos players.
