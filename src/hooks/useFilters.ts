'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useStockStore, StockFilters } from '../store/useStockStore';

export interface FilterInputState {
  minPrice: string;
  maxPrice: string;
  minVolume: string;
  maxPE: string;
}

const STORAGE_KEY = 'stockpulse_filters';

/**
 * Safely reads saved filters from URL parameters or localStorage
 */
function getInitialFilterValues(currentStoreFilters: StockFilters): FilterInputState {
  if (typeof window === 'undefined') {
    return {
      minPrice: currentStoreFilters.minPrice !== null ? currentStoreFilters.minPrice.toString() : '',
      maxPrice: currentStoreFilters.maxPrice !== null ? currentStoreFilters.maxPrice.toString() : '',
      minVolume: currentStoreFilters.minVolume !== null ? currentStoreFilters.minVolume.toString() : '',
      maxPE: currentStoreFilters.maxPE !== null ? currentStoreFilters.maxPE.toString() : '',
    };
  }

  // 1. Try reading from URL Query Parameters first
  const searchParams = new URLSearchParams(window.location.search);
  const urlMinPrice = searchParams.get('minPrice');
  const urlMaxPrice = searchParams.get('maxPrice');
  const urlMinVolume = searchParams.get('minVolume');
  const urlMaxPE = searchParams.get('maxPE');

  if (urlMinPrice || urlMaxPrice || urlMinVolume || urlMaxPE) {
    return {
      minPrice: urlMinPrice || '',
      maxPrice: urlMaxPrice || '',
      minVolume: urlMinVolume || '',
      maxPE: urlMaxPE || '',
    };
  }

  // 2. Fallback to localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        minPrice: parsed.minPrice !== null && parsed.minPrice !== undefined ? parsed.minPrice.toString() : '',
        maxPrice: parsed.maxPrice !== null && parsed.maxPrice !== undefined ? parsed.maxPrice.toString() : '',
        minVolume: parsed.minVolume !== null && parsed.minVolume !== undefined ? parsed.minVolume.toString() : '',
        maxPE: parsed.maxPE !== null && parsed.maxPE !== undefined ? parsed.maxPE.toString() : '',
      };
    }
  } catch (e) {
    console.error('Failed reading filters from localStorage', e);
  }

  return {
    minPrice: '',
    maxPrice: '',
    minVolume: '',
    maxPE: '',
  };
}

/**
 * Custom hook to manage debounced filter input state, URL params, and localStorage
 */
export function useFilters(debounceMs: number = 300) {
  const { filters, setFilters, resetFilters } = useStockStore();
  const [, startTransition] = useTransition();

  const [inputState, setInputState] = useState<FilterInputState>(() =>
    getInitialFilterValues(filters)
  );

  // Sync initial loaded parameters to Zustand store once on mount
  useEffect(() => {
    const initial = getInitialFilterValues(filters);
    const parsedMinPrice = initial.minPrice ? parseFloat(initial.minPrice) : null;
    const parsedMaxPrice = initial.maxPrice ? parseFloat(initial.maxPrice) : null;
    const parsedMinVolume = initial.minVolume ? parseFloat(initial.minVolume) : null;
    const parsedMaxPE = initial.maxPE ? parseFloat(initial.maxPE) : null;

    if (parsedMinPrice || parsedMaxPrice || parsedMinVolume || parsedMaxPE) {
      setFilters({
        minPrice: parsedMinPrice && !isNaN(parsedMinPrice) ? parsedMinPrice : null,
        maxPrice: parsedMaxPrice && !isNaN(parsedMaxPrice) ? parsedMaxPrice : null,
        minVolume: parsedMinVolume && !isNaN(parsedMinVolume) ? parsedMinVolume : null,
        maxPE: parsedMaxPE && !isNaN(parsedMaxPE) ? parsedMaxPE : null,
      });
    }

    // eslint-disable-next-deps
  }, []);

  // Debounced sync from local input state to Zustand store, URL query parameters, and localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      const parsedMinPrice = inputState.minPrice.trim() !== '' ? parseFloat(inputState.minPrice) : null;
      const parsedMaxPrice = inputState.maxPrice.trim() !== '' ? parseFloat(inputState.maxPrice) : null;
      const parsedMinVolume = inputState.minVolume.trim() !== '' ? parseFloat(inputState.minVolume) : null;
      const parsedMaxPE = inputState.maxPE.trim() !== '' ? parseFloat(inputState.maxPE) : null;

      const activeFilters: StockFilters = {
        minPrice: parsedMinPrice !== null && !isNaN(parsedMinPrice) ? parsedMinPrice : null,
        maxPrice: parsedMaxPrice !== null && !isNaN(parsedMaxPrice) ? parsedMaxPrice : null,
        minVolume: parsedMinVolume !== null && !isNaN(parsedMinVolume) ? parsedMinVolume : null,
        maxPE: parsedMaxPE !== null && !isNaN(parsedMaxPE) ? parsedMaxPE : null,
      };

      startTransition(() => {
        setFilters(activeFilters);
      });

      // Sync with localStorage & URL params in browser
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(activeFilters));

          const params = new URLSearchParams();
          if (activeFilters.minPrice !== null) params.set('minPrice', activeFilters.minPrice.toString());
          if (activeFilters.maxPrice !== null) params.set('maxPrice', activeFilters.maxPrice.toString());
          if (activeFilters.minVolume !== null) params.set('minVolume', activeFilters.minVolume.toString());
          if (activeFilters.maxPE !== null) params.set('maxPE', activeFilters.maxPE.toString());

          const searchStr = params.toString();
          const newUrl = searchStr
            ? `${window.location.pathname}?${searchStr}`
            : window.location.pathname;

          window.history.replaceState(null, '', newUrl);
        } catch (e) {
          console.error('Failed updating URL or localStorage filters', e);
        }
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [inputState, setFilters, debounceMs]);

  const updateField = useCallback((field: keyof FilterInputState, value: string) => {
    setInputState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setInputState({
      minPrice: '',
      maxPrice: '',
      minVolume: '',
      maxPE: '',
    });
    resetFilters();

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        console.error('Failed clearing URL or localStorage filters', e);
      }
    }
  }, [resetFilters]);

  const hasActiveFilters =
    inputState.minPrice !== '' ||
    inputState.maxPrice !== '' ||
    inputState.minVolume !== '' ||
    inputState.maxPE !== '';

  return {
    inputState,
    updateField,
    handleReset,
    hasActiveFilters,
  };
}
