import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase - valores de variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação das variáveis de ambiente obrigatórias
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO CRÍTICO: Variáveis de ambiente do Supabase não estão configuradas!')
  console.error('   Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ao arquivo .env')
  throw new Error('Configuração do Supabase incompleta - verifique o arquivo .env')
}

// ✅ Instância única do cliente Supabase - centralizada neste módulo
// Esta é a ÚNICA instância que deve ser usada em toda a aplicação
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,           // Atualiza token automaticamente
    persistSession: true,             // Persiste a sessão (Supabase gerencia internamente)
    detectSessionInUrl: true          // Detecta sessão em URL (callback de autenticação)
  }
})