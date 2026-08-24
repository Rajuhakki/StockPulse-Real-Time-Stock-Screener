'use client';

import { useEffect } from 'react';
import { useStockStore } from '../store/useStockStore';
import { useAlertStore } from '../store/useAlertStore';
import { mockWebSocket, PriceUpdate } from '../services/mockWebSocket';

/**
 * Custom hook to manage live WebSocket subscription and update Zustand store & alert checks
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
      // 1. Update stock prices in stock store
      updateStockPrices(updates);

      // 2. Check price updates against target alerts
      useAlertStore.getState().checkAlerts(updates);
    });

    // Cleanup simulation subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [updateStockPrices]);
}
