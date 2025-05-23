import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WebAppProvider } from '@vkruglikov/react-telegram-web-app';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <WebAppProvider>
    <App />
  </WebAppProvider>
); 