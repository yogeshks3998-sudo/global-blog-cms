import React from 'react';
import { createRoot } from 'react-dom/client';
import { GlobalBlogCMS } from './index';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: 32 }}>
      <GlobalBlogCMS
        apiUrl={import.meta.env.VITE_CMS_API_BASE_URL || 'http://127.0.0.1:5000/api'}
        apiKey={import.meta.env.VITE_CMS_API_KEY || ''}
      />
    </main>
  </React.StrictMode>
);
