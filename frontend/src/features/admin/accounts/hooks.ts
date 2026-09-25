import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import * as accountsApi from './api';
import type { AccountListQuery, UpdateAccountPayload } from '../../../types/auth';

const listKey = (query: AccountListQuery) => ['admin', 'accounts', query] as const;
const detailKey = (id: number) => ['admin', 'accounts', 'detail', id] as const;

export function useAccountList(query: AccountListQuery) {
  return useQuery({
    queryKey: listKey(query),
    queryFn: () => accountsApi.listAccounts(query),
    placeholderData: keepPreviousData,
  });
}

export function useAccountDetail(id: number | null) {
  return useQuery({
    queryKey: detailKey(id ?? -1),
    queryFn: () => accountsApi.getAccount(id as number),
    enabled: id !== null,
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAccountPayload }) =>
      accountsApi.updateAccount(id, payload),
    onSuccess: (account) => {
      queryClient.setQueryData(detailKey(account.MaTaiKhoan), account);
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

export function useLockAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountsApi.lockAccount(id),
    onSuccess: (account) => {
      queryClient.setQueryData(detailKey(account.MaTaiKhoan), account);
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

export function useUnlockAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountsApi.unlockAccount(id),
    onSuccess: (account) => {
      queryClient.setQueryData(detailKey(account.MaTaiKhoan), account);
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => accountsApi.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}
