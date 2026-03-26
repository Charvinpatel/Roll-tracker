import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'react-hot-toast';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster position="bottom-right" toastOptions={{
      style: { background: '#1e2230', color: '#e8eaf0', border: '1px solid #2a2f3e' },
      success: { iconTheme: { primary: '#2ecc71', secondary: '#000' } },
      error: { iconTheme: { primary: '#e74c3c', secondary: '#000' } },
    }}/>
  </React.StrictMode>
);
