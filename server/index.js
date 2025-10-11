// server/index.js
// Servidor HTTP simples para endpoints reais (dev) usando Express
const express = require('express');
const cors = require('cors');

// Importa transformadores a partir do build CommonJS? Para simplificar no dev,
// reimplementamos lógica mínima aqui chamando require compilado não é trivial.
// Como alternativa, duplicamos uma versão pequena usando JS puro com as mesmas regras.

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// Middleware simples de métricas e logs
app.use((req, res, next) => {
  metrics.requestsTotal++;
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    metrics.requestDurationMsLast = ms;
    // Log básico apenas de endpoints administrativos e de reprocesso
    if (req.path.startsWith('/api/reprocess') || req.path.startsWith('/api/admin')) {
      console.log(`[admin] ${req.method} ${req.path} -> ${res.statusCode} in ${ms}ms`);
    }
  });
  next();
});

// Armazenamento em memória
let users = [];
let tasks = [];
// Flags/admin state
let adminFlags = { 
  scoringMode: 'productivity', // default global
  // Flags por competição: { [competitionId]: { enabled, scoringMode, rolloutPercent } }
  perCompetition: {}
}; // 'productivity' | 'legacy'
// Cache em memória do ranking com TTL simples
let rankingCache = { data: null, ts: 0 };
const RANKING_TTL_MS = 15 * 1000; // 15s

// Clientes SSE conectados
const sseClients = new Set();

// Métricas/observabilidade (simples in-memory)
const metrics = {
  requestsTotal: 0,
  requestDurationMsLast: 0,
  rankingComputeMsLast: 0,
  rankingCacheHits: 0,
  rankingCacheMisses: 0,
  reprocessCount: 0,
  taskUpdates: 0,
  sseBroadcasts: 0,
  anomaliesDetected: 0,
};

function sseBroadcast(event, payload){
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients){
    try { res.write(data); } catch { /* ignore broken */ }
  }
  metrics.sseBroadcasts++;
}

function invalidateRanking(reason = 'update'){
  rankingCache = { data: null, ts: 0 };
  sseBroadcast('ranking:update', { reason, at: Date.now() });
}

// Helpers
const LEVEL_RULES = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 250 },
  { level: 4, xpRequired: 500 },
  { level: 5, xpRequired: 1000 },
  { level: 6, xpRequired: 2000 },
  { level: 7, xpRequired: 4000 },
  { level: 8, xpRequired: 8000 },
];

function roundHalfUp(n){ return Math.floor(n + 0.5); }

function classifyTask(t) {
  if (t.status === 'refacao') return 'ignore';
  if (t.status !== 'completed') return 'ignore';
  if (!t.dueDate || !t.completedDate) return 'on_time';
  const due = new Date(t.dueDate).getTime();
  const done = new Date(t.completedDate).getTime();
  if (done < due) return 'early';
  if (done === due) return 'on_time';
  return 'late';
}

const PCT = { early: 100, on_time: 90, late: 50 };

function xpFromTasks(userTasks){
  let sum=0, count=0;
  for (const t of userTasks){
    const cls = classifyTask(t);
    if (cls === 'ignore') continue;
    sum += Math.max(0, Math.min(100, PCT[cls] ?? 0));
    count++;
  }
  if (!count) return 0;
  return Math.max(0, roundHalfUp((sum / count) * 10));
}

function xpLegacyFromTasks(userTasks){
  // Rollback simples: cada tarefa concluída vale 10 XP; ignorar refação/pendentes/overdue
  let completed = 0;
  for (const t of userTasks){ if (t.status === 'completed') completed++; }
  return completed * 10;
}

// Hash determinístico simples para rollout (0-99) baseado em userId + competitionId
function rolloutBucket(userId, competitionId){
  const s = String(userId || '') + '|' + String(competitionId || '');
  let h = 0;
  for (let i=0;i<s.length;i++){ h = ((h<<5)-h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h) % 100;
}

// Determina modo efetivo para um grupo de tarefas de uma competição
function effectiveScoringModeForCompetition(competitionId, userId){
  const flag = adminFlags.perCompetition?.[competitionId];
  if (flag && flag.enabled){
    // rolloutPercent: aplica produtividade quando bucket < rolloutPercent; caso contrário, usa legado
    const bucket = rolloutBucket(userId, competitionId);
    if (flag.rolloutPercent === 0) return flag.scoringMode === 'legacy' ? 'legacy' : 'legacy';
    if (flag.rolloutPercent === 100) return flag.scoringMode;
    // Quando configurado como 'productivity' com rollout parcial, fora do bucket cai para legado para facilitar rollback
    const inCohort = bucket < Math.max(0, Math.min(100, Number(flag.rolloutPercent) || 0));
    return inCohort ? flag.scoringMode : (flag.scoringMode === 'productivity' ? 'legacy' : 'legacy');
  }
  return adminFlags.scoringMode;
}

// Calcula XP de um usuário respeitando flags por competição; soma contribuição de cada competição
function computeUserXp(userTasks, userId){
  const groups = new Map(); // compId -> tasks[]
  for (const t of userTasks){
    const cid = t.competitionId || 'default';
    if (!groups.has(cid)) groups.set(cid, []);
    groups.get(cid).push(t);
  }
  let totalXp = 0;
  for (const [cid, list] of groups.entries()){
    const mode = effectiveScoringModeForCompetition(cid, userId);
    const xp = mode === 'legacy' ? xpLegacyFromTasks(list) : xpFromTasks(list);
    totalXp += xp;
  }
  return totalXp;
}

function levelFromXp(xp){
  let lvl = 1;
  for (const r of LEVEL_RULES){ if (xp >= r.xpRequired) lvl = r.level; else break; }
  return lvl;
}

function isThisWeek(d){
  if (!d) return false;
  const date = new Date(d);
  const today = new Date();
  const first = new Date(today);
  first.setDate(today.getDate() - today.getDay());
  first.setHours(0,0,0,0);
  const last = new Date(first);
  last.setDate(first.getDate() + 6);
  return date >= first && date <= last;
}
function isThisMonth(d){
  if (!d) return false;
  const date = new Date(d);
  const today = new Date();
  return date.getFullYear()===today.getFullYear() && date.getMonth()===today.getMonth();
}

function computeRanking(){
  // Tie-breaker precompute
  const incorrectByUser = {};
  const firstCompletionByUser = {};
  for (const t of tasks) {
    if (t.status === 'overdue') {
      incorrectByUser[t.assignedTo] = (incorrectByUser[t.assignedTo] || 0) + 1;
    }
    if (t.status === 'completed' && t.completedDate) {
      const ts = new Date(t.completedDate).getTime();
      const cur = firstCompletionByUser[t.assignedTo];
      if (!cur || ts < cur) firstCompletionByUser[t.assignedTo] = ts;
    }
  }

  const t0 = Date.now();
  const rows = users.map(u => {
    const ut = tasks.filter(t => t.assignedTo === u.id);
    const xp = computeUserXp(ut, u.id);
    return {
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      xp,
      level: levelFromXp(xp),
      weeklyXp: computeUserXp(ut.filter(t => isThisWeek(t.completedDate || t.dueDate)), u.id),
      monthlyXp: computeUserXp(ut.filter(t => isThisMonth(t.completedDate || t.dueDate)), u.id),
      missionsCompleted: u.missionsCompleted || 0,
      consistencyBonus: u.consistencyBonus || 0,
      streak: u.streak || 0,
      _inc: incorrectByUser[u.id] || 0,
      _first: firstCompletionByUser[u.id] || Number.MAX_SAFE_INTEGER,
    };
  }).sort((a,b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (a._inc !== b._inc) return a._inc - b._inc;
    return a._first - b._first;
  }).map(({ _inc, _first, ...rest }) => rest);
  metrics.rankingComputeMsLast = Date.now() - t0;
  return rows;
}

function getRankingCached(){
  const now = Date.now();
  if (rankingCache.data && (now - rankingCache.ts) < RANKING_TTL_MS){
    metrics.rankingCacheHits++;
    return rankingCache.data;
  }
  metrics.rankingCacheMisses++;
  const data = computeRanking();
  rankingCache = { data, ts: now };
  return data;
}

// Endpoints
app.post('/api/seed', (req, res) => {
  const { users: u = [], tasks: t = [] } = req.body || {};
  users = Array.isArray(u) ? u : [];
  tasks = Array.isArray(t) ? t : [];
  invalidateRanking('seed');
  res.json({ ok: true, users: users.length, tasks: tasks.length });
});

app.get('/api/ranking', (req, res) => {
  const ranking = getRankingCached();
  res.json(ranking);
});

app.get('/api/profiles/:id', (req, res) => {
  const id = req.params.id;
  const u = users.find(x => x.id === id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  const ut = tasks.filter(t => t.assignedTo === u.id);
  let sum=0, count=0;
  const distribution = { early: 0, on_time: 0, late: 0, refacao: 0 };
  const tasksBreakdown = [];
  for (const t of ut){
    const cls = classifyTask(t);
    if (cls === 'ignore') continue;
    const pct = Math.max(0, Math.min(100, PCT[cls] ?? 0));
    sum += pct;
    count++;
    if (cls === 'early') distribution.early++;
    else if (cls === 'on_time') distribution.on_time++;
    else if (cls === 'late') distribution.late++;
    else if (cls === 'refacao') distribution.refacao++;
    tasksBreakdown.push({
      id: t.id,
      title: t.title,
      classificacao: cls,
      percent: pct,
      completedDate: t.completedDate || null,
    });
  }
  const avg = count ? sum / count : 0;
  res.json({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    level: levelFromXp(xpFromTasks(ut)),
    missionsCompleted: u.missionsCompleted || 0,
    streak: u.streak || 0,
    productivity: { totalConsidered: count, averagePercent: roundHalfUp(avg) },
    deliveryDistribution: distribution,
    tasksBreakdown,
  });
});

// Atualização de tarefas (mock) + invalidação/emitir evento
app.post('/api/tasks/update', (req, res) => {
  const { task } = req.body || {};
  if (!task || !task.id) return res.status(400).json({ error: 'task.id obrigatório' });
  const idx = tasks.findIndex(t => t.id === task.id);
  if (idx >= 0) {
    tasks[idx] = { ...tasks[idx], ...task };
  } else {
    tasks.push(task);
  }
  metrics.taskUpdates++;
  invalidateRanking('task_update');
  res.json({ ok: true });
});

// Reprocesso manual por temporada (mock) — limpa cache e reemite evento
app.post('/api/reprocess', (req, res) => {
  const { season, dryRun } = req.body || {};
  if (dryRun) {
    const preview = computeRanking();
    return res.json({ ok: true, season: season || null, previewCount: preview.length });
  }
  metrics.reprocessCount++;
  invalidateRanking(`reprocess:${season || 'unknown'}`);
  res.json({ ok: true, season: season || null });
});

// SSE para eventos de atualização de ranking
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`event: ready\ndata: {"ok":true}\n\n`);
  sseClients.add(res);
  const hb = setInterval(() => {
    try { res.write(`event: ping\ndata: ${Date.now()}\n\n`); } catch {}
  }, 25000);
  req.on('close', () => {
    clearInterval(hb);
    sseClients.delete(res);
  });
});

// Admin flags
app.get('/api/admin/flags', (req, res) => {
  res.json({ ...adminFlags });
});
app.post('/api/admin/flags', (req, res) => {
  const { scoringMode } = req.body || {};
  if (scoringMode && ['productivity','legacy'].includes(scoringMode)) {
    adminFlags.scoringMode = scoringMode;
    invalidateRanking('flag_change');
  }
  res.json({ ...adminFlags });
});

// Gerenciar flags por competição
app.post('/api/admin/flags/competition', (req, res) => {
  const { id, enabled = true, scoringMode = 'productivity', rolloutPercent = 100 } = req.body || {};
  if (!id) return res.status(400).json({ error: 'competition id obrigatório' });
  if (!['productivity','legacy'].includes(scoringMode)) return res.status(400).json({ error: 'scoringMode inválido' });
  const rp = Math.max(0, Math.min(100, Number(rolloutPercent) || 0));
  adminFlags.perCompetition[id] = { enabled: !!enabled, scoringMode, rolloutPercent: rp };
  invalidateRanking('flag_competition_change');
  res.json({ ok: true, perCompetition: adminFlags.perCompetition });
});
app.delete('/api/admin/flags/competition/:id', (req, res) => {
  const id = req.params.id;
  if (adminFlags.perCompetition && adminFlags.perCompetition[id]){
    delete adminFlags.perCompetition[id];
    invalidateRanking('flag_competition_delete');
  }
  res.json({ ok: true, perCompetition: adminFlags.perCompetition });
});

// Health endpoints
app.get('/api/health', (req, res) => {
  const cacheAge = rankingCache.ts ? (Date.now() - rankingCache.ts) : null;
  res.json({
    ok: true,
    users: users.length,
    tasks: tasks.length,
    cacheAgeMs: cacheAge,
    cacheHasData: !!rankingCache.data,
    sseClients: sseClients.size,
    flags: adminFlags,
    metrics,
  });
});

app.get('/api/health/xp-drift', (req, res) => {
  // Compara XP exibido (engine atual) vs recomputado por média (mesmo método) para detectar drift
  const rows = computeRanking();
  let maxDrift = 0, totalDrift = 0;
  for (const r of rows){
    const ut = tasks.filter(t => t.assignedTo === r.id);
    const recompute = adminFlags.scoringMode === 'legacy' ? xpLegacyFromTasks(ut) : xpFromTasks(ut);
    const drift = Math.abs((r.xp || 0) - (recompute || 0));
    if (drift > maxDrift) maxDrift = drift;
    totalDrift += drift;
  }
  res.json({ ok: true, rows: rows.length, maxDrift, avgDrift: rows.length ? totalDrift/rows.length : 0 });
});

// Métricas (JSON simples)
app.get('/api/metrics', (req, res) => {
  res.json({
    ...metrics,
    cacheAgeMs: rankingCache.ts ? (Date.now() - rankingCache.ts) : null,
  });
});

// Opcional: formato Prometheus para scraping
app.get('/api/metrics/prom', (req, res) => {
  const lines = [];
  const push = (k, v) => lines.push(`${k} ${Number(v)}`);
  push('requests_total', metrics.requestsTotal);
  push('request_duration_ms_last', metrics.requestDurationMsLast);
  push('ranking_compute_ms_last', metrics.rankingComputeMsLast);
  push('ranking_cache_hits_total', metrics.rankingCacheHits);
  push('ranking_cache_misses_total', metrics.rankingCacheMisses);
  push('reprocess_total', metrics.reprocessCount);
  push('task_updates_total', metrics.taskUpdates);
  push('sse_broadcasts_total', metrics.sseBroadcasts);
  push('anomalies_detected_total', metrics.anomaliesDetected);
  res.setHeader('Content-Type','text/plain; version=0.0.4');
  res.send(lines.join('\n') + '\n');
});

// --------- Relatórios e exportações ---------
function toCsv(rows, headers){
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const head = headers.join(',');
  const body = rows.map(r => headers.map(h => escape(r[h])).join(',')).join('\n');
  return head + '\n' + body + '\n';
}

function computeDistributionForUser(uid){
  const ut = tasks.filter(t => t.assignedTo === uid);
  const dist = { early: 0, on_time: 0, late: 0, refacao: 0 };
  let sum = 0, count = 0;
  for (const t of ut){
    const cls = classifyTask(t);
    if (cls === 'ignore') { if (t.status === 'refacao') dist.refacao++; continue; }
    if (cls === 'early') dist.early++;
    else if (cls === 'on_time') dist.on_time++;
    else if (cls === 'late') dist.late++;
    const pct = Math.max(0, Math.min(100, PCT[cls] ?? 0));
    sum += pct; count++;
  }
  const avg = count ? sum / count : 0;
  return { dist, avg, count };
}

app.get('/api/reports/ranking.csv', (req, res) => {
  const rows = getRankingCached();
  const headers = ['id','name','avatar','xp','level','weeklyXp','monthlyXp','missionsCompleted','consistencyBonus','streak'];
  const csv = toCsv(rows, headers);
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="ranking.csv"');
  res.send(csv);
});

app.get('/api/reports/productivity.csv', (req, res) => {
  const rows = users.map(u => {
    const { dist, avg, count } = computeDistributionForUser(u.id);
    return {
      id: u.id,
      name: u.name,
      early: dist.early,
      on_time: dist.on_time,
      late: dist.late,
      refacao: dist.refacao,
      totalConsidered: count,
      averagePercent: roundHalfUp(avg),
    };
  });
  const headers = ['id','name','early','on_time','late','refacao','totalConsidered','averagePercent'];
  const csv = toCsv(rows, headers);
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="productivity.csv"');
  res.send(csv);
});

app.get('/api/reports/incorrect.csv', (req, res) => {
  const incorrectByUser = {};
  for (const t of tasks) {
    if (t.status === 'overdue') {
      incorrectByUser[t.assignedTo] = (incorrectByUser[t.assignedTo] || 0) + 1;
    }
  }
  const rows = users.map(u => ({ id: u.id, name: u.name, incorrect: incorrectByUser[u.id] || 0 }));
  const headers = ['id','name','incorrect'];
  const csv = toCsv(rows, headers);
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition','attachment; filename="incorrect.csv"');
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
