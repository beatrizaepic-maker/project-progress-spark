Aqui vamos discorrer 5. **Persistência de sessão:**
   - O backend retorna um token de autenticação (JWT ou similar).
   - O token é armazenado localmente (localStorage ou cookie seguro).
   - O token é utilizado para autenticar requisições futuras.

## Implementação Atual (Simulada)

### Serviços Criados:
- **AuthService**: Gerencia autenticação usando localStorage para simular backend
- **AuthContext**: Context React para estado global de autenticação

### Usuários de Teste:
- `admin@epic.com` / `123456` (Administrador)
- `user@epic.com` / `123456` (Usuário comum)
- `gabriel@epic.com` / `123456` (Administrador)

### Funcionalidades Implementadas:
- ✅ Validação de campos (e-mail e senha obrigatórios)
- ✅ Validação de formato de e-mail
- ✅ Autenticação simulada com usuários pré-definidos
- ✅ Geração e validação de token JWT simulado
- ✅ Persistência de sessão no localStorage
- ✅ Loading states durante autenticação
- ✅ Mensagens de feedback (toast notifications)
- ✅ Redirecionamento pós-login para /dashboard
- ✅ Rotas protegidas (ProtectedRoute component)
- ✅ Menu de usuário no header com logout
- ✅ Logout com limpeza de dados locais

### Fluxo de Autenticação:
1. Usuário acessa qualquer rota protegida → Redirecionado para /login
2. Preenche credenciais → Validação frontend
3. Submissão → AuthService valida credenciais
4. Sucesso → Token salvo, usuário redirecionado
5. Falha → Mensagem de erro exibida

### Segurança Implementada:
- Tokens com expiração (24 horas)
- Validação contínua de autenticação
- Limpeza automática de tokens expirados
- Proteção de rotas sensíveis

### Personalização do Sidebar:
- ✅ Logo substituído pelo avatar do usuário logado
- ✅ Nome "Epic Board" alterado para primeiro nome do usuário
- ✅ Consistência garantida entre sidebar e card de perfil (mesmo nome)
- ✅ Priorização do firstName, fallback para primeiro nome do name completo
- ✅ Limite de caracteres implementado (máximo 12 caracteres + "...")
- ✅ Fallback para avatar padrão quando imagem não carrega
- ✅ Responsividade mantida conforme estado do sidebar (aberto/fechado)

### Sistema de Perfil de Usuário:
- ✅ Modal de edição de perfil acessível via menu do usuário
- ✅ Campos editáveis: nome completo, primeiro nome, sobrenome, cargo/função, avatar
- ✅ Upload simulado de avatar com URLs pré-definidas
- ✅ Configurações de notificação (email, app, push, resumo semanal)
- ✅ Persistência das alterações no localStorage
- ✅ Feedback visual durante salvamento
- ✅ Integração com contexto de autenticação
- ✅ Sincronização automática entre abas (storage events)
- ✅ Componente de debug para verificar persistência
- ✅ Botão de teste rápido para simular mudanças

### Estrutura de Dados Expandida:
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
}
```

### Sistema de Persistência de Dados:
- ✅ **LocalStorage Keys**:
  - `epic_user_data`: Dados do usuário atual logado
  - `epic_users_db`: Banco simulado de todos os usuários
  - `epic_auth_token`: Token de autenticação
- ✅ **Sincronização**: Mudanças refletidas instantaneamente em todo o sistema
- ✅ **Verificação**: Componente de debug mostra consistência dos dados
- ✅ **Fallbacks**: Sistema robusto com fallbacks para dados ausentes

### Como Testar a Persistência:
1. Faça login com qualquer usuário de teste
2. Acesse Configurações ou clique no menu do usuário → "Editar Perfil"
3. Altere dados (nome, avatar, etc.) e salve
4. Verifique que o sidebar atualiza instantaneamente
5. Vá para Configurações e veja o componente de debug
6. Use o botão "Teste Rápido" para mudanças automáticas
7. Recarregue a página - dados permanecem salvos
8. Abra outra aba - dados sincronizam automaticamente

Aqui vamos discorrer sobre as lógicas de funcionamento da plataforma.
Este documento é um documento vivo, e deverá ser atualizado constantemente conforme orientação!
---
## Lógica da Página /login

1. **Fluxo de autenticação:**
	- O usuário informa e-mail e senha nos campos do formulário.
	- Os dados são enviados para o backend via requisição segura (HTTPS).
	- O backend valida as credenciais e retorna sucesso ou erro.

2. **Validação dos dados:**
	- O frontend valida se os campos estão preenchidos corretamente (formato de e-mail, senha não vazia).
	- Caso haja erro, exibe mensagem informando o problema.

3. **Tratamento de erros:**
	- Se as credenciais estiverem incorretas, exibe mensagem de erro ao usuário.
	- Se o usuário não existir, sugere cadastro ou recuperação de senha.

4. **Redirecionamento:**
	- Após login bem-sucedido, o usuário é redirecionado para a página principal ou dashboard.

5. **Persistência de sessão:**
	- O backend retorna um token de autenticação (JWT ou similar).
	- O token é armazenado localmente (localStorage ou cookie seguro).
	- O token é utilizado para autenticar requisições futuras.