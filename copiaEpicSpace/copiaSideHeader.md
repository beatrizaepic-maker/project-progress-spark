# SideBar Lateral e Header (Navigation) — Documentação de Reprodução Detalhada

Este documento descreve, em detalhes extensos e passo a passo, a implementação do SideBar lateral e do Header (Navigation) usados no sistema EPIC Space, incluindo o efeito nebuloso (LivingNebulaShader). O objetivo é permitir que qualquer desenvolvedor que leia apenas este documento consiga reproduzir fielmente a interface (estrutura, estilos, comportamento, animações, e cores).

ALERTA IMPORTANTE: NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.

---

## Sumário
- Visão Geral
- Paleta de Cores e Variáveis CSS
- Estrutura do Header (Navigation)
  - Marcação e Layout
  - Componente LivingNebulaShader (efeito nebuloso)
  - Menu do Usuário e Modal de Perfil
  - Acessibilidade e comportamentos
- Estrutura do SideBar (Sidebar e Provider)
  - Provider e Contexto
  - Variantes (floating, inset) e colapsabilidade
  - Itens do Menu, Badges, Submenus, Ações
  - Comportamentos (teclado, mobile, cookies)
- CSS e Utilitários (glass, gradientes, classes utilitárias)
- Passo a Passo para Recriação
- Código de exemplo (trechos essenciais)
- Checklist de QA e Acessibilidade

---

## Visão Geral
O Header (Navigation) e o SideBar lateral formam o esqueleto de navegação da aplicação. O Header é fixo no topo, contém o logo, o efeito nebuloso de fundo produzido por um shader WebGL (Three.js) e o menu do usuário. O SideBar utiliza um provedor de estado para gerenciar seu estado (expandido/colapsado), suporta mobile com um Sheet (off-canvas), e permite três modos de colapsabilidade: `offcanvas`, `icon`, `none`.

Ambos utilizam a paleta de cores definida no design system (rosa vibrante, roxo elétrico, azul marinho escuro, branco, cinza claro), variáveis CSS HSL e utilitários Tailwind.

**IMPORTANTE:** O efeito nebuloso (LivingNebulaShader) é renderizado por Three.js como um plano full-screen com um ShaderMaterial customizado (vertex + fragment shader). Ele é transparente e utiliza blending aditivo para criar brilho.

---

## Paleta de Cores e Variáveis CSS

As cores base e variáveis estão definidas em `src/index.css` dentro do `:root`. Utilize HSL para maior consistência. As variáveis principais:

- --background: 240 47% 14%  (hex #1A1A2E)
- --foreground: 0 0% 100%     (hex #FFFFFF)
- --primary: 330 100% 50%     (hex #FF0066)
- --secondary: 270 91% 36%    (hex #6A0DAD)
- --sidebar-background: 240 47% 14% (hex #1A1A2E)
- --sidebar-foreground: 0 0% 100%    (hex #FFFFFF)
- --sidebar-accent: 270 91% 36%      (hex #6A0DAD)
- --sidebar-primary: 330 100% 50%    (hex #FF0066)

Gradientes predefinidos:
- --gradient-primary: linear-gradient(135deg, hsl(330 100% 50%), hsl(270 91% 36%))
- .gradient-primary class: background: linear-gradient(135deg, #FF0066, #6A0DAD)

Sombras e transições também estão padronizadas, por exemplo `--shadow-card` e `--shadow-card-hover`.

---

## Header (Navigation)

### Marcação e Layout
- O header é um elemento `nav` fixo no topo: `position: fixed; top: 0; left: 0; right: 0; z-index: 50`.
- Estrutura interna:
  - Container central (`.container`) com `px-6` e `relative z-10` para sobrepor o shader.
  - Div com `flex items-center justify-between` com duas colunas:
    - Esquerda: logo (`LOGOEPIC.png`) + texto do título com classe `ethnocentric-header`.
    - Direita: Menu do usuário (DropdownMenu com avatar/button).
- O header aplica a classe `glass` para o efeito de glassmorphism (backdrop blur, leve transparência, borda sutil): `.glass { backdrop-blur-md; bg-white/10 (dark: black/10); border: white/20 }`.

### LivingNebulaShader (efeito nebuloso)
- Componente React que usa `three.js` para renderizar um fragment shader procedural.
- É posicionado em `absolute` e `pointer-events: none` dentro do header/container para que não interfira nos eventos do DOM.
- Principais características do shader:
  - Vertex shader simples (projecta plano)
  - Fragment shader com funções `random`, `noise`, `fbm` e mistura de camadas para criar uma nebulosa fluida
  - Uniformes: `iResolution` (vec2), `iTime` (float), `iMouse` (vec2)
  - Entrada do mouse mapeada para `iMouse` para interação de proximidade (warp around mouse)
  - Uso de `AdditiveBlending` e `transparent: true` para brilho
  - Cores principais dentro do shader (em RGB): azul claro, roxo/rosa, cyan e mistura com `glow` multiplicativa
- O shader é otimizado com `renderer.setPixelRatio(window.devicePixelRatio)` e escuta `resize` para manter resolução correta.
- Implementação principal encontrada em `src/components/effects/LivingNebulaShader.tsx`.

### Menu do Usuário e Modal
- O menu utiliza um `DropdownMenu` com `DropdownMenuTrigger` e `DropdownMenuContent`.
- Itens: "Editar Perfil" (que abre `ProfileEditModal` se `shiftKey` estiver pressionado, ou navega para `/profile/current`) e "Sair" que chama `logout()`.
- Ícones do conjunto `lucide-react` (User, Settings, LogOut).

### Acessibilidade e Comportamentos
- O header inclui `aria-labels` e estrutura semântica (`nav`).
- O `LivingNebulaShader` possui `aria-label="Living Nebula animated background"` para clareza.
- O menu de usuário é acessível via teclado (Radix DropdownMenu fornece rotação adequada) e os botões têm `sr-only` labels quando necessário.

---

## SideBar (Sidebar e Provider)

### Provider e Contexto
- `SidebarProvider` encapsula o estado do sidebar (expandido/colapsado, mobile open) e fornece funções para alternar (`toggleSidebar`).
- Usa hook `useIsMobile()` para comportar-se diferente no mobile (abre um `Sheet` modal/off-canvas) e registra um cookie `sidebar:state` para persistir a preferência por 7 dias.
- Adiciona atalho de teclado (Ctrl/Cmd + B) para alternar o sidebar.

### Estrutura do componente `Sidebar` (Desktop)
- Suporta `side` (left/right), `variant` (`sidebar` | `floating` | `inset`) e `collapsible` (`offcanvas` | `icon` | `none`).
- Desktop: renderiza um `div` fixo com `inset-y-0`, largura `--sidebar-width` (16rem) e classes que mudam conforme `data-state` e `data-collapsible`.
- Tem um rail invisível clicável para alternar (`SidebarRail`) e um `SidebarTrigger` que chama `toggleSidebar()`.

### Variantes e comportamento
- `collapsible=offcanvas`: largura vai a 0, sidebar é escondida e pode ser exibida como off-canvas.
- `collapsible=icon`: reduz a largura para `--sidebar-width-icon` (3rem) mostrando apenas ícones.
- `variant=floating` e `variant=inset` alteram border/padding/radius e aplicam shadow para efeito flutuante / com borda arredondada.
- Mobile: utiliza `Sheet`/`SheetContent` com `--sidebar-width-mobile` (18rem) para aparência off-canvas full height.

### Itens do Menu
- `SidebarMenu` é a lista de itens, cada `SidebarMenuButton` é um botão que aplica variantes visuais (default/outline) e tamanhos (sm/default/lg).
- `SidebarMenuAction` é um botão contextual posicionado à direita do item, escondido em modos colapsados.
- `SidebarMenuBadge` exibe um contador ou badge e é posicionado à direita, oculto em colapsado.
- Submenus: `SidebarMenuSub` renderiza `SidebarMenuSubButton` com indentação, e um border-left.
- Skeletons são usados para carregamento (linha aleatória de largura entre 50% e 90%).

### Acessibilidade e UX
- Itens possuem `data-active` e `data-state=open` para controlar estado visual e aria.
- `Tooltip` é usado para mostrar labels quando `state = collapsed` e `isMobile = false`.
- `SidebarInput` aplica `focus-visible:ring-2` com `--sidebar-ring` (rosa) ao foco.

### Cookies e Atalhos
- `SIDEBAR_COOKIE_NAME = 'sidebar:state'` e `SIDEBAR_COOKIE_MAX_AGE = 60*60*24*7` são usados para persistência local das preferências.
- Tecla de atalho `Ctrl/Cmd + B` alterna o sidebar.

---

## CSS e Utilitários Relevantes
- Classes utilitárias específicas para o projeto (arquivo `src/index.css`, `@layer utilities`):
  - `.glass`, `.glass-card`, `.glass-hover` — utilitários de glassmorphism e hover
  - `.gradient-primary`, `.gradient-secondary`, `.gradient-accent` — gradientes oficiais
  - Cores utilitárias: `.bg-vibrant-pink`, `.bg-dark-navy`, `.bg-electric-purple`, `.text-vibrant-pink`, etc.
  - `.text-shadow` para textos com leve sombra
  - `.font-chakra` para aplicar a fonte Chakra Petch

- Variáveis CSS definidas em `:root` garantem consistência entre componentes e temas (escuro/clear mantém as mesmas paletas neste projeto).

---

## Passo a Passo para Recriação

1. Instalar dependências: `three`, `framer-motion`, `lucide-react`, `@radix-ui/*` (ou componentes UI equivalentes), `class-variance-authority`.
2. Definir variáveis em `index.css` (copiar as variáveis `:root` e utilitários `@layer utilities` listados acima).
3. Criar `LivingNebulaShader.tsx` com o código de Three.js descrito (ver seção Código de Exemplo).
4. Implementar `Navigation.tsx` com a estrutura fixa do header, incluir `LivingNebulaShader` como primeiro elemento dentro do `nav` (posição absolute, pointer-events none) e o container com `relative z-10` para conteúdo.
5. Implementar `SidebarProvider` e `Sidebar` com o contexto e props (ver seção Componentes). Garanta que `SIDEBAR_COOKIE_NAME` seja escrito ao alterar o estado.
6. Utilizar utilitários `glass` e `gradient-primary` nas classes do header e botões.
7. Testar interação mouse sobre o shader — `iMouse` deve ser atualizado por `mousemove` e gerar warp/local distortion.
8. Testar responsividade no mobile (usar `Sheet` para off-canvas) e atalho `Ctrl/Cmd+B`.

---

## Código de Exemplo (trechos essências)

### LivingNebulaShader (JSX + Shader)

```tsx
// ... Trecho reduzido do file LivingNebulaShader.tsx (ver repositório para versão completa)
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const LivingNebulaShader = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    const vertexShader = `void main(){ gl_Position = vec4(position,1.0); }`;
    const fragmentShader = `/* shader code with fbm, noise, mouse warping — see original */`;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: { value: new THREE.Vector2(-100,-100) }
    };

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const onResize = () => { const w = container.clientWidth; const h = container.clientHeight; renderer.setSize(w, h); uniforms.iResolution.value.set(w, h); };
    window.addEventListener('resize', onResize);
    onResize();

    const onMouseMove = (e: MouseEvent) => { const rect = container.getBoundingClientRect(); const x = e.clientX - rect.left; const y = container.clientHeight - (e.clientY - rect.top); uniforms.iMouse.value.set(x, y); };
    window.addEventListener('mousemove', onMouseMove);

    renderer.setAnimationLoop(() => { uniforms.iTime.value = clock.getElapsedTime(); renderer.render(scene, camera); });

    return () => { window.removeEventListener('resize', onResize); window.removeEventListener('mousemove', onMouseMove); renderer.setAnimationLoop(null); material.dispose(); mesh.geometry.dispose(); renderer.dispose(); };
  }, []);

  return <div ref={containerRef} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:-1,pointerEvents:'none'}} aria-label="Living Nebula animated background" />;
};

export default LivingNebulaShader;
```

### Header (simplificado)

```tsx
<nav className="fixed top-0 left-0 right-0 z-50 glass overflow-hidden">
  <LivingNebulaShader />
  <div className="container mx-auto px-6 relative z-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2 py-4">
        <img src="/LOGOEPIC.png" alt="Epic Logo" className="h-10 w-10 drop-shadow-sm" />
        <span className="font-bold text-2xl text-foreground text-shadow ethnocentric-header">EPIC Space</span>
      </div>
      <div className="flex items-center space-x-4"> /* Menu do usuário */ </div>
    </div>
  </div>
</nav>
```

### Sidebar: Provider e uso básico

```tsx
<SidebarProvider defaultOpen>
  <Sidebar collapsible="icon" variant="sidebar">
    <SidebarHeader> ... </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>Dashboard</SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
    <SidebarFooter> ... </SidebarFooter>
  </Sidebar>
  <SidebarInset> /* main content */ </SidebarInset>
</SidebarProvider>
```

---

## Checklist de QA e Acessibilidade
- [ ] Header é `role="navigation"` e possui `aria-label` se necessário
- [ ] Shader possui `aria-hidden="true"`/`aria-label` apropriado e `pointer-events: none`
- [ ] Dropdown do usuário acessível por teclado
- [ ] Atalho `Ctrl/Cmd+B` alterna o sidebar
- [ ] Tooltip aparece quando sidebar está colapsado e não no mobile
- [ ] Cores verificadas para contraste (WCAG AA) — texto branco sobre #1A1A2E é adequado
- [ ] Teste no mobile: `Sheet` abre corretamente e fecha ao tocar fora

---

## Observações Finais
- O shader é sensível a performance — use `renderer.setPixelRatio` apenas quando necessário, e considere `performance` ou `prefers-reduced-motion` para reduzir ou desabilitar a animação em dispositivos limitados.
- Mantenha as variáveis CSS como fonte de verdade para garantir consistência de cores entre Header e Sidebar.
- Para replicar fielmente, copie os shaders e classes utilitárias sem modificações substanciais.

---

> Arquivo gerado automaticamente a partir do código fonte do repositório. Use este documento como referência principal para reprodução do Header e SideBar da aplicação EPIC Space.
