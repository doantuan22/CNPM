import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as partnersApi from './api';
import type { ApplyPartnerPayload } from '../../types/auth';

const myApplicationKey = ['partners', 'me'] as const;

export function useMyPartnerApplication() {
  return useQuery({ queryKey: myApplicationKey, queryFn: partnersApi.getMyPartnerApplication });
}

export function useApplyPartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyPartnerPayload) => partnersApi.applyPartner(payload),
    onSuccess: (application) => queryClient.setQueryData(myApplicationKey, application),
  });
}
