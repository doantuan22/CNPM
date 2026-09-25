import { apiClient } from '../../services/apiClient';
import type { PartnerApplication, ApplyPartnerPayload } from '../../types/auth';

export const applyPartner = async (payload: ApplyPartnerPayload): Promise<PartnerApplication> => {
  const res = await apiClient<PartnerApplication>('/partners/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data as PartnerApplication;
};

export const getMyPartnerApplication = async (): Promise<PartnerApplication | null> => {
  const res = await apiClient<PartnerApplication | null>('/partners/me');
  return res.data ?? null;
};
