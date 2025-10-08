import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { PlayerProvider } from './contexts/PlayerContext.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <PlayerProvider>
    <App />
  </PlayerProvider>
);
