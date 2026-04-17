'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitLogger() {
  const pathname = usePathname();

  useEffect(() => {
    const logVisit = async () => {
      try {
        await fetch('/api/stats/log-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer,
          }),
        });
      } catch (e) {
        // Silently fail
      }
    };

    logVisit();
  }, [pathname]);

  return null;
}
