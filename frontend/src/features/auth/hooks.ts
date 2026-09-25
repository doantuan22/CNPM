import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authApi from './api';
import { applyAuthResult } from '../../services/apiClient';
import { useAuthStore } from '../../lib/authStore';
import type {
  RegisterPayload,
  LoginPayload,
  UpdateProfilePayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../../types/auth';

export const meQueryKey = ['auth', 'me'] as const;

export function useMe() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  return useQuery({
    queryKey: meQueryKey,
    queryFn: authApi.getMe,
    enabled: !isBootstrapping && !!accessToken,
    retry: false,
    staleTime: 1000 * 60,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (result) => {
      applyAuthResult(result);
      queryClient.setQueryData(meQueryKey, result.account);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (result) => {
      applyAuthResult(result);
      queryClient.setQueryData(meQueryKey, result.account);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clear();
      queryClient.removeQueries({ queryKey: meQueryKey });
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload) });
}

export function useResetPassword() {
  return useMutation({ mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload) });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateMe(payload),
    onSuccess: (account) => {
      queryClient.setQueryData(meQueryKey, account);
    },
  });
}
