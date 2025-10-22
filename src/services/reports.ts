// src/services/reports.ts
// Helpers para geração e download de relatórios CSV via Supabase

import { supabase } from '@/lib/supabase';

// Função auxiliar para converter array de objetos em CSV
function convertToCSV(data: any[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n');
  return csv;
}

// Funções para gerar dados dos relatórios
export const reportGenerators = {
  rankingCsv: async () => {
    const { data, error } = await supabase.from('user_gamification_profiles').select('*');
    if (error) throw error;
    return convertToCSV(data || []);
  },
  productivityCsv: async () => {
    const { data, error } = await supabase.from('xp_history').select('*');
    if (error) throw error;
    return convertToCSV(data || []);
  },
  incorrectCsv: async () => {
    const { data, error } = await supabase.from('tasks').select('*').eq('status', 'incorrect');
    if (error) throw error;
    return convertToCSV(data || []);
  },
};

// Função para baixar o relatório como CSV
export async function download(reportType: keyof typeof reportGenerators) {
  const csv = await reportGenerators[reportType]();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportType.replace('Csv', '')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
