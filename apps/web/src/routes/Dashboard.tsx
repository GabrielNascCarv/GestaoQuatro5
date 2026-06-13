import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/auth-store';
import { authApi } from '../features/auth/api/auth-api';
import { useState } from 'react';
import { toast } from 'sonner';
import { LogOut, ListTodo, User } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, refreshToken, clearAuth } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!refreshToken) {
      clearAuth();
      navigate('/login');
      return;
    }

    setIsLoggingOut(true);
    try {
      await authApi.logout(refreshToken);
      toast.success('Sessão encerrada com sucesso.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao encerrar sessão no Keycloak, limpando dados locais.');
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none">
      {/* Header / Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm shadow-foreground/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/10">
              <ListTodo className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Gestão <span className="text-primary">Quatro5</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-destructive hover:text-destructive-foreground hover:border-transparent cursor-pointer transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto px-4 py-16 w-full flex flex-col items-center justify-center">
        <div className="bg-card w-full p-8 rounded-2xl border border-border shadow-xl shadow-foreground/5 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Sessão Ativa</h2>
            <p className="text-sm text-muted-foreground">
              Você está autenticado no sistema. A integração com o Keycloak e banco local está funcionando perfeitamente.
            </p>
          </div>

          <div className="bg-background/80 p-4 rounded-xl border border-border/60 text-left space-y-2.5 text-sm">
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-semibold">{user.name}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">E-mail</span>
              <span className="font-semibold">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID do Usuário</span>
              <span className="font-mono text-xs truncate max-w-[160px]" title={user.id}>{user.id}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/95 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Fazer Logout</span>
          </button>
        </div>
      </main>
    </div>
  );
}
