import React from 'react';
import { Toaster, ToastBar } from 'react-hot-toast';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Global RTL Toaster */}
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{ className: 'rtl text-right', style: { direction: 'rtl' } }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center gap-2 flex-row-reverse" dir="rtl">
              <span className="shrink-0">{icon}</span>
              <span>{message}</span>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
    <App />
  </React.StrictMode>
);
