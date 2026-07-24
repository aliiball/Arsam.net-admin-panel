import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/lib/api/client';
import { listingKeys } from './queries';
import {
  formToPayload,
  type Listing,
  type ListingFormValues,
  type ModerationDecision,
  type ModerationInput,
} from '../schemas/listing';

const DECISION_STATUS: Record<ModerationDecision, Listing['status']> = {
  ok: 'active',
  uncertain: 'pending',
  nok: 'rejected',
};

const DECISION_TOAST: Record<ModerationDecision, string> = {
  ok: 'İlan onaylandı ve yayına alındı.',
  uncertain: 'İlan beklemede tutuldu (ek bilgi gerekli).',
  nok: 'İlan reddedildi.',
};

/** Optimistic moderation (OK / Uncertain / NOK) with rollback + toasts. */
export function useModerateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ModerationInput) => api.post<Listing>(`/listings/${id}/moderate`, input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: listingKeys.detail(id) });
      const previous = qc.getQueryData<Listing>(listingKeys.detail(id));
      if (previous) {
        qc.setQueryData<Listing>(listingKeys.detail(id), {
          ...previous,
          status: DECISION_STATUS[input.decision],
        });
      }
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (ctx?.previous) qc.setQueryData(listingKeys.detail(id), ctx.previous);
      toast.error('Moderasyon başarısız. Değişiklik geri alındı.');
    },
    onSuccess: (_data, input) => {
      toast.success(DECISION_TOAST[input.decision]);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
}

/** Create a listing from validated form values. */
export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: ListingFormValues) => api.post<Listing>('/listings', formToPayload(values)),
    onSuccess: (created) => {
      toast.success(`İlan oluşturuldu: ${created.title}`);
      void qc.invalidateQueries({ queryKey: listingKeys.all });
    },
    onError: () => toast.error('İlan oluşturulamadı.'),
  });
}
