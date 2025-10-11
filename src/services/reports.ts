// src/services/reports.ts
// Helpers para URLs de exportação/relatórios

const BASE = 'http://localhost:3001';

export const reportUrls = {
  rankingCsv: () => `${BASE}/api/reports/ranking.csv`,
  productivityCsv: () => `${BASE}/api/reports/productivity.csv`,
  incorrectCsv: () => `${BASE}/api/reports/incorrect.csv`,
};

export function download(url: string) {
  // Abre em nova aba; pode ser substituído por fetch+Blob se preferir
  window.open(url, '_blank');
}
