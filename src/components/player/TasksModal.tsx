// src/components/player/TasksModal.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type TaskItem = {
  id: string | number;
  titulo: string;
  prazo: string; // ISO ou data legível
  status: 'overdue' | 'today';
  detalhe?: string;
};

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  subtitulo?: string;
  tasks: TaskItem[];
}

const TasksModal: React.FC<TasksModalProps> = ({ isOpen, onClose, titulo, subtitulo, tasks }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl rounded-none bg-[#1A1A2E] border border-[#6A0DAD] p-0">
        <DialogHeader className="p-6 border-b border-[#6A0DAD]/40">
          <DialogTitle className="text-foreground text-xl flex items-center gap-2">
            <span className="text-[#FF0066]">●</span>
            {titulo}
          </DialogTitle>
          {subtitulo && (
            <p className="text-sm text-[#C0C0C0] mt-1">{subtitulo}</p>
          )}
        </DialogHeader>

        <div className="p-6">
          {tasks.length === 0 ? (
            <div className="text-center text-[#C0C0C0]">Nenhuma tarefa para exibir.</div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li key={t.id} className="p-4 bg-[#0f172a]/30 border border-[#6A0DAD]/30 rounded-none">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-white font-semibold">{t.titulo}</div>
                      {t.detalhe && (
                        <div className="text-sm text-[#C0C0C0] mt-1">{t.detalhe}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-semibold ${
                        t.status === 'overdue' ? 'text-[#FF0066]' : 'text-[#6A0DAD]'
                      }`}>
                        {t.status === 'overdue' ? 'Atrasada' : 'Vence hoje'}
                      </div>
                      <div className="text-xs text-[#C0C0C0] mt-1">Prazo: {t.prazo}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export type { TaskItem };
export default TasksModal;
