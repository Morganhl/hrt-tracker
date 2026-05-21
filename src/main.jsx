import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker — auto-updates when you redeploy
const updateSW = registerSW({
  onNeedRefresh() {
    // New version deployed — prompt user to update
    if (confirm('New version available! Update now?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('HRT Tracker is ready to work offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
