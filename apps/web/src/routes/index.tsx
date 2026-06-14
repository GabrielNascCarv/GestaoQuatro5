import { createBrowserRouter } from 'react-router-dom';
import { AuthLayout } from '../features/auth/components/AuthLayout';
import { Login } from '../features/auth/routes/Login';
import { Register } from '../features/auth/routes/Register';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Dashboard } from './Dashboard';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
]);
