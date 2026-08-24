'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useStockStore, StockFilters } from '../store/useStockStore';

export interface FilterInputState {
  minPrice: string;
  maxPrice: string;
  minVolume: string;
  maxPE: string;
}

/**
 * Custom hook to manage debounced filter input state and sync with Zustand store
 */
export function useFilters(debounceMs: number = 300) {
  const { filters, setFilters, resetFilters } = useStockStore();
  const [, startTransition] = useTransition();

  const [inputState, setInputState] = useState<FilterInputState>({
    minPrice: filters.minPrice !== null ? filters.minPrice.toString() : '',
    maxPrice: filters.maxPrice !== null ? filters.maxPrice.toString() : '',
    minVolume: filters.minVolume !== null ? filters.minVolume.toString() : '',
    maxPE: filters.maxPE !== null ? filters.maxPE.toString() : '',
  });

  // Sync inputs if global filters reset externally
  useEffect(() => {
    setInputState({
      minPrice: filters.minPrice !== null ? filters.minPrice.toString() : '',
      maxPrice: filters.maxPrice !== null ? filters.maxPrice.toString() : '',
      minVolume: filters.minVolume !== null ? filters.minVolume.toString() : '',
      maxPE: filters.maxPE !== null ? filters.maxPE.toString() : '',
    });
  }, [filters]);

  // Debounced sync from local input state to Zustand store
  useEffect(() => {
    const handler = setTimeout(() => {
      const parsedMinPrice = inputState.minPrice.trim() !== '' ? parseFloat(inputState.minPrice) : null;
      const parsedMaxPrice = inputState.maxPrice.trim() !== '' ? parseFloat(inputState.maxPrice) : null;
      const parsedMinVolume = inputState.minVolume.trim() !== '' ? parseFloat(inputState.minVolume) : null;
      const parsedMaxPE = inputState.maxPE.trim() !== '' ? parseFloat(inputState.maxPE) : null;

      startTransition(() => {
        setFilters({
          minPrice: parsedMinPrice !== null && !isNaN(parsedMinPrice) ? parsedMinPrice : null,
          maxPrice: parsedMaxPrice !== null && !isNaN(parsedMaxPrice) ? parsedMaxPrice : null,
          minVolume: parsedMinVolume !== null && !isNaN(parsedMinVolume) ? parsedMinVolume : null,
          maxPE: parsedMaxPE !== null && !isNaN(parsedMaxPE) ? parsedMaxPE : null,
        });
      });
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
