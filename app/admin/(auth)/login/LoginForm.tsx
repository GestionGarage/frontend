'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginDto } from '@gestion-garage/shared-validators';
import { login, pingBackend, SLOW_REQUEST_THRESHOLD_MS } from '@/lib/client-api';
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2, Wifi } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const wakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Show the "server waking up" banner if the backend hasn't responded within the threshold.
    // This covers Render's free-tier cold start (~50 s) so the user isn't left in silence.
    wakeTimerRef.current = setTimeout(() => setIsWakingUp(true), SLOW_REQUEST_THRESHOLD_MS);

    pingBackend().then(() => {
      if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
      setIsWakingUp(false);
    });

    return () => {
      if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
    };
  }, []);

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
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Identifiants incorrects');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Server wake-up notice — appears only when Render cold-start exceeds 5 s */}
      {isWakingUp && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-xs"
          style={{
            backgroundColor: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            color: '#FCD34D',
          }}
        >
          <Wifi size={13} className="flex-shrink-0 mt-0.5 animate-pulse" />
          <span>
            Le serveur se réveille, cela peut prendre jusqu'à 1 minute lors de la première
            connexion…
          </span>
        </div>
      )}

      {/* Username */}
      <div>
        <label className="label-base" htmlFor="username">Identifiant</label>
        <div className="relative">
          <User
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
          />
          <input
            id="username"
            type="text"
            autoComplete="username"
            className="input-base pl-9"
            placeholder="Votre identifiant"
            {...register('username')}
          />
        </div>
        {errors.username && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <AlertCircle size={11} />
            {errors.username.message}
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
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="input-base pl-9 pr-10"
            placeholder="••••••••"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
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
          style={{
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#FCA5A5',
          }}
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
            {isWakingUp ? 'Démarrage du serveur…' : 'Connexion en cours…'}
          </>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  );
}
