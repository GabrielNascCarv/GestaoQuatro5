import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { ListTodo } from 'lucide-react';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If already logged in, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8 select-none">
      <div className="max-w-md w-full">
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <ListTodo className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Gestão <span className="text-primary">Quatro5</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Gestão de Tarefas & Equipes
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-card p-8 rounded-2xl shadow-xl shadow-foreground/5 border border-border">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
