import { create } from 'zustand';
import { Stock } from '../types';
import { STOCKS } from '../data/stocks';

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

interface StockStore {
  stocks: Stock[];
  filtered: Stock[];
  filters: StockFilters;
  setFilters: (newFilters: Partial<StockFilters>) => void;
  resetFilters: () => void;
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
      return {
        filters: updatedFilters,
        filtered,
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
}));
