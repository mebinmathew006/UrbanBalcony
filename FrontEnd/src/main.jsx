import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import store from './store/store.js';

const clientId = '489008736122-if0fclbj37c8m0p04ksq1p71crng8g2k.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  
  
  <Provider store={store}>
  <GoogleOAuthProvider clientId={clientId}>
  {/* <StrictMode> */}
    <App />
  {/* </StrictMode> */}
  </GoogleOAuthProvider>
  </Provider>
  
)
