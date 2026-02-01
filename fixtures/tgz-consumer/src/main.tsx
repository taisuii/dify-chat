import { ThemeContextProvider } from '@dify-chat/theme'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './libs/i18n'
import './theme-vars.css'

const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeContextProvider>
        <App />
      </ThemeContextProvider>
    </React.StrictMode>,
  )
}
