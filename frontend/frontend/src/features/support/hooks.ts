import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  adminGetSupportRequest,
  adminListSupportRequests,
  adminUpdateSupportRequest,
  createSupportRequest,
  getMySupportRequest,
  listMySupportRequests,
} from './api';
import type { AdminSupportListQuery, AdminUpdateSupportRequest, CreateSupportRequest } from './types';

export function useMySupportRequests() {
  return useQuery({ queryKey: ['support', 'mine'], queryFn: listMySupportRequests });
}

export function useMySupportRequest(id: number) {
  return useQuery({
    queryKey: ['support', 'mine', id],
    queryFn: () => getMySupportRequest(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateSupportRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupportRequest) => createSupportRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'mine'] });
    },
  });
}

export function useAdminSupportList(query: AdminSupportListQuery) {
  return useQuery({
    queryKey: ['admin', 'support', query],
    queryFn: () => adminListSupportRequests(query),
    placeholderData: keepPreviousData,
  });
}

export function useAdminSupportDetail(id: number) {
  return useQuery({
    queryKey: ['admin', 'support', 'detail', id],
    queryFn: () => adminGetSupportRequest(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useAdminUpdateSupportRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUpdateSupportRequest }) => adminUpdateSupportRequest(id, payload),
    onSuccess: (request) => {
      queryClient.setQueryData(['admin', 'support', 'detail', request.MaYeuCauHoTro], request);
      queryClient.invalidateQueries({ queryKey: ['admin', 'support'] });
    },
  });
}
