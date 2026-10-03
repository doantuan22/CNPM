import { apiClient } from '../../services/apiClient';
import type { ApiPaginationMeta, PaginatedApiResponse } from '../../types/api';
import type {
  AdminSupportDetail,
  AdminSupportListItem,
  AdminSupportListQuery,
  AdminUpdateSupportRequest,
  CreateSupportRequest,
  SupportRequest,
} from './types';

export const createSupportRequest = async (payload: CreateSupportRequest): Promise<SupportRequest> => {
  const res = await apiClient<SupportRequest>('/support', { method: 'POST', body: JSON.stringify(payload) });
  return res.data as SupportRequest;
};

export const listMySupportRequests = async (): Promise<SupportRequest[]> => {
  const res = await apiClient<SupportRequest[]>('/support');
  return res.data ?? [];
};

export const getMySupportRequest = async (id: number): Promise<SupportRequest> => {
  const res = await apiClient<SupportRequest>(`/support/${id}`);
  return res.data as SupportRequest;
};

const buildQuery = (query: AdminSupportListQuery): string => {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.search) params.set('search', query.search);
  if (query.trangThai) params.set('trangThai', query.trangThai);
  if (query.loaiYeuCau) params.set('loaiYeuCau', query.loaiYeuCau);
  return params.toString();
};

export const adminListSupportRequests = async (
  query: AdminSupportListQuery
): Promise<{ items: AdminSupportListItem[]; pagination: ApiPaginationMeta }> => {
  const res = await apiClient<AdminSupportListItem[], PaginatedApiResponse<AdminSupportListItem>>(
    `/admin/support?${buildQuery(query)}`
  );
  return { items: res.data ?? [], pagination: res.pagination };
};

export const adminGetSupportRequest = async (id: number): Promise<AdminSupportDetail> => {
  const res = await apiClient<AdminSupportDetail>(`/admin/support/${id}`);
  return res.data as AdminSupportDetail;
};

export const adminUpdateSupportRequest = async (id: number, payload: AdminUpdateSupportRequest): Promise<AdminSupportDetail> => {
  const res = await apiClient<AdminSupportDetail>(`/admin/support/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data as AdminSupportDetail;
};
