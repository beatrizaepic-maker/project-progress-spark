# Cálculos Estatísticos - Documentação Técnica

## Visão Geral

Este documento detalha todos os cálculos estatísticos implementados no sistema de KPIs, incluindo fórmulas, implementações e considerações especiais.

## 1. Dias Úteis

### Descrição
Calcula a diferença entre duas datas considerando apenas dias úteis (segunda a sexta-feira).

### Implementação
```typescript
private calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Não é domingo (0) nem sábado (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return Math.max(0, count - 1); // Subtrai 1 para não contar o primeiro dia
}
```

### Considerações
- Fins de semana (sábado e domingo) são excluídos
- Feriados não são considerados na implementação atual
- Retorna 0 para períodos inválidos ou negativos

## 2. Remoção de Outliers

### Método IQR (Interquartile Range)

#### Descrição
Remove valores extremos usando o método de amplitude interquartil.

#### Fórmula
```
Q1 = 25º percentil
Q3 = 75º percentil
IQR = Q3 - Q1
Lower Bound = Q1 - 1.5 × IQR
Upper Bound = Q3 + 1.5 × IQR
```

#### Implementação
```typescript
private removeOutliers(values: number[]): number[] {
  if (values.length < 4) return values;
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(value => value >= lowerBound && value <= upperBound);
}
```

### Método Z-Score (Alternativo)

#### Descrição
Remove valores com desvio superior a N desvios padrão.

#### Fórmula
```
Z = (x - μ) / σ
Onde:
- x = valor observado
- μ = média
- σ = desvio padrão
```

#### Implementação
```typescript
private removeOutliersZScore(values: number[], threshold: number = 2): number[] {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return values.filter(value => Math.abs((value - mean) / stdDev) <= threshold);
}
```

## 3. Cálculos de Tendência Central

### 3.1 Média Aritmética

#### Fórmula
```
μ = (Σ xi) / n
```

#### Implementação
```typescript
private calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
```

### 3.2 Mediana

#### Descrição
Valor central quando os dados estão ordenados.

#### Implementação
```typescript
private calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}
```

### 3.3 Moda

#### Descrição
Valor ou faixa de valores mais frequente.

#### Implementação com Agrupamento
```typescript
private calculateMode(values: number[]): { value: number; frequency: number; percentage: number } {
  if (values.length === 0) return { value: 0, frequency: 0, percentage: 0 };
  
  // Agrupa valores em intervalos para dados contínuos
  const intervals = this.createIntervals(values, 10);
  const frequency = new Map<string, { count: number; range: [number, number] }>();
  
  values.forEach(value => {
    const interval = this.findInterval(value, intervals);
    const key = `${interval[0]}-${interval[1]}`;
    const current = frequency.get(key) || { count: 0, range: interval };
    frequency.set(key, { count: current.count + 1, range: interval });
  });
  
  // Encontra a maior frequência
  let maxFreq = 0;
  let modeRange: [number, number] = [0, 0];
  
  frequency.forEach(({ count, range }) => {
    if (count > maxFreq) {
      maxFreq = count;
      modeRange = range;
    }
  });
  
  const modeValue = (modeRange[0] + modeRange[1]) / 2;
  const percentage = (maxFreq / values.length) * 100;
  
  return { value: modeValue, frequency: maxFreq, percentage };
}
```

## 4. Medidas de Dispersão

### 4.1 Desvio Padrão

#### Fórmula (População)
```
σ = √(Σ(xi - μ)² / N)
```

#### Fórmula (Amostra)
```
s = √(Σ(xi - x̄)² / (n-1))
```

#### Implementação
```typescript
private calculateStandardDeviation(values: number[], isSample: boolean = true): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;
  
  const mean = this.calculateMean(values);
  const sumSquaredDiffs = values.reduce((sum, value) => {
    return sum + Math.pow(value - mean, 2);
  }, 0);
  
  const denominator = isSample ? values.length - 1 : values.length;
  return Math.sqrt(sumSquaredDiffs / denominator);
}
```

### 4.2 Variância

#### Implementação
```typescript
private calculateVariance(values: number[], isSample: boolean = true): number {
  const stdDev = this.calculateStandardDeviation(values, isSample);
  return Math.pow(stdDev, 2);
}
```

### 4.3 Amplitude

#### Implementação
```typescript
private calculateRange(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}
```

## 5. Análise de Box Plot

### 5.1 Quartis

#### Implementação
```typescript
private calculateQuartiles(values: number[]): {
  q1: number;
  q2: number; // mediana
  q3: number;
  min: number;
  max: number;
  iqr: number;
} {
  if (values.length === 0) {
    return { q1: 0, q2: 0, q3: 0, min: 0, max: 0, iqr: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  const q1Index = Math.floor(n * 0.25);
  const q2Index = Math.floor(n * 0.5);
  const q3Index = Math.floor(n * 0.75);
  
  const q1 = sorted[q1Index];
  const q2 = sorted[q2Index];
  const q3 = sorted[q3Index];
  
  return {
    q1,
    q2,
    q3,
    min: sorted[0],
    max: sorted[n - 1],
    iqr: q3 - q1
  };
}
```

## 6. Análise de Distribuição

### 6.1 Histograma

#### Implementação
```typescript
private createHistogram(values: number[], bins: number = 10): Array<{
  range: [number, number];
  count: number;
  percentage: number;
}> {
  if (values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / bins;
  
  const histogram = [];
  
  for (let i = 0; i < bins; i++) {
    const start = min + i * binWidth;
    const end = min + (i + 1) * binWidth;
    
    const count = values.filter(value => 
      value >= start && (i === bins - 1 ? value <= end : value < end)
    ).length;
    
    histogram.push({
      range: [start, end] as [number, number],
      count,
      percentage: (count / values.length) * 100
    });
  }
  
  return histogram;
}
```

## 7. Cálculos Específicos do Projeto

### 7.1 Média de Atraso

#### Descrição
Calcula a média de atrasos considerando apenas dias úteis.

#### Implementação
```typescript
public calculateAverageDelay(tasks: TaskData[]): number {
  const delays = tasks
    .filter(task => task.endDate && task.plannedEndDate)
    .map(task => this.calculateBusinessDays(
      new Date(task.plannedEndDate!),
      new Date(task.endDate!)
    ))
    .filter(delay => delay > 0); // Apenas atrasos positivos
  
  const cleanDelays = this.config.removeOutliers 
    ? this.removeOutliers(delays)
    : delays;
  
  return this.calculateMean(cleanDelays);
}
```

### 7.2 Status do Projeto

#### Implementação
```typescript
public calculateProjectStatus(tasks: TaskData[]): {
  status: 'on-time' | 'at-risk' | 'delayed';
  completionPercentage: number;
  onTimePercentage: number;
} {
  const completedTasks = tasks.filter(task => task.status === 'Concluído');
  const totalTasks = tasks.length;
  const completionPercentage = (completedTasks.length / totalTasks) * 100;
  
  const onTimeTasks = completedTasks.filter(task => {
    if (!task.endDate || !task.plannedEndDate) return true;
    const delay = this.calculateBusinessDays(
      new Date(task.plannedEndDate),
      new Date(task.endDate)
    );
    return delay <= 0;
  });
  
  const onTimePercentage = completedTasks.length > 0 
    ? (onTimeTasks.length / completedTasks.length) * 100
    : 100;
  
  let status: 'on-time' | 'at-risk' | 'delayed';
  if (onTimePercentage >= 80) {
    status = 'on-time';
  } else if (onTimePercentage >= 60) {
    status = 'at-risk';
  } else {
    status = 'delayed';
  }
  
  return { status, completionPercentage, onTimePercentage };
}
```

## 8. Validação e Tratamento de Erros

### 8.1 Validação de Dados

```typescript
private validateTaskData(task: TaskData): boolean {
  // Verifica se as datas são válidas
  if (task.startDate && isNaN(new Date(task.startDate).getTime())) {
    return false;
  }
  
  if (task.endDate && isNaN(new Date(task.endDate).getTime())) {
    return false;
  }
  
  if (task.plannedEndDate && isNaN(new Date(task.plannedEndDate).getTime())) {
    return false;
  }
  
  // Verifica consistência entre datas
  if (task.startDate && task.endDate) {
    if (new Date(task.startDate) > new Date(task.endDate)) {
      return false;
    }
  }
  
  return true;
}
```

### 8.2 Tratamento de Casos Extremos

```typescript
private handleEdgeCases(values: number[]): number[] {
  // Remove valores inválidos
  const validValues = values.filter(value => 
    !isNaN(value) && 
    isFinite(value) && 
    value >= 0 // Para contextos onde valores negativos não fazem sentido
  );
  
  // Se restaram poucos valores, retorna array vazio para indicar dados insuficientes
  if (validValues.length < 3) {
    return [];
  }
  
  return validValues;
}
```

## 9. Testes e Validação

### 9.1 Casos de Teste Recomendados

```typescript
// Teste de dias úteis
const testBusinessDays = () => {
  // Segunda a sexta (5 dias úteis, mas 4 de diferença)
  const start = new Date('2024-01-01'); // Segunda
  const end = new Date('2024-01-05');   // Sexta
  console.assert(calculateBusinessDays(start, end) === 4);
  
  // Incluindo fim de semana
  const startWithWeekend = new Date('2024-01-05'); // Sexta
  const endWithWeekend = new Date('2024-01-08');   // Segunda
  console.assert(calculateBusinessDays(startWithWeekend, endWithWeekend) === 1);
};

// Teste de remoção de outliers
const testOutlierRemoval = () => {
  const values = [1, 2, 3, 4, 5, 100]; // 100 é outlier
  const cleaned = removeOutliers(values);
  console.assert(!cleaned.includes(100));
};
```

## 10. Performance e Otimização

### 10.1 Complexidade Temporal

- **Dias úteis**: O(n) onde n é o número de dias
- **Remoção de outliers**: O(n log n) devido à ordenação
- **Média**: O(n)
- **Mediana**: O(n log n) devido à ordenação
- **Moda**: O(n) com agrupamento
- **Desvio padrão**: O(n)

### 10.2 Otimizações Implementadas

```typescript
// Cache de cálculos frequentes
private calculationCache = new Map<string, any>();

private getCachedCalculation<T>(key: string, calculator: () => T): T {
  if (this.calculationCache.has(key)) {
    return this.calculationCache.get(key);
  }
  
  const result = calculator();
  this.calculationCache.set(key, result);
  return result;
}

// Uso de memoização para valores derivados
private memoizedMean = this.memoize(this.calculateMean.bind(this));
private memoizedStdDev = this.memoize(this.calculateStandardDeviation.bind(this));
```

Esta documentação serve como referência técnica completa para entender e manter os cálculos estatísticos do sistema.
