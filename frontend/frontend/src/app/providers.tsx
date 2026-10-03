import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { queryClient } from '../lib/queryClient';
import { useAuthBootstrap } from '../features/auth/useAuthBootstrap';
import { FeedbackProvider } from '../components/common/FeedbackProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FeedbackProvider>
          <AuthBootstrap>{children}</AuthBootstrap>
        </FeedbackProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
