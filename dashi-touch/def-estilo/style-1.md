a paleta de cores principal sera:


#FF0066 (Um Rosa Vibrante / Magenta Fluorescente):
Onde usar: Esta é a cor de destaque principal. É usada para títulos grandes, botões de ação (como "COMECE AGORA"), e para criar contraste e chamar a atenção para seções importantes. Perfeita para elementos que precisam saltar à vista e transmitir energia.
#1A1A2E (Um Azul Marinho Escuro / Quase Preto):
Onde usar: Esta é a cor de fundo predominante do site. Funciona bem como base para o conteúdo, proporcionando um contraste forte com o rosa vibrante e o roxo. Ideal para o fundo do cabeçalho, corpo principal do site e seções de conteúdo.
#6A0DAD (Um Roxo Elétrico / Violeta Vibrante):
Onde usar: Usado para barras de navegação (como a barra roxa no topo com os botões "Economia Criativa", "Pessoal", etc.), destaques em textos secundários, fundos de cartões ou seções específicas que precisam de um toque de cor sem competir com o rosa principal. Também aparece nos botões de mídia social e na "onda" de listras roxas.
#FFFFFF (Branco Puro):
Onde usar: Usado principalmente para texto. Garante alta legibilidade contra os fundos escuros (#1A1A2E e #6A0DAD). Aparece em todos os textos principais, títulos, e nos rótulos dos botões.
#C0C0C0 (Cinza Claro):
Onde usar: Pode ser usado para textos secundários ou menos importantes, como descrições mais longas em cartões ou detalhes menores. Ajuda a criar uma hierarquia visual onde o texto branco é o mais importante e o cinza é informativo, mas não prioritário. (Exemplo: o texto de descrição sob os títulos nos cards de notícias).

---

## Diretrizes de Estilo para Cards

### Configuração Visual Geral
- **Fundo**: Utilizar a cor `#1A1A2E` (Azul Marinho Escuro) como cor de fundo principal dos cards para manter consistência com o layout geral da aplicação
- **Transparência**: Em alguns casos específicos, pode-se utilizar um efeito glassmorphism com `backdrop-filter: blur(10px)` e opacidade de 20% para criar profundidade visual

### Borda
- **Espessura**: 1px para bordas padrão
- **Estilo**: Sólida (solid)
- **Cor**: Utilizar `#6A0DAD` (Roxo Elétrico) ou uma variação mais clara/desaturada quando necessário para diferenciação
- **Raio de Borda**: 12px para cantos arredondados, proporcionando um visual moderno e suave

### Tipografia (Fonte)
- **Família**: Chakra Petch (a fonte principal do sistema)
- **Tamanhos**:
  - Título: 18-20px (negrito)
  - Subtítulo: 16px (semibold)
  - Texto secundário: 14-16px (regular)
  - Descrições: 12-14px (regular)
- **Cores**:
  - Textos principais: `#FFFFFF` (Branco Puro)
  - Textos secundários: `#C0C0C0` (Cinza Claro)

### Ícones
- **Cor**: Devem seguir a paleta de cores definida - `#FF0066` para destaques, `#FFFFFF` para ícones padrão, `#6A0DAD` para ações secundárias
- **Tamanho**: 20-24px para ícones principais, 16-18px para ícones secundários
- **Estilo**: Preferencialmente em formato SVG para melhor escalabilidade e consistência

### Efeitos Visuais Adicionais

### Efeito de Sombra Padronizado (Tailwind)
- **Classe padrão para todos os cards:**
  - `shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300`
- **Quando usar:**
  - Todos os cards principais da interface (perfil, tarefas, estatísticas, conquistas, histórico, etc.)
  - Garante consistência visual, profundidade e destaque sutil sem poluir o layout
- **Justificativa:**
  - O uso do roxo elétrico na sombra reforça a identidade visual do sistema
  - O efeito hover cria uma sensação de interação moderna e responsiva
- **Exemplo de uso:**
  ```jsx
  <Card className="bg-[#1A1A2E] border border-[#6A0DAD] rounded-none shadow-lg shadow-[#6A0DAD]/30 hover:shadow-[#6A0DAD]/50 transition-all duration-300">
    ...
  </Card>
  ```

**Nunca utilizar cantos arredondados em cards, exceto se explicitamente solicitado pelo design.**