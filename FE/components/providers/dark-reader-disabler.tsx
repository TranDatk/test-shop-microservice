'use client';

import { useEffect } from 'react';

export function DarkReaderDisabler() {
  // Thêm script để vô hiệu hóa Dark Reader trên trang này
  useEffect(() => {
    const disableDarkReader = () => {
      // Tìm và vô hiệu hóa Dark Reader nếu nó tồn tại
      if (window.document.querySelector('meta[name="darkreader"]')) {
        // Thêm một meta tag để báo cho Dark Reader biết rằng trang này không nên bị sửa đổi
        const meta = document.createElement('meta');
        meta.name = 'darkreader-lock';
        document.head.appendChild(meta);
        
        // Cố gắng tắt Dark Reader theo cách thủ công nếu có thể
        const darkReaderToggle = document.querySelector('[id*="dark-reader"]');
        if (darkReaderToggle) {
          (darkReaderToggle as HTMLElement).click();
        }
      }
    };
    
    if (document.readyState === 'complete') {
      disableDarkReader();
    } else {
      window.addEventListener('load', disableDarkReader);
      return () => window.removeEventListener('load', disableDarkReader);
    }
  }, []);
  
  return null;
} 