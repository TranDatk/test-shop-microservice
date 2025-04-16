'use client';

import React, { forwardRef } from 'react';
import { LucideProps } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { SafeSVG } from './safe-svg';

const createSafeIcon = (Icon: React.FC<LucideProps>) => {
  return forwardRef<SVGSVGElement, LucideProps>((props, ref) => {
    const { color = 'currentColor', size = 24, strokeWidth = 2, ...restProps } = props;
    
    // Get the original rendered JSX from Lucide
    const originalJSX = Icon({ color, size, strokeWidth, ...restProps });
    
    // Extract props from the original SVG element
    if (React.isValidElement(originalJSX)) {
      const { 
        children, 
        viewBox, 
        xmlns, 
        width, 
        height, 
        fill, 
        stroke, 
        strokeWidth: sw, 
        strokeLinecap, 
        strokeLinejoin, 
        className 
      } = originalJSX.props;
      
      // Return our Safe SVG with the same props and children
      return (
        <SafeSVG
          ref={ref}
          xmlns={xmlns}
          viewBox={viewBox}
          width={width}
          height={height}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap={strokeLinecap}
          strokeLinejoin={strokeLinejoin}
          className={className}
          {...restProps}
        >
          {children}
        </SafeSVG>
      );
    }
    
    // Fallback to original if something went wrong
    return originalJSX;
  });
};

// Create safe versions of all Lucide icons
const icons = Object.entries(LucideIcons).reduce((acc, [name, Icon]) => {
  if (name === 'createLucideIcon') return acc;
  acc[name] = createSafeIcon(Icon as React.FC<LucideProps>);
  return acc;
}, {} as Record<string, React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>>);

export const {
  Menu,
  Search,
  ShoppingCart,
  User,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  // Thêm các icon khác mà bạn cần ở đây
} = icons; 