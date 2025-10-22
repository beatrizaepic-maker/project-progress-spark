import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getProductivityConfig, setProductivityConfig } from '@/config/gamification';
import { supabase } from '@/lib/supabase';

const ControlPage: React.FC = () => {
  const cfg = getProductivityConfig();
  const [form, setForm] = useState({ ...cfg });
  const [season, setSeason] = useState<string>('Q4-2025');
  const [allowDueDateRecalc, setAllowDueDateRecalc] = useState<boolean>(false);
  const [scoringMode, setScoringMode] = useState<'productivity' | 'legacy'>('productivity');
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [competitionFlags, setCompetitionFlags] = useState<Record<string, { enabled: boolean; scoringMode: 'productivity' | 'legacy'; rolloutPercent: number }>>({});
  const [compForm, setCompForm] = useState<{ id: string; enabled: boolean; scoringMode: 'productivity' | 'legacy'; rolloutPercent: number }>({ id: '', enabled: true, scoringMode: 'productivity', rolloutPercent: 100 });



  useEffect(() => {
    // carrega flags atuais do servidor
    (supabase.from('system_settings').select('scoringMode, perCompetition').single() as unknown as Promise<any>).then(({ data, error }: any) => {
      if (!error && data) {
        setScoringMode(data.scoringMode || 'productivity');
        if (data?.perCompetition) setCompetitionFlags(data.perCompetition);
      }
    }).catch(() => {});
    // Calcular saúde
    (Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('user_gamification_profiles').select('*').limit(1)
    ]) as Promise<any>).then(([users, tasks, profiles]: any) => {
      setHealth({
        users: users.count || 0,
        tasks: tasks.count || 0,
        cacheHasData: profiles.data && profiles.data.length > 0
      });
    }).catch(() => {});
    // Buscar métricas
    (supabase.from('project_metrics').select('*').single() as unknown as Promise<any>).then(({ data, error }: any) => {
      if (!error) setMetrics(data);
    }).catch(() => {});
    const iv = setInterval(() => {
      (supabase.from('project_metrics').select('*').single() as unknown as Promise<any>).then(({ data, error }: any) => {
        if (!error) setMetrics(data);
      }).catch(() => {});
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  const handleSave = () => {
    setProductivityConfig(form as any);
    alert('Configurações de produtividade salvas.');
  };

  const handleReprocess = () => {
    (supabase.rpc('reprocess_ranking', { season }) as unknown as Promise<any>).then(({ data, error }: any) => {
      if (error) throw error;
      alert(`Reprocesso manual iniciado para a temporada: ${season}`);
    }).catch(() => alert('Falha ao iniciar reprocesso. Verifique o banco.'));
  };

  const handleDryRun = () => {
    (supabase.rpc('reprocess_ranking', { season, dryRun: true }) as unknown as Promise<any>).then(({ data, error }: any) => {
      if (error) throw error;
      alert(`Dry-run: ${data?.previewCount || 0} registros no ranking pré-calculado`);
    }).catch(() => alert('Falha no dry-run.'));
  };

  const handleApplyScoring = () => {
    (supabase.from('system_settings').update({ scoringMode }).eq('id', 1) as unknown as Promise<any>).then(({ error }: any) => {
      if (error) throw error;
      alert(`Modo de pontuação aplicado: ${scoringMode}`);
    }).catch(() => alert('Falha ao aplicar modo.'));
  };

  const handleSaveCompetitionFlag = () => {
    if (!compForm.id) { alert('Informe o ID da competição'); return; }
    (supabase.from('system_settings').update({ perCompetition: { ...competitionFlags, [compForm.id]: { enabled: compForm.enabled, scoringMode: compForm.scoringMode, rolloutPercent: compForm.rolloutPercent } } }).eq('id', 1) as unknown as Promise<any>).then(({ data, error }: any) => {
      if (error) throw error;
      if (data && data[0]?.perCompetition) setCompetitionFlags(data[0].perCompetition);
      alert('Flag de competição salva.');
    }).catch(() => alert('Falha ao salvar flag.'));
  };

  const handleDeleteCompetitionFlag = (id: string) => {
    const updated = { ...competitionFlags };
    delete updated[id];
    (supabase.from('system_settings').update({ perCompetition: updated }).eq('id', 1) as unknown as Promise<any>).then(({ data, error }: any) => {
      if (error) throw error;
      if (data && data[0]?.perCompetition) setCompetitionFlags(data[0].perCompetition);
    }).catch(() => {});
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Temporadas e Políticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm">Temporada atual</label>
            <Input value={season} onChange={e => setSeason(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="flag_due" type="checkbox" checked={allowDueDateRecalc} onChange={e => setAllowDueDateRecalc(e.target.checked)} />
            <label htmlFor="flag_due" className="text-sm">Permitir recálculo de prazo após conclusão (apenas quando em refação)</label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReprocess} className="rounded-none">Reprocessar Ranking por Temporada</Button>
            <Button variant="outline" onClick={handleDryRun} className="rounded-none">Dry-run</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Percentuais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {(['early','on_time','late','refacao'] as const).map(key => (
            <div key={key}>
              <label className="text-sm capitalize">{key}</label>
              <Input type="number" value={form[key]} onChange={e => setForm({ ...form, [key]: Number(e.target.value) })} />
            </div>
          ))}
          <div className="col-span-2">
            <Button onClick={handleSave} className="rounded-none">Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modo de Pontuação e Saúde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm">Modo de pontuação</label>
            <select className="border p-2 bg-background" value={scoringMode} onChange={e => setScoringMode(e.target.value as any)}>
              <option value="productivity">Produtividade (média → XP)</option>
              <option value="legacy">Legado (10 XP por tarefa concluída)</option>
            </select>
            <Button onClick={handleApplyScoring} className="rounded-none">Aplicar</Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Saúde do servidor: {health ? `${health.users} usuários, ${health.tasks} tarefas, cache ${health.cacheHasData ? 'ativo' : 'vazio'}` : 'carregando...'}
          </div>
          <div className="text-sm text-muted-foreground">
            Métricas: {metrics ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>Reqs: {metrics.requestsTotal}</div>
                <div>Últ. req ms: {metrics.requestDurationMsLast}</div>
                <div>Ranking (últ) ms: {metrics.rankingComputeMsLast}</div>
                <div>Cache hits: {metrics.rankingCacheHits}</div>
                <div>Cache misses: {metrics.rankingCacheMisses}</div>
                <div>Reprocessos: {metrics.reprocessCount}</div>
                <div>Atualizações tarefa: {metrics.taskUpdates}</div>
                <div>SSE broadcasts: {metrics.sseBroadcasts}</div>
                <div>Anomalias: {metrics.anomaliesDetected}</div>
                <div>Idade cache ms: {metrics.cacheAgeMs ?? '-'}</div>
              </div>
            ) : 'carregando métricas...'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rollout por Competição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">ID da competição</label>
              <Input value={compForm.id} onChange={e => setCompForm({ ...compForm, id: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input id="comp_enabled" type="checkbox" checked={compForm.enabled} onChange={e => setCompForm({ ...compForm, enabled: e.target.checked })} />
              <label htmlFor="comp_enabled" className="text-sm">Ativado</label>
            </div>
            <div>
              <label className="text-sm">Modo</label>
              <select className="border p-2 bg-background w-full" value={compForm.scoringMode} onChange={e => setCompForm({ ...compForm, scoringMode: e.target.value as any })}>
                <option value="productivity">Produtividade</option>
                <option value="legacy">Legado</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Rollout (%)</label>
              <Input type="number" min={0} max={100} value={compForm.rolloutPercent} onChange={e => setCompForm({ ...compForm, rolloutPercent: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveCompetitionFlag} className="rounded-none">Salvar/Atualizar Competição</Button>
          </div>
          <div className="mt-3">
            <div className="text-sm font-medium mb-1">Competições configuradas</div>
            <div className="space-y-1">
              {Object.keys(competitionFlags || {}).length === 0 && <div className="text-sm text-muted-foreground">Nenhuma configuração.</div>}
              {Object.entries(competitionFlags || {}).map(([id, cfg]) => (
                <div key={id} className="flex items-center justify-between border p-2">
                  <div className="text-sm">
                    <div className="font-medium">{id}</div>
                    <div className="text-muted-foreground">{cfg.enabled ? 'Ativo' : 'Inativo'} · {cfg.scoringMode} · {cfg.rolloutPercent}%</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-none" onClick={() => setCompForm({ id, enabled: cfg.enabled, scoringMode: cfg.scoringMode, rolloutPercent: cfg.rolloutPercent })}>Editar</Button>
                    <Button variant="destructive" className="rounded-none" onClick={() => handleDeleteCompetitionFlag(id)}>Remover</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlPage;
