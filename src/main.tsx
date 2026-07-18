import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/unbounded/wght.css'
import '@fontsource-variable/commissioner/wght.css'
import { DemoDataProvider } from './data/DemoDataContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DemoDataProvider>
        <App />
      </DemoDataProvider>
    </BrowserRouter>
  </StrictMode>,
)
