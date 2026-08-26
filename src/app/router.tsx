import { createHashRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { CreateWorkOrderPage } from '../pages/CreateWorkOrderPage';
import { WorkOrderDetailPage } from '../pages/WorkOrderDetailPage';
import { BatchUploadPage } from '../pages/BatchUploadPage';
import { BatchesPage } from '../pages/BatchesPage';
import { BatchDetailPage } from '../pages/BatchDetailPage';
import { FeedbackPage } from '../pages/FeedbackPage';

// Hash-based routing: the Power Apps Vite plugin forces a relative asset base
// (`base: './'`) because the deployed app isn't served from the domain root —
// its hosting path is dynamic/non-root. createBrowserRouter matches routes
// against the literal location.pathname, which breaks under that hosting.
// createHashRouter only reads location.hash, so it's immune to whatever path
// prefix the host serves index.html under, in both local play and production.
export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'create', element: <CreateWorkOrderPage /> },
      { path: 'work-orders/:id', element: <WorkOrderDetailPage /> },
      { path: 'batch-upload', element: <BatchUploadPage /> },
      { path: 'batches', element: <BatchesPage /> },
      { path: 'batches/:id', element: <BatchDetailPage /> },
      { path: 'feedback', element: <FeedbackPage /> },
    ],
  },
]);
