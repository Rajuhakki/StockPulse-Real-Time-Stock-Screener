import { create } from 'zustand';
import { Stock } from '../types';
import { STOCKS } from '../data/stocks';
import { PriceUpdate } from '../services/mockWebSocket';

export interface StockFilters {
  minPrice: number | null;
  maxPrice: number | null;
  minVolume: number | null;
  maxPE: number | null;
}

const DEFAULT_FILTERS: StockFilters = {
  minPrice: null,
  maxPrice: null,
  minVolume: null,
  maxPE: null,
};

export interface PriceChangeInfo {
  direction: 'up' | 'down';
  timestamp: number;
}

interface StockStore {
  stocks: Stock[];
  filtered: Stock[];
  filters: StockFilters;
  priceChanges: Record<string, PriceChangeInfo>;
  selectedStock: Stock | null;

  setFilters: (newFilters: Partial<StockFilters>) => void;
  resetFilters: () => void;
  updateStockPrices: (updates: PriceUpdate[]) => void;
  setSelectedStock: (stock: Stock | null) => void;
}

/**
 * Filter stocks according to active criteria
 */
function applyFilters(stocks: Stock[], filters: StockFilters): Stock[] {
  const { minPrice, maxPrice, minVolume, maxPE } = filters;

  return stocks.filter((stock) => {
    if (minPrice !== null && stock.price < minPrice) return false;
    if (maxPrice !== null && stock.price > maxPrice) return false;
    if (minVolume !== null && stock.volume < minVolume) return false;
    if (maxPE !== null && stock.pe > maxPE) return false;
    return true;
  });
}

export const useStockStore = create<StockStore>((set) => ({
  stocks: STOCKS,
  filtered: STOCKS,
  filters: DEFAULT_FILTERS,
  priceChanges: {},
  selectedStock: STOCKS[0] || null, // Default to first stock (AAPL)

  /**
   * Selects a stock to display in the technical chart panel
   */
  setSelectedStock: (stock: Stock | null) => {
    set({ selectedStock: stock });
  },

  /**
   * Updates partial or full filter parameters and recalculates filtered data
   */
  setFilters: (newFilters: Partial<StockFilters>) => {
    set((state) => {
      const updatedFilters: StockFilters = {
        ...state.filters,
        ...newFilters,
      };
      const filtered = applyFilters(state.stocks, updatedFilters);
      
      // Preserve or adjust selected stock
      let nextSelected = state.selectedStock;
      if (nextSelected && !filtered.some((s) => s.symbol === nextSelected?.symbol)) {
        nextSelected = filtered[0] || null;
      }

      return {
        filters: updatedFilters,
        filtered,
        selectedStock: nextSelected,
      };
    });
  },

  /**
   * Resets all filters to default state
   */
  resetFilters: () => {
    set((state) => ({
      filters: DEFAULT_FILTERS,
      filtered: state.stocks,
    }));
  },

  /**
   * Batch updates stock prices in real time immutably and tracks flash indicators
   */
  updateStockPrices: (updates: PriceUpdate[]) => {
    set((state) => {
      const updateMap = new Map<string, PriceUpdate>();
      const now = Date.now();
      const nextPriceChanges: Record<string, PriceChangeInfo> = { ...state.priceChanges };

      updates.forEach((u) => {
        updateMap.set(u.symbol, u);
        nextPriceChanges[u.symbol] = {
          direction: u.changeDirection,
          timestamp: now,
        };
      });

      // Update full stocks array immutably for updated items
      const nextStocks = state.stocks.map((stock) => {
        const u = updateMap.get(stock.symbol);
        if (u) {
          return {
            ...stock,
            price: u.newPrice,
          };
        }
        return stock;
      });

      // Re-apply filters efficiently to produce updated filtered array
      const nextFiltered = applyFilters(nextStocks, state.filters);

      // Update selected stock price if it was updated
      let nextSelected = state.selectedStock;
      if (nextSelected) {
        const selUpdate = updateMap.get(nextSelected.symbol);
        if (selUpdate) {
          nextSelected = { ...nextSelected, price: selUpdate.newPrice };
        }
      }

      return {
        stocks: nextStocks,
        filtered: nextFiltered,
        priceChanges: nextPriceChanges,
        selectedStock: nextSelected,
      };
    });
  },
}));
