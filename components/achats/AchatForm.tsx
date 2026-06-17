'use client';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { z } from 'zod';
import { TypeMateriauEnum, TYPE_MATERIAU_LABELS, type CreateAchatDto } from '@gestion-garage/shared-validators';
import { createAchat, updateAchat } from '@/lib/client-api';
import { todayISO } from '@/lib/formatters';

/* ─── Simplified UI schema (hides désignation/quantité/unité/fournisseur) ─── */
const achatUISchema = z.object({
  type_materiau: TypeMateriauEnum,
  prix_total:    z.number().positive('Prix total requis'),
  date_achat:    z.string().date('Date invalide'),
  notes:         z.string().max(1000).optional().nullable(),
});
type AchatUIForm = z.infer<typeof achatUISchema>;

interface Props {
  defaultValues?: Partial<CreateAchatDto> & { id?: string };
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

  const selectedLabel = value ? TYPE_MATERIAU_LABELS[value as keyof typeof TYPE_MATERIAU_LABELS] : null;

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
              {Object.entries(TYPE_MATERIAU_LABELS).map(([k, label]) => (
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
export default function AchatForm({ defaultValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!defaultValues?.id;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<AchatUIForm>({
    resolver: zodResolver(achatUISchema),
    defaultValues: {
      date_achat: todayISO(),
      prix_total: defaultValues?.prix_unitaire ?? undefined,
    },
  });

  const typeValue = watch('type_materiau');

  const onSubmit = async (data: AchatUIForm) => {
    setServerError(null);
    /* Transform UI form → CreateAchatDto: use prix_total as prix_unitaire with quantite=1 */
    const payload: CreateAchatDto = {
      type_materiau: data.type_materiau,
      designation:   'Achat',
      quantite:      1,
      unite:         'unite',
      prix_unitaire: data.prix_total,
      date_achat:    data.date_achat,
      notes:         data.notes ?? undefined,
    };
    try {
      if (isEdit && defaultValues?.id) {
        await updateAchat(defaultValues.id, payload);
      } else {
        await createAchat(payload);
      }
      router.push('/admin/achats');
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
          <label className="label-base">Type de matériau *</label>
          <TypeDropdown
            value={typeValue ?? ''}
            onChange={(v) => setValue('type_materiau', v as AchatUIForm['type_materiau'], { shouldValidate: true })}
            error={errors.type_materiau?.message}
          />
        </div>

        {/* Prix total */}
        <div>
          <label className="label-base">Prix total (DA) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="input-base"
            placeholder="0"
            {...register('prix_total', { valueAsNumber: true })}
          />
          {errors.prix_total && <p className="text-danger text-xs mt-1.5 font-medium">{errors.prix_total.message}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="label-base">Date d'achat *</label>
          <input type="date" className="input-base" {...register('date_achat')} />
          {errors.date_achat && <p className="text-danger text-xs mt-1.5 font-medium">{errors.date_achat.message}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="label-base">Notes</label>
          <textarea rows={2} className="input-base resize-none" placeholder="Remarques…" {...register('notes')} />
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
