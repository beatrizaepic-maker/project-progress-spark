# Lógica de População Automática de Tabelas Após Cadastro de Usuário

## Visão Geral
Ao cadastrar um novo usuário no sistema (via Supabase Auth), é fundamental garantir que todas as tabelas relacionadas ao perfil, preferências e gamificação sejam populadas automaticamente. Isso garante que o usuário tenha uma experiência completa e sem erros ao acessar qualquer funcionalidade do sistema.

## Tabelas que Devem Ser Populadas Automaticamente

### 1. `users`
- **Descrição:** Tabela principal de perfis customizados do sistema.
- **População:** Deve receber o novo usuário com os campos obrigatórios (id, email, username, full_name, theme_preference, etc.) logo após o cadastro no Auth.

### 2. `player_profiles`
- **Descrição:** Perfil gamificado do usuário (nível, nome, data de entrada, etc.).
- **População:** Cria um registro para cada novo usuário, com valores iniciais (ex: level 1, joined_date = NOW()).

### 3. `user_preferences`
- **Descrição:** Preferências de notificação e privacidade do usuário.
- **População:** Cria um registro com valores padrão (ex: email_notifications_enabled = true).

### 4. `user_rankings`
- **Descrição:** Ranking inicial do usuário no sistema.
- **População:** Cria um registro com XP e posição inicial (ex: total_xp = 0, position = 999).

### 5. `user_streaks`
- **Descrição:** Controle de streaks (dias consecutivos de atividade).
- **População:** Cria um registro com streaks zerados.

### 6. `xp_history`
- **Descrição:** Histórico de XP do usuário.
- **População:** Cria uma entrada inicial indicando o cadastro (ex: reason_type = 'registration').

### 7. `missions`
- **Descrição:** Missões ativas do usuário.
- **População:** Cria pelo menos uma missão inicial (ex: config_id = 'first_task').

### 8. `analytics_preferences`
- **Descrição:** Preferências de visualização de analytics.
- **População:** Cria um registro padrão (ex: default_chart_type = 'bar').

### 9. `dashboard_widgets`
- **Descrição:** Widgets padrão do dashboard do usuário.
- **População:** Cria um widget inicial ativo (ex: widget_type = 'kpi_summary').

### 10. `user_performance_metrics`
- **Descrição:** Métricas de desempenho do usuário.
- **População:** Cria um registro inicial com valores zerados.

### 11. `user_activity_log`
- **Descrição:** Log de atividades do usuário.
- **População:** Cria uma entrada de registro indicando o cadastro.

## Fluxo Esperado
1. **Usuário cadastra-se via Auth (tabela auth.users).**
2. **Trigger ou rotina backend insere o usuário na tabela `users`** (com todos os campos obrigatórios).
3. **Triggers ou funções automáticas populam todas as tabelas acima** usando o `user_id` recém-criado.
4. **O usuário pode acessar qualquer página do sistema** sem erros de dados ausentes.

## Observações Importantes
- Todas as tabelas devem ter as colunas obrigatórias e constraints corretamente configuradas.
- Se alguma tabela exigir campos NOT NULL adicionais, ajuste o trigger/função para preencher esses campos.
- O processo pode ser feito via trigger SQL, função backend ou script manual (como mostrado nos exemplos anteriores).

---

**Resumo:**
Sempre que um novo usuário for cadastrado, as tabelas `users`, `player_profiles`, `user_preferences`, `user_rankings`, `user_streaks`, `xp_history`, `missions`, `analytics_preferences`, `dashboard_widgets`, `user_performance_metrics` e `user_activity_log` devem ser populadas automaticamente para garantir o funcionamento completo do sistema.
