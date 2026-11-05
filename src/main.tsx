import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyThemeColor } from './lib/theme'
import { useUIStore } from './stores/ui.store'

// Apply the saved theme colour before the first paint (no purple flash on reload).
applyThemeColor(useUIStore.getState().themeColor)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
