import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

const THEME_COLOR = '#FDF6E9'
document.documentElement.style.colorScheme = 'only light'
document.documentElement.classList.toggle(
  'is-ios',
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
)
document.documentElement.classList.toggle(
  'is-standalone',
  window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone),
)
document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
  meta.setAttribute('content', THEME_COLOR)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
