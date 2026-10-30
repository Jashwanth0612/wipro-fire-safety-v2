import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AdminSessionProvider } from './components/AdminSession'
import './index.css'
import './professional.css'
import './ivory-theme.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminSessionProvider><App /></AdminSessionProvider>
  </React.StrictMode>
)
