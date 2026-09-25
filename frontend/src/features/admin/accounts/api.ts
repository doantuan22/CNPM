import { apiClient } from '../../../services/apiClient';
import type { PaginatedApiResponse } from '../../../types/api';
import type {
  Account,
  AccountListQuery,
  UpdateAccountPayload,
  PaginationMeta,
} from '../../../types/auth';

export interface AccountListResult {
  items: Account[];
  pagination: PaginationMeta;
}

const buildQueryString = (query: AccountListQuery): string => {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.TrangThai) params.set('TrangThai', query.TrangThai);
  if (query.MaVaiTro) params.set('MaVaiTro', String(query.MaVaiTro));
  return params.toString();
};

export const listAccounts = async (query: AccountListQuery): Promise<AccountListResult> => {
  const res = await apiClient<Account[], PaginatedApiResponse<Account>>(
    `/admin/accounts?${buildQueryString(query)}`
  );
  return { items: res.data ?? [], pagination: res.pagination };
};

export const getAccount = async (id: number): Promise<Account> => {
  const res = await apiClient<Account>(`/admin/accounts/${id}`);
  return res.data as Account;
};

export const updateAccount = async (id: number, payload: UpdateAccountPayload): Promise<Account> => {
  const res = await apiClient<Account>(`/admin/accounts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data as Account;
};

export const lockAccount = async (id: number): Promise<Account> => {
  const res = await apiClient<Account>(`/admin/accounts/${id}/lock`, { method: 'POST' });
  return res.data as Account;
};

export const unlockAccount = async (id: number): Promise<Account> => {
  const res = await apiClient<Account>(`/admin/accounts/${id}/unlock`, { method: 'POST' });
  return res.data as Account;
};

export const deleteAccount = async (id: number): Promise<{ hardDeleted: boolean }> => {
  const res = await apiClient<{ hardDeleted: boolean }>(`/admin/accounts/${id}`, { method: 'DELETE' });
  return res.data as { hardDeleted: boolean };
};
