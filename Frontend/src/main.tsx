import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

const canRegisterServiceWorker = (
  import.meta.env.PROD
  || window.location.hostname === 'localhost'
  || window.location.hostname === '127.0.0.1'
);

createRoot(document.getElementById('root')!).render(<App />);

if (canRegisterServiceWorker && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}
