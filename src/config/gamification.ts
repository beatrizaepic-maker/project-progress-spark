// src/config/gamification.ts
// Configuração editável dos percentuais de produtividade por classificação

import { supabase } from '@/lib/supabase';

export type DeliveryClass = 'early' | 'on_time' | 'late' | 'refacao';

export interface ProductivityConfig {
  early: number;   // 0-100
  on_time: number; // 0-100
  late: number;    // 0-100
  refacao: number; // 0-100 (aplicado quando reconcluída como refação)
}

const DEFAULTS: ProductivityConfig = {
  early: 110,
  on_time: 100,
  late: 50,
  refacao: 40,
};

const CONFIG_TABLE = 'productivity_config';

export async function getProductivityConfig(): Promise<ProductivityConfig> {
  try {
    const { data, error } = await supabase
      .from(CONFIG_TABLE)
      .select('*')
      .single();
    
    if (error) {
      console.warn('Erro ao carregar configuração de produtividade, usando padrões:', error);
      return { ...DEFAULTS };
    }
    
    if (!data) {
      // Configuração não encontrada, retornar padrões
      return { ...DEFAULTS };
    }
    
    const config: ProductivityConfig = {
      early: data.early || DEFAULTS.early,
      on_time: data.on_time || DEFAULTS.on_time,
      late: data.late || DEFAULTS.late,
      refacao: data.refacao || DEFAULTS.refacao,
    };
    
    return validateConfig(config);
  } catch (error) {
    console.error('Erro inesperado ao carregar configuração de produtividade:', error);
    return { ...DEFAULTS };
  }
}

export async function setProductivityConfig(cfg: Partial<ProductivityConfig>) {
  try {
    const current = await getProductivityConfig();
    const merged = validateConfig({ ...current, ...cfg });
    
    // Atualizar ou inserir configuração no Supabase
    const { error } = await supabase
      .from(CONFIG_TABLE)
      .upsert({ id: 1, ...merged }, { onConflict: 'id' }); // Assuming id=1 for the main config
    
    if (error) {
      console.error('Erro ao salvar configuração de produtividade:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro inesperado ao salvar configuração de produtividade:', error);
    throw error;
  }
}

function validateConfig(cfg: ProductivityConfig): ProductivityConfig {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  return {
    early: clamp(cfg.early),
    on_time: clamp(cfg.on_time),
    late: clamp(cfg.late),
    refacao: clamp(cfg.refacao),
  };
}

export async function getPercentageForClass(cls: DeliveryClass): Promise<number> {
  const cfg = await getProductivityConfig();
  return cfg[cls];
}
