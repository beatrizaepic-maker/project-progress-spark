# Detalhes do Player/Usuário - Guia de Implementação

## Criação Automática de Player/Usuário

- O perfil do player/usuário será criado automaticamente ao realizar o cadastro ou criar o login na plataforma.
- As informações básicas (nome, e-mail, avatar padrão, ID) serão geradas e associadas ao novo acesso.
- O perfil será inicializado com o nível de acesso padrão: **Player**.

## Níveis de Acesso na Plataforma

1. **Player**
   - Perfil padrão e mais comum.
   - Pode visualizar e editar seu próprio perfil.
   - Participa do sistema de gamificação, ranking, missões e tarefas.

2. **ADM (Administrador/Supervisor)**
   - Tem acesso às mesmas funções do Player.
   - Pode supervisionar outros players, visualizar estatísticas gerais e detalhes de performance.
   - Pode aprovar, corrigir ou penalizar tarefas/missões de outros usuários.
   - Acesso a relatórios e dashboards administrativos.

3. **Dev (Desenvolvedor)**
   - Tem acesso total ao sistema.
   - Pode efetuar alterações estruturais e funcionais via sistema (opções a serem criadas futuramente).
   - Gerencia configurações avançadas, integrações e manutenção da plataforma.

## Observações

- O nível de acesso é definido no momento do cadastro ou atribuído posteriormente por um ADM ou Dev.
- Cada nível de acesso terá permissões e visualizações específicas, alinhadas à estrutura e estilo da plataforma.
- Este documento será complementado conforme novas necessidades e funcionalidades forem surgindo.

---

Este guia serve como referência para a criação e gestão dos perfis de player/usuário e seus níveis de acesso na plataforma.