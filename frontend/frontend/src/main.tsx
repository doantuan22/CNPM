import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Icon fonts (the "ph ph-*" classes) are bundled from npm instead of a runtime <script> from a CDN.
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/fill';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/duotone';
import './index.css';
import App from './app/App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
