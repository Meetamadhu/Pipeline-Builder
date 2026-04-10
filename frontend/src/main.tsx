import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from 'reactflow';
import App from './App';
import './index.css';
import { ToastProvider } from './components/ToastProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ReactFlowProvider>
  </React.StrictMode>,
);

