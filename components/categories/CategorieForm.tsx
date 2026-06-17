'use client';
import { useState, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Link2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createCategorieSchema, type CreateCategorieDto } from '@gestion-garage/shared-validators';
import { createCategorie, updateCategorie, uploadCategorieImage } from '@/lib/client-api';
import OptionEditor from './OptionEditor';

interface Props {
  defaultValues?: Partial<CreateCategorieDto> & { id?: string };
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
      className="flex items-center gap-3 group"
    >
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ease-in-out"
        style={{
          border: checked ? '2px solid #C5A059' : '2px solid #D1D5DB',
          backgroundColor: checked ? 'rgba(197,160,89,0.10)' : '#FFFFFF',
          boxShadow: checked ? '0 0 0 3px rgba(197,160,89,0.10)' : 'none',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="#C5A059"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className="text-sm font-medium transition-colors duration-200"
        style={{ color: checked ? '#A8863A' : '#374151' }}
      >
        {label}
      </span>
    </button>
  );
}

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategorieForm({ defaultValues }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.image_url ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategorieDto>({
    resolver: zodResolver(createCategorieSchema),
    defaultValues: { is_active: true, ordre: 0, options: [], ...defaultValues },
  });

  const nomValue = useWatch({ control, name: 'nom' }) ?? '';
  const slug = toSlug(nomValue);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: CreateCategorieDto) => {
    setServerError(null);
    try {
      let savedId: string;
      if (isEdit && defaultValues?.id) {
        await updateCategorie(defaultValues.id, data);
        savedId = defaultValues.id;
      } else {
        const res = await createCategorie(data) as { data: { id: string } };
        savedId = res.data.id;
      }

      if (imageFile) {
        await uploadCategorieImage(savedId, imageFile);
      }

      router.push('/categories');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="card space-y-4">
        <div>
          <label className="label-base">Nom de la catégorie *</label>
          <input className="input-base" placeholder="Penderie de vêtements" {...register('nom')} />
          {slug && (
            <div className="flex items-center gap-1.5 mt-1.5 px-1">
              <Link2 size={10} className="text-neutral-300 flex-shrink-0" />
              <span className="text-xs font-mono text-neutral-300 truncate">/categories/{slug}</span>
            </div>
          )}
          {errors.nom && <p className="text-danger text-sm mt-1">{errors.nom.message}</p>}
        </div>

        <div>
          <label className="label-base">Description</label>
          <textarea rows={2} className="input-base resize-none" {...register('description')} />
        </div>

        <div>
          <label className="label-base">Image principale</label>
          <div
            className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Aperçu" className="max-h-40 mx-auto rounded-lg object-contain" />
            ) : (
              <div>
                <p className="text-neutral-400 text-sm">Cliquer pour sélectionner une image</p>
                <p className="text-neutral-300 text-xs mt-1">WebP, JPEG, PNG — max 2 MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <PremiumCheckbox
              checked={!!field.value}
              onChange={field.onChange}
              label="Catégorie active"
            />
          )}
        />
      </div>

      {/* Options */}
      <div className="card">
        <OptionEditor control={control} register={register} errors={errors} />
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger">{serverError}</div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer la catégorie'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">Annuler</button>
      </div>
    </form>
  );
}
