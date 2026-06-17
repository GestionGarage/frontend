'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginDto } from '@gestion-garage/shared-validators';
import { login } from '@/lib/client-api';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    setServerError(null);
    try {
      await login(data);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Identifiants incorrects');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div>
        <label className="label-base" htmlFor="email">Adresse email</label>
        <div className="relative">
          <Mail
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
          />
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input-base pl-9"
            placeholder="admin@ferronnier.dz"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <AlertCircle size={11} />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="label-base" htmlFor="password">Mot de passe</label>
        <div className="relative">
          <Lock
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
          />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input-base pl-9"
            placeholder="••••••••"
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <AlertCircle size={11} />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-xs"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5' }}
        >
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  );
}
