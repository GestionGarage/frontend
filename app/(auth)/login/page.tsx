import LoginForm from './LoginForm';
import { Anvil } from 'lucide-react';

export const metadata= { title: 'Connexion' };

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#07080D' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Amber radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              boxShadow: '0 0 24px rgba(245,158,11,0.3), 0 0 48px rgba(245,158,11,0.1)',
            }}
          >
            <Anvil size={22} className="text-neutral-900" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-100 tracking-tight">FORGE</h1>
          <p className="text-xs text-neutral-600 tracking-[0.2em] uppercase mt-1.5">ERP Ferronnier</p>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-7"
          style={{
            backgroundColor: 'rgba(12,13,20,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          <div className="mb-6">
            <h2 className="text-base font-semibold text-neutral-200">Accès administrateur</h2>
            <p className="text-xs text-neutral-600 mt-0.5">Connectez-vous à votre tableau de bord</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
