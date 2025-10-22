# LoginPage.tsx — Documentação Estruturada

## Visão Geral
A página `LoginPage.tsx` é responsável por exibir a interface de autenticação do sistema EPIC Space. Ela utiliza React, hooks de estado, contexto de autenticação e navegação do React Router. O layout é centralizado, com efeito visual de fundo animado, overlay translúcido e um card de login com campos de entrada, checkbox, links e botões estilizados.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Estrutura Visual e Componentes
- **Fundo animado:** Componente `LivingNebulaShader` ocupa todo o fundo da tela, com overlay preto translúcido para contraste.
- **Card de login:** Centralizado, com bordas arredondadas, sombra, blur e transparência.
  - **Logo:** Imagem `/LOGOEPIC.png` centralizada, dentro de um container com gradiente e borda.
  - **Título:** "Bem-vindo ao EPIC Space" (CardTitle).
  - **Descrição:** "Faça login para acessar sua conta" (CardDescription).
  - **Formulário:**
    - **Input de e-mail:** Campo obrigatório, label "E-mail", placeholder "seu@email.com".
    - **Input de senha:** Campo obrigatório, label "Senha", placeholder "••••••••".
    - **Checkbox lembrar-me:** Label "Lembrar-me".
    - **Link 'Esqueceu sua senha?':** Navega para `/`.
    - **Botão 'Entrar':** Ocupa toda a largura, gradiente, exibe loader animado (`Loader2`) e texto "Entrando..." se `isLoading` for true.
    - **Mensagem 'Não tem uma conta? Cadastre-se':** Link para `/`.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Fluxos e Lógica
- **Redirecionamento automático:** Se o usuário já estiver autenticado (`isAuthenticated`), redireciona para `/dashboard` via `useEffect`.
- **Login:**
  - Ao submeter o formulário, executa `login(email, password)` do contexto de autenticação.
  - Se o login for bem-sucedido (`response.success`), redireciona para `/dashboard`.
  - O botão "Entrar" fica desabilitado e exibe loader enquanto `isLoading` for true.
- **Lembrar-me:** Checkbox controla o estado `rememberMe` (não há lógica de persistência visível neste componente).
- **Links:**
  - "Esqueceu sua senha?" e "Cadastre-se" navegam para `/` (página inicial ou de cadastro).

## Estados e Hooks
- `email` (string): valor do campo de e-mail.
- `password` (string): valor do campo de senha.
- `rememberMe` (boolean): controla o checkbox "Lembrar-me".
- `isAuthenticated` (do contexto): indica se o usuário está autenticado.
- `isLoading` (do contexto): indica se o login está em andamento.
- `login` (função do contexto): executa a autenticação.
- `navigate` (hook do React Router): navegação programática.

## Funções e Eventos
- `handleLogin(e)`: Previne submit padrão, chama `login(email, password)`, redireciona se sucesso.
- `useEffect`: Observa `isAuthenticated` e redireciona para `/dashboard` se true.
- `onChange` dos inputs: Atualiza estados locais de e-mail, senha e lembrar-me.

## Checklist de Elementos e Fluxos
- [x] Fundo animado com shader
- [x] Overlay translúcido
- [x] Card centralizado com logo, título e descrição
- [x] Formulário com inputs controlados (e-mail, senha)
- [x] Checkbox "Lembrar-me"
- [x] Link "Esqueceu sua senha?"
- [x] Botão "Entrar" com loader
- [x] Mensagem e link para cadastro
- [x] Redirecionamento automático se autenticado
- [x] Integração com contexto de autenticação

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

---

> Esta documentação detalha todos os elementos, fluxos, estados e comportamentos da página `LoginPage.tsx` para permitir a reprodução fiel da tela, conforme implementado no sistema original.
