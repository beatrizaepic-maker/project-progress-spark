# NotFound.tsx — Documentação Estruturada

## Visão Geral
A página `NotFound.tsx` é responsável por exibir a interface de erro 404 quando o usuário tenta acessar uma rota inexistente no sistema EPIC Space. Ela utiliza React, hooks e estilização utilitária para centralizar a mensagem de erro e fornecer um link de retorno à página inicial.

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Estrutura Visual e Componentes
- **Container principal:** `div` ocupa toda a altura da tela (`min-h-screen`), centraliza o conteúdo tanto vertical quanto horizontalmente (`flex items-center justify-center`), com fundo padrão (`bg-background`).
- **Conteúdo centralizado:**
  - **Título 404:** `h1` grande, negrito, com espaçamento inferior (`text-4xl font-bold mb-4`).
  - **Mensagem de erro:** `p` com texto "Oops! Page not found", cor cinza e espaçamento inferior (`text-xl text-gray-600 mb-4`).
  - **Link de retorno:** `a` estilizado em azul, com efeito hover e sublinhado, redireciona para `/` (página inicial).

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

## Fluxos e Lógica
- **Detecção de rota inválida:**
  - Utiliza o hook `useLocation` do React Router para obter a rota acessada.
  - No `useEffect`, registra no console um erro 404 detalhado, incluindo o caminho tentado pelo usuário.
- **Exibição da interface:**
  - Sempre exibe a mensagem 404, independente do estado do usuário.
  - O link "Return to Home" permite navegação manual para a página inicial.

## Estados e Hooks
- `useLocation`: Obtém o caminho atual da URL.
- `useEffect`: Executa efeito colateral ao montar/comutar rota, registrando o erro no console.

## Funções e Eventos
- **Log de erro:** No `useEffect`, executa `console.error` com mensagem e caminho acessado.
- **Navegação:** O link utiliza `href="/"` para redirecionar o usuário para a home.

## Checklist de Elementos e Fluxos
- [x] Container centralizado vertical e horizontalmente
- [x] Mensagem de erro 404 clara e destacada
- [x] Mensagem "Oops! Page not found"
- [x] Link de retorno para a home
- [x] Log detalhado de erro 404 no console
- [x] Sem dados mock ou lógica de localStorage

**NÃO INSERIR DADOS MOCK, FICTÍCIOS E NÃO IMPLEMENTAR LÓGICAS DE DADOS EM LOCALSTORAGE.**

---

> Esta documentação detalha todos os elementos, fluxos, estados e comportamentos da página `NotFound.tsx` para permitir a reprodução fiel da tela, conforme implementado no sistema original.
