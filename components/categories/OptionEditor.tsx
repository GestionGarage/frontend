'use client';
import {
  useFieldArray,
  Controller,
  type Path,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from 'react-hook-form';
import type { CreateCategorieDto } from '@gestion-garage/shared-validators';

interface Props {
  control: Control<CreateCategorieDto>;
  register: UseFormRegister<CreateCategorieDto>;
  errors: FieldErrors<CreateCategorieDto>;
}

function PremiumCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-1.5 select-none"
    >
      <span
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200 ease-in-out"
        style={{
          border: checked ? '1.5px solid #C5A059' : '1.5px solid #D1D5DB',
          backgroundColor: checked ? 'rgba(197,160,89,0.10)' : '#FFFFFF',
        }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path
              d="M1 3L3 5L7 1"
              stroke="#C5A059"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className="text-sm transition-colors duration-200"
        style={{ color: checked ? '#A8863A' : '#6B7280' }}
      >
        {label}
      </span>
    </button>
  );
}

export default function OptionEditor({ control, register, errors }: Props) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'options',
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      move(sourceIndex, targetIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="label-base mb-0">Options / Modèles</span>
        <button
          type="button"
          onClick={() => append({ label: '', is_sur_mesure: false, is_active: true, ordre: fields.length })}
          className="btn-secondary text-sm py-1"
        >
          + Ajouter
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-neutral-400 italic">Aucune option — catégorie à forme libre</p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const optErrors = errors.options?.[index];
          return (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
              className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 cursor-grab active:cursor-grabbing"
            >
              <svg className="mt-2.5 h-4 w-4 shrink-0 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>

              <div className="flex-1 grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    className="input-base text-sm"
                    placeholder="Libellé option..."
                    {...register(`options.${index}.label`)}
                  />
                  {optErrors?.label && (
                    <p className="text-danger text-xs mt-0.5">{optErrors.label.message as string}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Controller
                    control={control}
                    name={`options.${index}.is_sur_mesure` as Path<CreateCategorieDto>}
                    render={({ field: f }) => (
                      <PremiumCheckbox
                        checked={!!f.value}
                        onChange={f.onChange}
                        label="Sur mesure"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`options.${index}.is_active` as Path<CreateCategorieDto>}
                    render={({ field: f }) => (
                      <PremiumCheckbox
                        checked={!!f.value}
                        onChange={f.onChange}
                        label="Active"
                      />
                    )}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="text-neutral-400 hover:text-danger transition-colors mt-1.5"
                aria-label="Supprimer l'option"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
