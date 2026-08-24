'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook that returns true after component has mounted on the client,
 * preventing SSR hydration mismatches when reading browser state like localStorage.
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
