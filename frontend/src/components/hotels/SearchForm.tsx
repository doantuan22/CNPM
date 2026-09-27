import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { searchFormSchema, SearchFormValues, defaultSearchDates } from '../../features/hotels/schemas';

interface SearchFormProps {
  initialValues?: Partial<SearchFormValues>;
  onSubmit: (values: SearchFormValues) => void;
  compact?: boolean;
}

export function SearchForm({ initialValues, onSubmit, compact = false }: SearchFormProps) {
  const defaults = defaultSearchDates();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      location: initialValues?.location ?? '',
      checkIn: initialValues?.checkIn ?? defaults.checkIn,
      checkOut: initialValues?.checkOut ?? defaults.checkOut,
      guests: initialValues?.guests ?? 1,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={compact ? 'rounded-2xl border border-white/60 bg-white p-4 shadow-xl shadow-slate-950/10 sm:p-5' : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="lg:col-span-2">
          <label htmlFor="search-location" className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
            <MapPin className="h-3.5 w-3.5" /> Địa điểm
          </label>
          <Input
            id="search-location"
            type="text"
            placeholder="Thành phố, tỉnh..."
            {...register('location')}
          />
        </div>

        <div>
          <label htmlFor="search-checkIn" className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
            <Calendar className="h-3.5 w-3.5" /> Nhận phòng
          </label>
          <Input id="search-checkIn" type="date" error={errors.checkIn?.message} {...register('checkIn')} />
        </div>

        <div>
          <label htmlFor="search-checkOut" className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
            <Calendar className="h-3.5 w-3.5" /> Trả phòng
          </label>
          <Input id="search-checkOut" type="date" error={errors.checkOut?.message} {...register('checkOut')} />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="search-guests" className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600">
              <Users className="h-3.5 w-3.5" /> Khách
            </label>
            <Input id="search-guests" type="number" min={1} max={50} {...register('guests')} />
          </div>
          <Button type="submit" className="self-end sm:min-w-28">
            <Search className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Tìm kiếm</span>
          </Button>
        </div>
      </div>
      {errors.guests && <p className="mt-1 text-xs text-red-600">{errors.guests.message}</p>}
    </form>
  );
}
