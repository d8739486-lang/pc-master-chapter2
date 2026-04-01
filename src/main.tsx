import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { audioManager } from '@/core/audio'

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  if (target.closest('button')) {
    audioManager.click();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
