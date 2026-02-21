import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { setApiBaseUrl } from './services/api'
import App from './App'
import './index.css'

// Load runtime config (e.g. config.json on S3 with { "apiUrl": "http://alb-dns" })
function initConfig() {
  return fetch(`${import.meta.env.BASE_URL}config.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((c) => {
      if (c.apiUrl) setApiBaseUrl(c.apiUrl)
    })
    .catch(() => {})
}

const root = ReactDOM.createRoot(document.getElementById('root'))
initConfig().finally(() => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
})
