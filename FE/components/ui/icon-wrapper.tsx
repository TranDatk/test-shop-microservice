'use client';

import React from 'react';

interface IconWrapperProps {
  children: React.ReactNode;
}

export function IconWrapper({ children }: IconWrapperProps) {
  // Sử dụng span với thuộc tính suppressHydrationWarning để bọc children
  // và thêm key để đảm bảo wrapper không gây ra vấn đề với hydration
  return (
    <span
      suppressHydrationWarning
      className="inline-flex" // Đảm bảo hiển thị inline như icon bình thường
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </span>
  );
} 