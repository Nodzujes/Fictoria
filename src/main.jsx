import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/main.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Для будущей капчи ключи сохраню пока здесь: sitekey: 6LeMTdsqAAAAAIjCEA7JL71tJ9vLOAQJftVBq1od secretKey: 6LeMTdsqAAAAAKrClj9hNFygUyDFKYkEvud0sRrJ