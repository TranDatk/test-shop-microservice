'use client';

import React from 'react';
import { LucideProps } from 'lucide-react';
import { IconWrapper } from './icon-wrapper';

interface LucideIconProps extends LucideProps {
  icon: React.ElementType;
}

export function LucideIcon({ icon: Icon, ...props }: LucideIconProps) {
  return (
    <IconWrapper>
      <Icon {...props} />
    </IconWrapper>
  );
} 