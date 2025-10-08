# Guia para Criação do Manual de Usuário – Plataforma "Project Progress Spark"

## 1. Objetivo e Filosofia

Este documento é o guia mestre para a criação do manual de usuário da nossa plataforma de acompanhamento de KPIs. O objetivo **não é escrever o manual aqui**, mas sim definir as diretrizes, a estrutura e o tom que o manual final deve ter.

A filosofia é simples: **clareza, precisão e foco no usuário**. O manual deve capacitar até mesmo o usuário mais leigo a utilizar a plataforma de forma eficiente e autônoma, reduzindo a necessidade de suporte técnico.

**Público-Alvo:** Gestores de projeto, analistas de dados e membros de equipe que precisam tanto alimentar dados quanto consumir os dashboards e relatórios gerados. O texto deve ser acessível para todos os níveis de familiaridade técnica.

---

## 2. Estrutura Sugerida para o Manual

O manual deve ser organizado de forma lógica e progressiva. Utilize a seguinte estrutura como esqueleto:

**Capítulo 1: Introdução**
- **1.1. O que é o Project Progress Spark?** (Visão geral do propósito da plataforma)
- **1.2. Para quem é este manual?**
- **1.3. Como usar este manual?** (Explicação sobre ícones, seções, etc.)

**Capítulo 2: Primeiros Passos**
- **2.1. Acessando a Plataforma** (Login, URL, requisitos de navegador)
- **2.2. Visão Geral da Interface (Tour Rápido)**
    - Apresentação do Layout Principal (`DashboardLayout.tsx`)
    - A Barra de Navegação (`IntegratedNavigation.tsx` e `AnimatedSidebar.tsx`)
    - O Header (`Header.tsx`)

**Capítulo 3: O Dashboard Principal**
- **3.1. Entendendo os KPIs** (Explicação conceitual do que são os KPIs exibidos)
- **3.2. Seção de KPIs Principais (`DashboardKPIs.tsx`)**
    - Detalhamento de cada card (`KPICard.tsx`, `AverageDelayCard.tsx`, etc.)
- **3.3. Gráficos de Desempenho (`Charts.tsx`)**
    - Como interpretar os gráficos de produção, distribuição, etc.
- **3.4. Tabela de Tarefas (`TaskTable.tsx`)**
    - Funcionalidades de visualização, ordenação e filtro.

**Capítulo 4: Editando e Inserindo Dados**
- **4.1. Acessando o Editor de Dados (`DataEditor.tsx`)**
- **4.2. Validando e Salvando Informações**
- **4.3. Boas práticas para manter a integridade dos dados.**

**Capítulo 5: Análises Avançadas**
- **5.1. A Página de Analytics (`Analytics.tsx`)**
- **5.2. Detalhamento dos Gráficos Analíticos**
    - `DelayDistributionChart.tsx`
    - `MedianBoxPlot.tsx`
    - `ModeFrequencyChart.tsx`
    - `ProductionAverageChart.tsx`
- **5.3. Como extrair insights a partir das análises.**

**Capítulo 6: Configurações e Personalização**
- **6.1. A Página de Configurações (`Settings.tsx`)**
- **6.2. Opções disponíveis para o usuário.**

**Capítulo 7: Guia de Solução de Problemas (FAQ)**
- "O que fazer se um KPI parecer incorreto?"
- "Não consigo salvar meus dados, e agora?"
- "Como exportar um gráfico ou relatório?"

**Apêndice A: Glossário de Termos**
- Lista de todos os termos técnicos e específicos da plataforma (ex: "Lead Time", "Cycle Time", "Throughput") e suas definições claras.

---

## 3. Estilo de Escrita e Tom de Voz

- **Tom:** Profissional, mas acessível e encorajador. Evite um tom excessivamente técnico ou robótico.
- **Voz:** Use a voz ativa. Ex: "Clique no botão Salvar" em vez de "O botão Salvar deve ser clicado".
- **Clareza e Concisão:** Vá direto ao ponto. Use frases curtas e parágrafos bem definidos.
- **Consistência:** Use terminologia consistente. Se você chama de "Dashboard", mantenha esse nome em todo o manual.

---

## 4. Formatação e Elementos Visuais

- **Títulos e Subtítulos:** Use Markdown (`#`, `##`, `###`) para criar uma hierarquia clara e navegável.
- **Ênfase:** Use **negrito** para nomes de botões, menus e elementos de interface clicáveis. Use *itálico* para ênfase em conceitos.
- **Listas:** Use listas numeradas para passos sequenciais e listas com marcadores para itens não ordenados.
- **Screenshots (Capturas de Tela):** **ESSENCIAL.** Cada funcionalidade descrita deve ser acompanhada por uma captura de tela limpa e bem recortada. Use setas, caixas e anotações simples para destacar a área de interesse.
- **Ícones:** Considere usar ícones para dicas (`💡 Dica`), avisos (`⚠️ Atenção`) e informações importantes (`ℹ️ Nota`).

---

## 5. Processo de Criação e Manutenção

1.  **Esboço:** Siga a estrutura definida na Seção 2 deste guia.
2.  **Redação:** Escreva o conteúdo de cada seção, focando em um capítulo por vez.
3.  **Captura de Imagens:** Tire as screenshots necessárias à medida que descreve as funcionalidades.
4.  **Revisão Técnica:** Peça para um desenvolvedor ou QA revisar o manual para garantir a precisão técnica das informações.
5.  **Revisão de Texto:** Peça para alguém não-técnico ler o manual para garantir que a linguagem está clara e compreensível.
6.  **Atualização Contínua:** O manual é um documento vivo. A cada nova funcionalidade ou alteração na interface, o manual **deve** ser atualizado correspondentemente.
