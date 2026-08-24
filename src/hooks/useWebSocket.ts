'use client';

import { useEffect } from 'react';
import { useStockStore } from '../store/useStockStore';
import { mockWebSocket, PriceUpdate } from '../services/mockWebSocket';

/**
 * Custom hook to manage live WebSocket subscription and update Zustand store
 */
export function useWebSocket() {
  const { updateStockPrices } = useStockStore();

  useEffect(() => {
    // Supplier function to provide current stocks snapshot to mock WebSocket
    const stocksSupplier = () => useStockStore.getState().stocks;

    // Start simulation with supplier
    mockWebSocket.startSimulation(stocksSupplier);

    // Subscribe to price update events
    const unsubscribe = mockWebSocket.subscribe((updates: PriceUpdate[]) => {
      updateStockPrices(updates);
    });

    // Cleanup simulation subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [updateStockPrices]);
}
