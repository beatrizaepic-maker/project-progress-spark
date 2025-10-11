// src/config/gamification.ts
// Configuração editável dos percentuais de produtividade por classificação

export type DeliveryClass = 'early' | 'on_time' | 'late' | 'refacao';

export interface ProductivityConfig {
  early: number;   // 0-100
  on_time: number; // 0-100
  late: number;    // 0-100
  refacao: number; // 0-100 (aplicado quando reconcluída como refação)
}

const DEFAULTS: ProductivityConfig = {
  early: 100,
  on_time: 90,
  late: 50,
  refacao: 40,
};

const LS_KEY = 'epic_productivity_config_v1';

export function getProductivityConfig(): ProductivityConfig {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return validateConfig({ ...DEFAULTS, ...parsed });
  } catch {
    return { ...DEFAULTS };
  }
}

export function setProductivityConfig(cfg: Partial<ProductivityConfig>) {
  const current = getProductivityConfig();
  const merged = validateConfig({ ...current, ...cfg });
  localStorage.setItem(LS_KEY, JSON.stringify(merged));
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

export function getPercentageForClass(cls: DeliveryClass): number {
  const cfg = getProductivityConfig();
  return cfg[cls];
}
