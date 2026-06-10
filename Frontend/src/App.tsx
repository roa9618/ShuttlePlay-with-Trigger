import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router/routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router = {router} />
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  );
}