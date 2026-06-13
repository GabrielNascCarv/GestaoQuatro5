import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../stores/auth-store';
import { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório.').email('Formato de e-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface DecodedToken {
  sub: string;
  name?: string;
  email?: string;
  preferred_username?: string;
}

export function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const tokens = await authApi.login(data);
      
      // Decode JWT to extract user information
      const decoded = jwtDecode<DecodedToken>(tokens.accessToken);
      const user = {
        id: decoded.sub,
        name: decoded.name || decoded.preferred_username || 'Usuário',
        email: decoded.email || data.email,
        created_at: new Date().toISOString(),
      };

      setAuth(user, tokens.accessToken, tokens.refreshToken);
      toast.success(`Bem-vindo de volta, ${user.name}!`);
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Credenciais inválidas. Verifique os dados.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-foreground">Acesse sua conta</h2>
        <p className="text-sm text-muted-foreground">
          Entre com seu e-mail e senha para gerenciar o sistema
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              autoComplete="email"
              disabled={isLoading}
              placeholder="seu-email@exemplo.com"
              {...register('email')}
              className={`w-full pl-10 pr-4 py-2.5 bg-background rounded-lg border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.email ? 'border-destructive focus:ring-destructive' : 'border-border'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Senha
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full pl-10 pr-4 py-2.5 bg-background rounded-lg border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.password ? 'border-destructive focus:ring-destructive' : 'border-border'
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Register Redirect link */}
      <div className="text-center pt-2 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          Ainda não possui uma conta?{' '}
          <Link
            to="/register"
            className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-0.5"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
