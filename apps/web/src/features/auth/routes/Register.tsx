import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/auth-api';
import { useState } from 'react';
import { User, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().min(1, 'O e-mail é obrigatório.').email('Formato de e-mail inválido.'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success('Conta criada com sucesso! Faça login.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao registrar conta. Tente novamente.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-foreground">Crie sua conta</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre-se para gerenciar seus estoques e cardápios
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Nome Completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              autoComplete="name"
              disabled={isLoading}
              placeholder="Seu nome"
              {...register('name')}
              className={`w-full pl-10 pr-4 py-2.5 bg-background rounded-lg border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.name ? 'border-destructive focus:ring-destructive' : 'border-border'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

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
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              autoComplete="new-password"
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

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Confirmar Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              autoComplete="new-password"
              disabled={isLoading}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-4 py-2.5 bg-background rounded-lg border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.confirmPassword ? 'border-destructive focus:ring-destructive' : 'border-border'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.confirmPassword.message}
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
            'Registrar-se'
          )}
        </button>
      </form>

      {/* Login Redirect link */}
      <div className="text-center pt-2 border-t border-border/50">
        <p className="text-sm text-muted-foreground">
          Já possui uma conta?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
