import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { PlayerProvider } from './contexts/PlayerContext.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <PlayerProvider>
    <App />
  </PlayerProvider>
);

// Listener global para reavaliar missões quando tarefas mudam
try {
  window.addEventListener('tasks:changed', () => {
    try {
      const { evaluateAndApplyAllMissions } = require('@/services/missionService');
      evaluateAndApplyAllMissions();
    } catch (e) {
      console.warn('Falha ao reavaliar missões após tasks:changed', e);
    }
  });
} catch {}
