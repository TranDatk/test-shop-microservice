'use client';

import React, { forwardRef, SVGProps } from 'react';

export const SafeSVG = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => {
  return (
    <svg
      {...props}
      ref={ref}
      suppressHydrationWarning={true}
    />
  );
}); 