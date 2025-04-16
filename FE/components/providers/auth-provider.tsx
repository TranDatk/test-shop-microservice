'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Không gọi checkAuth trên các trang xác thực để tránh vòng lặp vô hạn
    const isAuthPage = pathname?.startsWith('/auth/');
    if (!isAuthPage) {
      checkAuth();
    }
  }, [checkAuth, pathname]);

  return <>{children}</>;
} 