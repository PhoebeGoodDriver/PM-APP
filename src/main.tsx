import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { FluentProvider } from '@fluentui/react-components';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { router } from './app/router';
import { fedexTheme } from './theme/fedexTheme';
import { queryClient } from './lib/queryClient';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={fedexTheme}>
        <RouterProvider router={router} />
      </FluentProvider>
    </QueryClientProvider>
  </StrictMode>,
);
