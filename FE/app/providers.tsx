'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { DarkReaderDisabler } from '@/components/providers/dark-reader-disabler';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DarkReaderDisabler />
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
} 