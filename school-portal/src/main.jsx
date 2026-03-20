import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import InstallPrompt from './components/InstallPrompt.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <InstallPrompt />
    <App />
  </StrictMode>,
)
