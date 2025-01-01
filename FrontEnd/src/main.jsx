import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = '489008736122-if0fclbj37c8m0p04ksq1p71crng8g2k.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={clientId}>
  <StrictMode>
    <App />
  </StrictMode>
  </GoogleOAuthProvider>,
)
