'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { createVehiculeDepenseSchema, type CreateVehiculeDepenseDto, TYPE_DEPENSE_LABELS } from '@gestion-garage/shared-validators';
import { createVehiculeDepense, updateVehiculeDepense } from '@/lib/client-api';
import { todayISO } from '@/lib/formatters';

interface Props {
  defaultValues?: Partial<CreateVehiculeDepenseDto> & { id?: string };
}

/* ─── Custom dropdown ─── */
function TypeDropdown({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = value ? TYPE_DEPENSE_LABELS[value as keyof typeof TYPE_DEPENSE_LABELS] : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between input-base text-left"
      >
        <span className={selectedLabel ? 'text-neutral-800' : 'text-neutral-400'}>
          {selectedLabel ?? 'Sélectionner le type…'}
        </span>
        <ChevronDown
          size={14}
          className="text-neutral-400 transition-transform flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="absolute z-50 w-full mt-1.5 rounded-xl overflow-hidden bg-white"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(197,160,89,0.14)' }}
          >
            <div className="max-h-52 overflow-y-auto">
              {Object.entries(TYPE_DEPENSE_LABELS).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => { onChange(k); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: k === value ? '#A8863A' : '#374151',
                    backgroundColor: k === value ? 'rgba(197,160,89,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (k !== value) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8F7F4'; }}
                  onMouseLeave={(e) => { if (k !== value) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

/* ─── Main form ─── */
export default function VehiculeDepenseForm({ defaultValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!defaultValues?.id;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateVehiculeDepenseDto>({
    resolver: zodResolver(createVehiculeDepenseSchema),
    defaultValues: { date_depense: todayISO(), ...defaultValues },
  });

  const typeValue = watch('type_depense');

  const onSubmit = async (data: CreateVehiculeDepenseDto) => {
    setServerError(null);
    try {
      if (isEdit && defaultValues?.id) {
        await updateVehiculeDepense(defaultValues.id, data);
      } else {
        await createVehiculeDepense(data);
      }
      router.push('/admin/vehicule');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div
        className="rounded-2xl p-6 space-y-5 shadow-card"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(197,160,89,0.12)' }}
      >
        {/* Type */}
        <div>
          <label className="label-base">Type de dépense *</label>
          <TypeDropdown
            value={typeValue ?? ''}
            onChange={(v) => setValue('type_depense', v as CreateVehiculeDepenseDto['type_depense'], { shouldValidate: true })}
            error={errors.type_depense?.message}
          />
        </div>

        {/* Montant + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">Montant (DA) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="input-base"
              placeholder="0"
              {...register('montant', { valueAsNumber: true })}
            />
            {errors.montant && <p className="text-danger text-xs mt-1.5 font-medium">{errors.montant.message}</p>}
          </div>
          <div>
            <label className="label-base">Date *</label>
            <input type="date" className="input-base" {...register('date_depense')} />
            {errors.date_depense && <p className="text-danger text-xs mt-1.5 font-medium">{errors.date_depense.message}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label-base">Notes</label>
          <textarea
            rows={3}
            className="input-base resize-none"
            placeholder="Détails, prestataire, référence…"
            {...register('description')}
          />
          {errors.description && <p className="text-danger text-xs mt-1.5 font-medium">{errors.description.message}</p>}
        </div>
      </div>

      {serverError && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium text-danger"
          style={{ backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          {serverError}
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Enregistrer'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Annuler
        </button>
      </div>
    </form>
  );
}
