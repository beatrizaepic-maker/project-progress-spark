import { KPIResults, KPIConfig } from './kpiCalculator';
import { TaskData } from '@/data/projectData';

// Interface para entrada do cache
interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
  metadata?: Record<string, any>;
}

// Interface para configuração do cache
interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
  enableMetrics: boolean;
  persistToStorage: boolean;
  storageKey: string;
}

// Interface para métricas do cache
interface CacheMetrics {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  totalEntries: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
  averageAge: number;
}

// Classe principal do cache
export class KPICache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    cleanups: 0
  };
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      cleanupInterval: 60 * 1000, // 1 minuto
      enableMetrics: true,
      persistToStorage: false,
      storageKey: 'kpi-cache',
      ...config
    };

    // Inicia limpeza automática
    this.startCleanupTimer();

    // Carrega cache do localStorage se habilitado
    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }
  }

  /**
   * Gera chave única para os dados de entrada
   */
  generateKey(tasks: TaskData[], config?: Partial<KPIConfig>, prefix = 'kpi'): string {
    // Cria hash baseado nos dados essenciais das tarefas
    const taskData = tasks.map(t => ({
      id: t.id,
      inicio: t.inicio,
      fim: t.fim,
      prazo: t.prazo,
      duracaoDiasUteis: t.duracaoDiasUteis,
      atrasoDiasUteis: t.atrasoDiasUteis
    }));

    const hashInput = {
      tasks: taskData,
      config: config || {},
      count: tasks.length
    };

    // Gera hash simples (em produção, usar biblioteca de hash mais robusta)
    const jsonString = JSON.stringify(hashInput);
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32bit integer
    }

    return `${prefix}_${Math.abs(hash).toString(36)}_${tasks.length}`;
  }

  /**
   * Obtém dados do cache
   */
  get<T = KPIResults>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Verifica se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Atualiza estatísticas
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.metrics.hits++;

    return entry.data as T;
  }

  /**
   * Armazena dados no cache
   */
  set<T = KPIResults>(
    key: string, 
    data: T, 
    ttl?: number, 
    metadata?: Record<string, any>
  ): void {
    const now = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;

    // Remove entrada mais antiga se atingiu limite
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      ttl: entryTTL,
      hits: 0,
      lastAccessed: now,
      metadata
    };

    this.cache.set(key, entry);

    // Persiste se habilitado
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Remove entrada específica
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted && this.config.persistToStorage) {
      this.saveToStorage();
    }
    
    return deleted;
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.metrics = { hits: 0, misses: 0, evictions: 0, cleanups: 0 };
    
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Remove entradas expiradas
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    this.metrics.cleanups++;
    
    if (removed > 0 && this.config.persistToStorage) {
      this.saveToStorage();
    }

    return removed;
  }

  /**
   * Remove entrada mais antiga (LRU)
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.evictions++;
    }
  }

  /**
   * Inicia timer de limpeza automática
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Para timer de limpeza
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Salva cache no localStorage
   */
  private saveToStorage(): void {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem(this.config.storageKey, JSON.stringify({
        cache: cacheData,
        metrics: this.metrics,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Falha ao salvar cache no localStorage:', error);
    }
  }

  /**
   * Carrega cache do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored);
      const now = Date.now();

      // Carrega apenas entradas não expiradas
      for (const [key, entry] of data.cache) {
        if (now - entry.timestamp < entry.ttl) {
          this.cache.set(key, entry);
        }
      }

      // Restaura métricas
      if (data.metrics) {
        this.metrics = { ...this.metrics, ...data.metrics };
      }
    } catch (error) {
      console.warn('Falha ao carregar cache do localStorage:', error);
    }
  }

  /**
   * Obtém métricas do cache
   */
  getMetrics(): CacheMetrics {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0;
    
    const ages = entries.map(e => now - e.timestamp);
    const averageAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    
    return {
      totalHits: this.metrics.hits,
      totalMisses: this.metrics.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalEntries: this.cache.size,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: ages.length > 0 ? Math.max(...ages) : 0,
      newestEntry: ages.length > 0 ? Math.min(...ages) : 0,
      averageAge: Math.round(averageAge)
    };
  }

  /**
   * Estima uso de memória (aproximado)
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    for (const entry of this.cache.values()) {
      // Estimativa grosseira baseada no JSON
      size += JSON.stringify(entry).length * 2; // 2 bytes por char
    }
    return size;
  }

  /**
   * Obtém informações detalhadas de uma entrada
   */
  getEntryInfo(key: string): CacheEntry | null {
    return this.cache.get(key) || null;
  }

  /**
   * Lista todas as chaves do cache
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Obtém estatísticas por prefixo
   */
  getStatsByPrefix(prefix: string): { count: number; totalHits: number; avgAge: number } {
    const entries = Array.from(this.cache.entries())
      .filter(([key]) => key.startsWith(prefix));
    
    const now = Date.now();
    const totalHits = entries.reduce((sum, [, entry]) => sum + entry.hits, 0);
    const avgAge = entries.length > 0 
      ? entries.reduce((sum, [, entry]) => sum + (now - entry.timestamp), 0) / entries.length
      : 0;

    return {
      count: entries.length,
      totalHits,
      avgAge: Math.round(avgAge)
    };
  }

  /**
   * Destrói o cache e limpa recursos
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}

// Instância global do cache
export const globalKPICache = new KPICache({
  maxSize: 50,
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  cleanupInterval: 2 * 60 * 1000, // 2 minutos
  enableMetrics: true,
  persistToStorage: true,
  storageKey: 'project-progress-kpi-cache'
});

// Utilitários para uso com KPIs
export const KPICacheUtils = {
  /**
   * Gera chave para KPIs do dashboard
   */
  dashboardKey: (tasks: TaskData[], config?: Partial<KPIConfig>) => 
    globalKPICache.generateKey(tasks, config, 'dashboard'),

  /**
   * Gera chave para KPIs de analytics
   */
  analyticsKey: (tasks: TaskData[], config?: Partial<KPIConfig>) => 
    globalKPICache.generateKey(tasks, config, 'analytics'),

  /**
   * Gera chave para KPIs de tarefas
   */
  tasksKey: (tasks: TaskData[], config?: Partial<KPIConfig>) => 
    globalKPICache.generateKey(tasks, config, 'tasks'),

  /**
   * Invalida cache por tipo
   */
  invalidateByType: (type: 'dashboard' | 'analytics' | 'tasks' | 'all') => {
    if (type === 'all') {
      globalKPICache.clear();
      return;
    }

    const keys = globalKPICache.getKeys();
    keys.forEach(key => {
      if (key.startsWith(type)) {
        globalKPICache.delete(key);
      }
    });
  },

  /**
   * Obtém estatísticas por tipo
   */
  getStatsByType: (type: string) => globalKPICache.getStatsByPrefix(type),

  /**
   * Força limpeza do cache
   */
  cleanup: () => globalKPICache.cleanup(),

  /**
   * Obtém métricas globais
   */
  getMetrics: () => globalKPICache.getMetrics()
};