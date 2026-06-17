'use client';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ isOpen, title, description, onCancel, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cdm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0"
            style={{ backgroundColor: 'rgba(15,23,42,0.60)', backdropFilter: 'blur(6px)', zIndex: 10000 }}
            onClick={onCancel}
          />

          <motion.div
            key="cdm-dialog"
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 10001 }}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 relative pointer-events-auto"
              style={{
                backgroundColor: '#FFFFFF',
                boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(220,38,38,0.08)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <X size={15} className="text-neutral-400" />
              </button>

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.12)' }}
              >
                <AlertTriangle size={22} style={{ color: '#DC2626' }} strokeWidth={1.8} />
              </div>

              <h3 className="text-base font-bold text-neutral-800 mb-1">Confirmer la suppression</h3>
              {title && (
                <p className="text-sm font-semibold text-neutral-600 mb-1">{title}</p>
              )}
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                {description ?? 'Cette action est irréversible et ne peut pas être annulée.'}
              </p>

              <div className="flex gap-3">
                <button onClick={onCancel} className="btn-secondary flex-1 text-sm">
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all duration-150 active:scale-[0.97]"
                  style={{ backgroundColor: '#DC2626' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B91C1C'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#DC2626'; }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
