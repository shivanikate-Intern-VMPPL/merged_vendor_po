// Force a single canonical URL: anyone landing on the Firebase default
// domain is sent to the real domain before the app even loads.
if (window.location.hostname === 'mulyam-purchase.web.app') {
  window.location.replace(
    'https://purchase.mulyam.in' + window.location.pathname + window.location.search + window.location.hash
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)