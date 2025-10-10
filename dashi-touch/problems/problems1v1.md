# Problemas 1v1 - Competição de Programação

## Visão Geral
Este documento contém uma coleção de problemas de programação para competições 1v1 no sistema Dashi-Touch. Os problemas são organizados por dificuldade e categoria, com descrições completas, exemplos e critérios de avaliação.

## Estrutura dos Problemas
Cada problema seguirá o seguinte formato:
- Nome do problema
- Descrição
- Entrada
- Saída
- Exemplos
- Restrições
- Dificuldade
- Categoria

---

## Problema 1: Soma Simples
**Dificuldade:** Fácil  
**Categoria:** Implementação

### Descrição
Dado dois números inteiros A e B, calcule e retorne a soma A + B.

### Entrada
A entrada contém dois inteiros separados por espaço: A e B (-1000 ≤ A, B ≤ 1000)

### Saída
Imprima um único número inteiro representando a soma de A e B.

### Exemplo
**Entrada:** `3 5`  
**Saída:** `8`

### Restrições
-1000 ≤ A, B ≤ 1000

---

## Problema 2: Sequência de Fibonacci
**Dificuldade:** Médio  
**Categoria:** Matemática, Recursão

### Descrição
Dado um número inteiro N, calcule o N-ésimo número da sequência de Fibonacci. A sequência é definida como: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2).

### Entrada
Um único inteiro N (0 ≤ N ≤ 45)

### Saída
O N-ésimo número da sequência de Fibonacci.

### Exemplo
**Entrada:** `6`  
**Saída:** `8`

### Restrições
0 ≤ N ≤ 45

---

## Problema 3: Árvore de Busca Binária
**Dificuldade:** Médio  
**Categoria:** Estrutura de Dados

### Descrição
Dado uma sequência de N números inteiros, insira-os em uma árvore de busca binária (BST) na ordem dada. Em seguida, realize uma travessia em ordem e imprima os valores.

### Entrada
A primeira linha contém um inteiro N (1 ≤ N ≤ 1000), o número de elementos. A segunda linha contém N inteiros separados por espaço.

### Saída
Imprima os valores em ordem (em-ordem), separados por espaços.

### Exemplo
**Entrada:**
```
5
4 2 5 1 3
```

**Saída:**
```
1 2 3 4 5
```

### Restrições
- 1 ≤ N ≤ 1000
- Elementos são inteiros entre -10000 e 10000

---

## Problema 4: Grafo Conectado
**Dificuldade:** Difícil  
**Categoria:** Grafos

### Descrição
Dado um grafo não-direcionado com N vértices e M arestas, determine se o grafo é conectado (existe um caminho entre qualquer par de vértices).

### Entrada
A primeira linha contém dois inteiros N e M (1 ≤ N ≤ 1000, 0 ≤ M ≤ N*(N-1)/2). As próximas M linhas contêm duas inteiros u e v, indicando uma aresta entre os vértices u e v.

### Saída
Imprima "SIM" se o grafo for conectado, "NAO" caso contrário.

### Exemplo
**Entrada:**
```
4 3
1 2
2 3
3 4
```

**Saída:**
```
SIM
```

### Restrições
- 1 ≤ N ≤ 1000
- 0 ≤ M ≤ N*(N-1)/2
- Não há arestas repetidas
- Não há auto-laços

---

## Problema 5: Subsequência Crescente Mais Longa
**Dificuldade:** Difícil  
**Categoria:** Programação Dinâmica

### Descrição
Dado uma sequência de N números inteiros, encontre o comprimento da mais longa subsequência crescente (LIS - Longest Increasing Subsequence).

### Entrada
A primeira linha contém um inteiro N (1 ≤ N ≤ 1000). A segunda linha contém N inteiros separados por espaço.

### Saída
Imprima um único inteiro representando o comprimento da LIS.

### Exemplo
**Entrada:**
```
8
10 9 2 5 3 7 101 18
```

**Saída:**
```
4
```

Explicação: A LIS é [2, 3, 7, 18] ou [2, 3, 7, 101].

### Restrições
- 1 ≤ N ≤ 1000
- Elementos são inteiros entre -10000 e 10000

---

## Configurações da Competição 1v1

### Duração
- Cada competição dura 90 minutos
- Os competidores recebem todos os problemas no início
- Submissões são permitidas até o final do tempo

### Sistema de Pontuação
- Cada problema resolvido corretamente vale 1 ponto
- Em caso de empate, o competidor que terminou primeiro vence
- Critério de desempate secundário: penalidade por submissões incorretas

### Regras
- Cada competidor trabalha individualmente
- É permitido consultar a documentação da linguagem de programação
- Códigos de terceiros não são permitidos
- Qualquer tentativa de comunicação com outros competidores resulta em desqualificação