import { apiClient } from '../../services/apiClient';
import type {
  Account,
  AuthResult,
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../../types/auth';

export const register = async (payload: RegisterPayload): Promise<AuthResult> => {
  const res = await apiClient<AuthResult>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data as AuthResult;
};

export const login = async (payload: LoginPayload): Promise<AuthResult> => {
  const res = await apiClient<AuthResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data as AuthResult;
};

export const logout = async (): Promise<void> => {
  await apiClient('/auth/logout', { method: 'POST' });
};

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<void> => {
  await apiClient('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) });
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await apiClient('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) });
};

export const getMe = async (): Promise<Account> => {
  const res = await apiClient<Account>('/profile/me');
  return res.data as Account;
};

export const updateMe = async (payload: UpdateProfilePayload): Promise<Account> => {
  const res = await apiClient<Account>('/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data as Account;
};
