'use client';
import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <AlertCircle size={32} strokeWidth={2} />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Un problème est survenu</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        Nous n'avons pas pu charger cette page. Cela peut être dû à un problème de connexion ou à une erreur serveur.
      </p>

      <button
        onClick={reset}
        className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium shadow-sm"
      >
        <RefreshCcw size={18} />
        Réessayer
      </button>
    </div>
  );
}
