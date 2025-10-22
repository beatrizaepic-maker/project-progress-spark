# Guia Completo de Estilos e Componentes Visuais — EPIC Space

## Introdução
Este documento consolidado descreve todos os estilos, componentes visuais e padrões de design utilizados na plataforma EPIC Space. Serve como referência completa para implementação e replicação fiel de toda a identidade visual do sistema, desde paleta de cores até efeitos de animação e feedback do usuário.

**O objetivo é permitir que qualquer desenvolvedor, consultando apenas este documento, seja capaz de recriar e manter consistentemente os estilos e componentes visuais da plataforma.**

---

## 1. Paleta de Cores Principal

A identidade visual da plataforma baseia-se em uma paleta de cores harmoniosa e contrastante:

### 1.1 Cor Primária — Rosa Vibrante/Magenta Fluorescente
- **Código:** `#FF0066`
- **Uso Recomendado:**
  - Títulos grandes e chamadas à ação
  - Botões principais (especialmente "COMECE AGORA" e ações críticas)
  - Elementos que precisam chamar atenção imediata
  - Ícones de destaque
  - Gradientes como cor inicial
  - Efeitos visuais de hover
  - Sombras (em variações)
- **Características:** Vibrante, energético, transmite urgência e ação

### 1.2 Cor Secundária — Roxo Elétrico/Violeta Vibrante
- **Código:** `#6A0DAD`
- **Uso Recomendado:**
  - Barras de navegação e seções principais
  - Bordas de cards e componentes
  - Destaques em textos secundários
  - Fundos de cartões específicos
  - Elementos que precisam diferenciação sem competir com o rosa
  - Botões de mídia social
  - Listras decorativas
  - Sombras padrão de cards
- **Características:** Profundo, rico, cria profundidade visual e hierarquia

### 1.3 Fundo Escuro — Azul Marinho/Quase Preto
- **Código:** `#1A1A2E`
- **Uso Recomendado:**
  - Fundo predominante do site/aplicação
  - Fundos de headers
  - Fundos de cards principais
  - Corpo principal de conteúdo
  - Seções de conteúdo específicas
  - Base para contraste com elementos vibrantes
- **Características:** Escuro, professional, reduz fadiga ocular, propicia alto contraste

### 1.4 Cor Neutra — Branco Puro
- **Código:** `#FFFFFF`
- **Uso Recomendado:**
  - Texto principal e títulos
  - Rótulos de botões
  - Todos os textos de alta importância
  - Iconografia padrão
  - Elementos que precisam máxima legibilidade
- **Características:** Alto contraste, máxima legibilidade, transmite clareza

### 1.5 Cor Neutra Secundária — Cinza Claro
- **Código:** `#C0C0C0`
- **Uso Recomendado:**
  - Textos secundários
  - Descrições menos importantes
  - Informações complementares
  - Detalhes menores em cards
  - Legendas
  - Ajuda a criar hierarquia visual
- **Características:** Legível porém subordinado ao texto branco

### 1.6 Variações de Cores

#### Transparência e Opacidade
- Roxo com opacidade 30%: `#6A0DAD/30` ou `rgba(106, 13, 173, 0.3)` — para sombras suaves
- Roxo com opacidade 50%: `#6A0DAD/50` ou `rgba(106, 13, 173, 0.5)` — para sombras mais pronunciadas
- Rosa com opacidade 80%: `#FF0066/80` — para hover em botões
- Magenta com opacidade 80%: `#C8008F/80` — para hover em botões

#### Cores Complementares Específicas
- **Magenta Forte:** `#C8008F` — usado em gradientes de botões ao lado de `#FF0066`

---

## 2. Componente: Botão Padrão

O botão é o componente mais utilizado na plataforma e possui um padrão visual bem definido.

### 2.1 Especificações Visuais

**Estrutura HTML/JSX:**
```jsx
<button className="bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-2 rounded-none transition-colors shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105">
  Texto do Botão
</button>
```

**Atributos de Estilo:**

| Atributo | Valor | Descrição |
|----------|-------|-----------|
| Background | `bg-gradient-to-r from-[#FF0066] to-[#C8008F]` | Gradiente diagonal rosa para magenta |
| Cor do Texto | `text-white` | Branco puro para máxima legibilidade |
| Fonte | `font-semibold` | Peso semibold para destaque |
| Padding Horizontal | `px-4` | 1rem de espaçamento esquerdo/direito |
| Padding Vertical | `py-2` | 0.5rem de espaçamento cima/baixo |
| Borda | `rounded-none` | **Crítico:** Bordas quadradas, sem arredondamento |
| Transição | `transition-colors` | Suavização de mudanças de cor |
| Sombra Base | `shadow-lg` | Sombra grande para elevação |
| Hover — Gradiente | `hover:from-[#FF0066]/80 hover:to-[#C8008F]/80` | Escurece o gradiente em 20% |
| Hover — Sombra | `hover:shadow-xl` | Aumenta sombra no hover |
| Hover — Escala | `hover:scale-105` | Aumenta 5% em todos os eixos |
| Hover — Transformação | `transform` | Habilita transformações 2D/3D |

### 2.2 Estados Visuais

#### Estado Padrão
- Gradiente claro (rosa → magenta)
- Sombra média
- Escala 1:1

#### Estado Hover
- Gradiente escurecido em 20%
- Sombra maior
- Escala 1.05 (5% maior)
- Transição suave

#### Estado Desabilitado
- Opacidade reduzida
- Cursor não-permitido
- Sem efeitos de hover
- Implementação: `disabled:opacity-50 disabled:cursor-not-allowed`

### 2.3 Variante Compacta (Secundária)

Para botões menores e menos chamativos (ex: "Mostrar Debug"), use:

```jsx
<button className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-1 rounded-md text-xs">
  Mostrar Debug
</button>
```

| Atributo | Valor | Diferença |
|----------|-------|-----------|
| Background | `bg-gray-500` | Sólido, não gradiente |
| Hover | `hover:bg-gray-600` | Escurece simples |
| Padding | `px-3 py-1` | Reduzido |
| Borda | `rounded-md` | Levemente arredondado |
| Tamanho Fonte | `text-xs` | Extra pequeno |

**Quando usar:**
- Ações secundárias
- Botões em modo debug/desenvolvedores
- Elementos menos críticos
- Contextos onde espaço é limitado

### 2.4 Botão com Efeito de Partículas (ParticleButton)

Componente avançado que exibe animação de partículas ao clicar.

**Características:**
- 23 partículas geradas ao clicar
- Animação de 1600ms (1.6s)
- Partículas saem do centro do botão em direções aleatórias
- Cor das partículas: `#FF0066` (rosa padrão)
- Escala e opacidade animadas

**Estrutura:**
```jsx
const ParticleButton = ({ children, onClick, className, variant = "default", size = "default", ...props }: ParticleButtonProps) => {
  const [showParticles, setShowParticles] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowParticles(true);
    if (onClick) onClick(e);
    setTimeout(() => setShowParticles(false), 1600);
  };

  // Renderiza partículas com motion.div
  // Cada partícula tem animação de scale, x, y com duração 1600ms
};
```

**Quando usar:**
- Ações de salvamento importante
- Confirmações de sucesso
- Ações que marcam conclusão
- Interações que demandam feedback visual acentuado

---

## 3. Componente: Card Padrão

Cards são contentores de informação com estilo consistente.

### 3.1 Especificações Visuais Base

**Classe Tailwind Padrão:**
```jsx
<div className="bg-[#1A1A2E] p-6 border-2 border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300">
  {/* Conteúdo do card */}
</div>
```

**Atributos:**

| Atributo | Valor | Descrição |
|----------|-------|-----------|
| Background | `bg-[#1A1A2E]` | Azul marinho escuro |
| Padding | `p-6` | 1.5rem em todos os lados |
| Borda | `border-2 border-[#6A0DAD]` | 2px roxo elétrico |
| Borda Raio | `rounded-none` | **Crítico:** Bordas quadradas |
| Sombra Base | `shadow-lg shadow-[#6A0DAD]/30` | Sombra grande com roxo a 30% |
| Sombra Hover | `hover:shadow-[#6A0DAD]/50` | Sombra roxo a 50% no hover |
| Transição | `transition-all duration-300` | 300ms de suavização em todas as mudanças |

### 3.2 Variante com Glassmorphism

Para efeito de vidro translúcido:

```jsx
<div className="bg-[#1A1A2E]/60 backdrop-blur-lg p-6 border border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30">
  {/* Conteúdo */}
</div>
```

**Atributos Adicionais:**
- `bg-[#1A1A2E]/60` — Fundo com 60% de opacidade (40% transparente)
- `backdrop-blur-lg` — Blur 12px no fundo
- `border` — 1px ao invés de 2px
- Cria efeito moderno e elegante

### 3.3 Estrutura Interna Típica de Card

```jsx
<div className="bg-[#1A1A2E] p-6 border-2 border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30">
  {/* Cabeçalho */}
  <div className="flex items-center gap-2 mb-4">
    <IconComponent className="text-[#FF0066]" size={24} />
    <h3 className="text-lg font-semibold text-white">{titulo}</h3>
  </div>
  
  {/* Conteúdo */}
  <div className="space-y-4">
    {/* Items do card */}
  </div>
</div>
```

### 3.4 Elevação Visual e Interação

**Estados:**

#### Padrão
- Sombra `shadow-lg shadow-[#6A0DAD]/30`
- Sem transformações

#### Hover
- Sombra `shadow-[#6A0DAD]/50` (mais intensa)
- Possível: `transform -translate-y-1` (elevação 4px)
- Possível: `scale-105` (5% maior)

**Exemplo Completo com Hover Avançado:**
```jsx
<motion.div
  whileHover={{ y: -8 }}
  className="bg-[#1A1A2E] p-6 border-2 border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300"
>
  {/* Conteúdo */}
</motion.div>
```

---

## 4. Componente: Toast (Notificação)

Toasts fornecem feedback visual rápido sobre ações do usuário.

### 4.1 Especificações Visuais

**Classe Tailwind Padrão:**
```jsx
className="bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg"
```

**Atributos:**

| Atributo | Valor | Descrição |
|----------|-------|-----------|
| Background | `bg-gradient-to-r from-[#6A0DAD] to-[#FF0066]` | Gradiente roxo para rosa |
| Borda | `border-none` | Remove borda padrão |
| Cor Texto | `text-white` | Branco puro |
| Borda Raio | `rounded-md` | Levemente arredondado (12px) |
| Sombra | `shadow-lg` | Sombra grande |

### 4.2 Implementação com Hook

```jsx
import { toast } from "@/hooks/use-toast";

const handleSave = () => {
  toast({
    title: "✅ Configurações salvas",
    description: "Suas alterações foram aplicadas com sucesso.",
    className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
    duration: 3000,
  });
};
```

### 4.3 Padrões de Uso

#### Sucesso
```jsx
toast({
  title: "✅ Ação concluída",
  description: "Descrição da ação bem-sucedida.",
  className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
  duration: 3000,
});
```

#### Erro
```jsx
toast({
  title: "❌ Erro ao processar",
  description: "Verifique os dados e tente novamente.",
  variant: "destructive",
  className: "bg-red-600 border-none text-white rounded-md shadow-lg",
  duration: 3000,
});
```

#### Informativo
```jsx
toast({
  title: "ℹ️ Informação",
  description: "Conteúdo informativo para o usuário.",
  className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
  duration: 3000,
});
```

### 4.4 Com Ícone e Estrutura Avançada

```jsx
import { Award } from "lucide-react";

toast({
  title: (
    <div className="flex items-center gap-2">
      <Award className="h-5 w-5" />
      Configurações salvas
    </div>
  ),
  description: "Todas as alterações foram persistidas com sucesso.",
  className: "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg",
  duration: 3000,
});
```

### 4.5 Helper Centralizado (Recomendado)

Criar arquivo `src/utils/epicToast.ts`:

```typescript
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";

const baseClass = "bg-gradient-to-r from-[#6A0DAD] to-[#FF0066] border-none text-white rounded-md shadow-lg";

function withTitle(icon: React.ReactNode, text: string) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );
}

export const epicToast = {
  success(message: string, description?: string) {
    toast({
      title: withTitle(<CheckCircle2 className="h-5 w-5" />, message),
      description,
      className: baseClass,
      duration: 3000,
    });
  },

  error(message: string, description?: string) {
    toast({
      title: withTitle(<XCircle className="h-5 w-5" />, message),
      description,
      className: "bg-red-600 border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
  },

  info(message: string, description?: string) {
    toast({
      title: withTitle(<Info className="h-5 w-5" />, message),
      description,
      className: baseClass,
      duration: 3000,
    });
  },

  warning(message: string, description?: string) {
    toast({
      title: withTitle(<AlertCircle className="h-5 w-5" />, message),
      description,
      className: "bg-yellow-600 border-none text-white rounded-md shadow-lg",
      duration: 3000,
    });
  },
};
```

**Uso:**
```jsx
import { epicToast } from "@/utils/epicToast";

epicToast.success("Salvo!", "Suas configurações foram aplicadas.");
epicToast.error("Erro", "Verifique os dados e tente novamente.");
epicToast.info("Info", "Informação importante para você.");
epicToast.warning("Aviso", "Ação requer atenção.");
```

### 4.6 Boas Práticas de Toast

- **Duração Padrão:** 3000ms (3 segundos)
- **Uma por Vez:** O sistema permite apenas um toast simultaneamente
- **Clareza:** Use frases curtas e diretas
- **Ícones:** Sempre use ícones para melhor compreensão visual
- **Posicionamento:** Canto inferior direito (padrão do Toaster)
- **Sem Persistência:** Nunca crie toasts que não desaparecem

---

## 5. Componente: Moving Border (Efeito Avançado)

Componente que cria borda animada que se move ao redor do elemento.

### 5.1 Características

- Borda que se move continuamente ao redor do perímetro
- Duração animável (padrão: 2000ms)
- SVG para traçado de caminho
- Motion.div para renderizar o elemento móvel
- Suporta raios customizados (rx, ry)

### 5.2 Implementação Básica

```jsx
import { Button, MovingBorder } from "@/components/ui/moving-border";

<Button as="button">
  <MovingBorder>
    <div className="h-20 w-20 opacity-[0.8] bg-[radial-gradient(var(--sky-500)_40%,transparent_60%)]" />
  </MovingBorder>
  Clique Aqui
</Button>
```

### 5.3 Props Disponíveis

**Button Props:**
- `borderRadius` — Raio da borda (padrão: "1.75rem")
- `containerClassName` — Classe adicional do container
- `borderClassName` — Classe do elemento da borda
- `duration` — Duração da animação em ms
- `as` — Elemento HTML a renderizar
- `className` — Classe do conteúdo

**MovingBorder Props:**
- `duration` — Duração em ms (padrão: 2000)
- `rx` — Raio X do SVG rect (ex: "30%")
- `ry` — Raio Y do SVG rect (ex: "30%")
- `children` — Elemento visual da borda

### 5.4 Quando Usar

- Botões premium ou especiais
- Elementos que demandam atenção constante
- Contextos de alta interatividade
- Apresentações e páginas de destaque
- **Não use em excesso:** Pode cansar visualmente

---

## 6. Tipografia e Fontes

A plataforma utiliza a fonte **Chakra Petch** como famiglia principal.

### 6.1 Tamanhos Recomendados

| Elemento | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| Título Principal | 28-32px | Bold (700) | `#FFFFFF` |
| Título Secundário | 20-24px | Semibold (600) | `#FFFFFF` |
| Título de Card | 18-20px | Semibold (600) | `#FFFFFF` |
| Texto Padrão | 16px | Regular (400) | `#FFFFFF` |
| Texto Secundário | 14-16px | Regular (400) | `#C0C0C0` |
| Label/Legenda | 12-14px | Regular (400) | `#C0C0C0` |
| Botão | 14-16px | Semibold (600) | `#FFFFFF` |

### 6.2 Hierarquia Visual em Tailwind

```jsx
{/* Título Principal */}
<h1 className="text-3xl font-bold text-white">Título Principal</h1>

{/* Título Secundário */}
<h2 className="text-2xl font-semibold text-white">Título Secundário</h2>

{/* Subtítulo */}
<h3 className="text-lg font-semibold text-white">Subtítulo</h3>

{/* Texto Padrão */}
<p className="text-base text-white">Texto padrão com informações importantes.</p>

{/* Texto Secundário */}
<p className="text-sm text-[#C0C0C0]">Texto secundário, menos importante.</p>

{/* Legenda */}
<span className="text-xs text-[#C0C0C0]">Legenda ou informação mínima.</span>
```

---

## 7. Ícones e Iconografia

### 7.1 Biblioteca Recomendada

- **Lucide React** — Ícones SVG modernos e consistentes
- Importação: `import { IconName } from 'lucide-react';`

### 7.2 Tamanhos Padrão

| Contexto | Tamanho | Classe |
|----------|---------|--------|
| Ícone em Botão | 16-20px | `h-4 w-4` ou `h-5 w-5` |
| Ícone em Card Header | 20-24px | `h-5 w-5` ou `h-6 w-6` |
| Ícone em Título | 24-32px | `h-6 w-6` ou `h-8 w-8` |
| Ícone Decorativo | 24-48px | `h-6 w-6` até `h-12 w-12` |

### 7.3 Cores de Ícones

| Contexto | Cor | Código |
|----------|-----|--------|
| Primário/Destaque | Rosa | `#FF0066` |
| Secundário | Roxo | `#6A0DAD` |
| Padrão/Neutro | Branco | `#FFFFFF` |
| Subordinado | Cinza | `#C0C0C0` |

**Exemplo:**
```jsx
import { Trophy, Settings, Menu } from 'lucide-react';

<Trophy className="h-5 w-5 text-[#FF0066]" />
<Settings className="h-6 w-6 text-[#6A0DAD]" />
<Menu className="h-4 w-4 text-white" />
```

---

## 8. Espaçamento e Layout

### 8.1 Escala de Espaçamento (Tailwind Default)

| Múltiplo | Pixels | Classe | Uso |
|----------|--------|--------|-----|
| 0.5 | 2px | `p-0.5`, `m-0.5` | Mínimo, raramente usado |
| 1 | 4px | `p-1`, `m-1` | Espaçamento aperto |
| 2 | 8px | `p-2`, `m-2` | Espaçamento compacto |
| 3 | 12px | `p-3`, `m-3` | Espaçamento padrão interno |
| 4 | 16px | `p-4`, `m-4` | Espaçamento comum |
| 6 | 24px | `p-6`, `m-6` | Espaçamento confortável em cards |
| 8 | 32px | `p-8`, `m-8` | Grandes seções |
| 12 | 48px | `p-12`, `m-12` | Seções muito grandes |

### 8.2 Padding em Cards

- **Padrão:** `p-6` (24px em todos os lados)
- **Compacto:** `p-4` (16px em todos os lados)
- **Espaçoso:** `p-8` (32px em todos os lados)

### 8.3 Gap (Espaçamento entre Itens)

```jsx
{/* Flex com espaçamento */}
<div className="flex items-center gap-2">Item 1</div>
<div className="flex items-center gap-3">Item 1</div>
<div className="flex items-center gap-4">Item 1</div>

{/* Grid */}
<div className="grid grid-cols-2 gap-4">Item 1</div>
<div className="grid grid-cols-3 gap-6">Item 1</div>
```

---

## 9. Sombras Padrão

### 9.1 Sombra em Cards (Padrão Principal)

```jsx
className="shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300"
```

**Componentes:**
- `shadow-lg` — Sombra grande (tamanho 0 4px 6px -1px)
- `shadow-[#6A0DAD]/30` — Cor roxo com 30% de opacidade
- `hover:shadow-[#6A0DAD]/50` — Aumenta opacidade para 50% ao hover
- `transition-all duration-300` — Transição suave de 300ms

### 9.2 Sombra em Botões

```jsx
className="shadow-lg hover:shadow-xl"
```

**Componentes:**
- `shadow-lg` — Sombra grande
- `hover:shadow-xl` — Sombra extra grande no hover

### 9.3 Sem Sombra (Quando Necessário)

```jsx
className="shadow-none"
```

---

## 10. Transições e Animações

### 10.1 Transições CSS Tailwind

**Sintaxe Básica:**
```jsx
className="transition-all duration-300"
className="transition-colors duration-200"
className="transition-opacity duration-500"
```

**Durações Comuns:**
- `duration-75` — 75ms (rápido, interações imediatas)
- `duration-100` — 100ms (rápido, feedback rápido)
- `duration-200` — 200ms (padrão para hover)
- `duration-300` — 300ms (padrão para cards e efeitos)
- `duration-500` — 500ms (mais lento, animações notáveis)

### 10.2 Uso com Framer Motion


---

## 10.4 Efeito Nebuloso de Fundo (Living Nebula Shader)

### Descrição
Efeito visual avançado utilizado no header e backgrounds principais, criando uma nebulosa animada e interativa com WebGL/Three.js. O shader simula nuvens cósmicas coloridas, com fluxo dinâmico e interação com o mouse, trazendo profundidade e atmosfera sci-fi para a interface.

### Características
- Renderização via Three.js (WebGL)
- Fragment shader customizado (GLSL) para nuvens e gases
- Cores predominantes: roxo, magenta, azul profundo (`vec3(0.8,0.2,0.5)`, `vec3(0.2,0.3,0.9)`, `vec3(0.0,0.0,0.05)`)
- Interação: o mouse deforma e "puxa" a nebulosa
- Responsivo: ocupa todo o viewport, z-index negativo
- Performance: animação contínua, otimizada para desktop

### Implementação Básica
```jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const LivingNebulaShader = () => {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    // ...ver código completo em dashi-touch/def-estilo/dashiefects/efect-header.md
    // 1) Renderer, Scene, Camera, Clock
    // 2) Vertex/Fragment Shader (GLSL)
    // 3) Mesh + Uniforms (iTime, iResolution, iMouse)
    // 4) Resize e Mouse Handler
    // 5) Animation Loop
    // 6) Cleanup
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }} />
  );
};
```

#### Fragment Shader (GLSL) — Principais Trechos
```glsl
// ... dentro do fragmentShader
vec3 deepSpace  = vec3(0.0, 0.0, 0.05);
vec3 gasColor1  = vec3(0.8, 0.2, 0.5); // magenta/rosa
vec3 gasColor2  = vec3(0.2, 0.3, 0.9); // azul
color = mix(color, gasColor1, smoothstep(0.4, 0.6, c1));
color = mix(color, gasColor2, smoothstep(0.5, 0.7, c2) * 0.5);
gl_FragColor = vec4(color, 1.0);
```

#### Dicas de Uso
- Use como `<LivingNebulaShader />` no topo do app/layout
- Garanta que o container tenha `z-index: -1` e `pointer-events: none`
- O efeito é visualmente marcante, ideal para headers, backgrounds hero, ou splash screens

---

## 10.5 Card Hover 3D com Gradiente e Glow

### Descrição
Card interativo com efeito 3D realista, gradientes, brilhos e overlays, utilizado para destaques, vitrines e seções premium. O efeito responde ao movimento do mouse, criando rotação sutil, reflexos, brilhos coloridos e bordas iluminadas.

### Características
- Implementado com React + Framer Motion
- Gradiente de fundo escuro (`#0e131f`), bordas arredondadas (`rounded-[32px]`)
- Efeito 3D: rotação X/Y conforme mouse
- Overlays: reflexo de vidro, textura de ruído, "smudge" digital
- Glows: radial roxo/azul na base, borda inferior iluminada
- Conteúdo centralizado, ícone destacado, título e descrição

### Implementação Básica
```jsx
import { GradientCard } from '.../dashiefects/cardhover';

<GradientCard />
```

#### Principais Trechos JSX
```jsx
<motion.div
  ref={cardRef}
  className="relative rounded-[32px] overflow-hidden"
  style={{ width: 360, height: 450, backgroundColor: '#0e131f', boxShadow: '0 -10px 100px 10px rgba(78,99,255,0.25), 0 0 10px 0 rgba(0,0,0,0.5)' }}
  animate={{ rotateX: rotation.x, rotateY: rotation.y }}
  ...
>
  {/* Overlay de vidro */}
  <motion.div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, ...)' }} />
  {/* Glow radial roxo/azul */}
  <motion.div style={{ background: 'radial-gradient(ellipse at bottom right, rgba(172,92,255,0.7) -10%, ...)' }} />
  {/* Conteúdo: ícone, título, descrição, link */}
</motion.div>
```

#### Paleta e Efeitos
- Fundo: `#0e131f` (preto azulado)
- Glow roxo: `rgba(172,92,255,0.7)`
- Glow azul: `rgba(56,189,248,0.7)`
- Reflexo: `rgba(255,255,255,0.08)`
- Borda inferior: gradiente branco translúcido
- Textos: branco puro, cinza claro

#### Dicas de Uso
- Ideal para vitrines, destaques, onboarding, cards premium
- Não usar em excesso (efeito visual forte)
- Ajuste o tamanho conforme o contexto

---

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Conteúdo animado
</motion.div>
```

### 10.3 Efeito de Hover Elevação

```jsx
<motion.div
  whileHover={{ y: -8 }}
  className="..." 
>
  Elemento elevado no hover
</motion.div>
```

---

## 11. Responsive Design

### 11.1 Breakpoints Tailwind

| Prefixo | Mínimo | Máximo |
|---------|--------|--------|
| (nenhum) | 0px | ∞ |
| `sm:` | 640px | ∞ |
| `md:` | 768px | ∞ |
| `lg:` | 1024px | ∞ |
| `xl:` | 1280px | ∞ |
| `2xl:` | 1536px | ∞ |

### 11.2 Exemplos de Uso

```jsx
{/* Flex direção */}
<div className="flex flex-col md:flex-row gap-4">
  Seção 1
</div>

{/* Grid colunas */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Card 1
</div>

{/* Texto */}
<p className="text-base md:text-lg lg:text-xl">
  Texto responsivo
</p>

{/* Padding */}
<div className="p-4 md:p-6 lg:p-8">
  Conteúdo
</div>
```

---

## 12. Estados e Estados Visuais

### 12.1 Estados de Botão

#### Padrão
- Gradiente `from-[#FF0066] to-[#C8008F]`
- Sem transformações

#### Hover
- Gradiente `from-[#FF0066]/80 to-[#C8008F]/80`
- Sombra aumentada
- Escala 1.05

#### Active/Pressed
```jsx
className="active:scale-95 active:shadow-md"
```
- Escala 0.95 (5% menor)
- Sombra reduzida

#### Desabilitado
```jsx
className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:from-[#FF0066] disabled:hover:to-[#C8008F]"
```
- Opacidade 50%
- Cursor não-permitido
- Remove efeitos de hover

### 12.2 Estados de Card

#### Padrão
- Borda 2px roxo
- Sombra roxo 30%

#### Hover
- Sombra roxo 50%
- Possível elevação (-8px)

#### Ativo/Selecionado
```jsx
className="border-[#FF0066] shadow-[#FF0066]/50"
```
- Borda rosa
- Sombra rosa

### 12.3 Estados de Input

```jsx
<input 
  className="border-[#6A0DAD] focus:border-[#FF0066] bg-[#1A1A2E]/60 text-white focus:ring-2 focus:ring-[#FF0066]/50"
/>
```

**Componentes:**
- Borda padrão: roxo
- Borda focus: rosa
- Ring focus: roxo com 50% opacidade

---

## 13. Checklist de Implementação

Ao criar novos componentes ou páginas, verifique:

- [ ] **Cores:** Utilizando apenas as cores da paleta definida
- [ ] **Botões:** Seguindo padrão gradiente com bordas quadradas
- [ ] **Cards:** Com borda roxo 2px e sombra padrão
- [ ] **Typography:** Hierarquia clara com pesos e tamanhos corretos
- [ ] **Ícones:** Tamanhos apropriados e cores consistentes
- [ ] **Espaçamento:** Usando escala de Tailwind (4px base)
- [ ] **Sombras:** Cards com `shadow-[#6A0DAD]/30` padrão
- [ ] **Transições:** Suaves e com durações apropriadas
- [ ] **Toasts:** Usando gradiente roxo→rosa com 3s duração
- [ ] **Responsivo:** Testado em móvel, tablet, desktop
- [ ] **Acessibilidade:** Contraste suficiente, estados visuais claros
- [ ] **Sem arredondamento:** Cards e botões principais com `rounded-none`

---

## 14. Exemplos Práticos Completos

### 14.1 Página com Seção, Cards e Botões

```jsx
export function ExemploSecao() {
  return (
    <main className="container mx-auto px-6 py-8 space-y-8">
      {/* Cabeçalho */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-2">Título da Página</h1>
        <p className="text-muted-foreground">Descrição da página</p>
      </section>

      {/* Grid de Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#1A1A2E] p-6 border-2 border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-[#FF0066]" />
            <h3 className="text-lg font-semibold text-white">Card 1</h3>
          </div>
          <p className="text-[#C0C0C0] mb-4">Descrição do card.</p>
          <button className="bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-2 rounded-none shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105 transition-all">
            Ação
          </button>
        </div>
        {/* Mais cards... */}
      </section>
    </main>
  );
}
```

### 14.2 Componente com Toast

```jsx
import { epicToast } from "@/utils/epicToast";

export function ComponenteComSalvar() {
  const handleSave = () => {
    try {
      // Lógica de salvar
      epicToast.success("Salvo!", "Dados persistidos com sucesso.");
    } catch (error) {
      epicToast.error("Erro", "Falha ao salvar dados.");
    }
  };

  return (
    <button 
      onClick={handleSave}
      className="bg-gradient-to-r from-[#FF0066] to-[#C8008F] text-white font-semibold px-4 py-2 rounded-none shadow-lg hover:from-[#FF0066]/80 hover:to-[#C8008F]/80 hover:shadow-xl transform hover:scale-105"
    >
      Salvar
    </button>
  );
}
```

---

## 15. Notas Importantes e Restrições

### 15.1 Sempre Respeite

- **Bordas quadradas:** Use `rounded-none` em botões e cards principais
- **Paleta de cores:** Apenas as 5 cores principais definidas
- **Borda de cards:** 2px roxo `border-[#6A0DAD]`
- **Sombra padrão:** `shadow-lg shadow-[#6A0DAD]/30` em cards
- **Transições:** Nunca remova `transition-all duration-300`
- **Duração de toast:** Sempre 3000ms (3 segundos)

### 15.2 Nunca Faça

- ❌ Usar cores fora da paleta definida
- ❌ Arredondar bordas em botões/cards principais
- ❌ Remover sombras do design padrão
- ❌ Usar transições muito rápidas (<100ms) ou muito lentas (>1000ms)
- ❌ Mudar o gradiente dos botões
- ❌ Toasts sem duração definida
- ❌ Utilizar múltiplos toasts simultâneos

### 15.3 Consistência em Toda a Aplicação

Todo componente novo deve seguir rigorosamente os padrões definidos aqui. A consistência visual é a marca registrada do design EPIC Space.

---

## 16. Conclusão

Este documento é a fonte de verdade para todos os estilos, componentes e padrões visuais da plataforma EPIC Space. Qualquer desenvolvedor consultando apenas este documento deve ser capaz de:

1. Criar botões, cards e componentes visuais idênticos ao original
2. Implementar toasts e feedback visual consistente
3. Manter a hierarquia tipográfica apropriada
4. Aplicar transições e animações conforme padrão
5. Garantir responsividade em todos os dispositivos
6. Criar uma experiência visual coesa e profissional

**Mantenha-o sempre atualizado** quando novos padrões ou componentes forem adicionados ao sistema.
