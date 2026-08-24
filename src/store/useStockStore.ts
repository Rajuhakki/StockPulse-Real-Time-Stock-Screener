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
  watchlist: string[];

  setFilters: (newFilters: Partial<StockFilters>) => void;
  resetFilters: () => void;
  updateStockPrices: (updates: PriceUpdate[]) => void;
  setSelectedStock: (stock: Stock | null) => void;
  toggleWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
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

/**
 * Helper to safely read initial watchlist from localStorage
 */
function getInitialWatchlist(): string[] {
  if (typeof window === 'undefined') return ['AAPL', 'NVDA', 'MSFT', 'TSLA'];
  try {
    const saved = localStorage.getItem('stockpulse_watchlist');
    return saved ? JSON.parse(saved) : ['AAPL', 'NVDA', 'MSFT', 'TSLA'];
  } catch {
    return ['AAPL', 'NVDA', 'MSFT', 'TSLA'];
  }
}

export const useStockStore = create<StockStore>((set, get) => ({
  stocks: STOCKS,
  filtered: STOCKS,
  filters: DEFAULT_FILTERS,
  priceChanges: {},
  selectedStock: STOCKS[0] || null,
  watchlist: getInitialWatchlist(),

  /**
   * Selects a stock to display in the technical chart panel
   */
  setSelectedStock: (stock: Stock | null) => {
    set({ selectedStock: stock });
  },

  /**
   * Toggles a stock symbol in the watchlist and persists to localStorage
   */
  toggleWatchlist: (symbol: string) => {
    set((state) => {
      const exists = state.watchlist.includes(symbol);
      const nextWatchlist = exists
        ? state.watchlist.filter((s) => s !== symbol)
        : [...state.watchlist, symbol];

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('stockpulse_watchlist', JSON.stringify(nextWatchlist));
        } catch (e) {
          console.error('Failed to save watchlist to localStorage', e);
        }
      }

      return { watchlist: nextWatchlist };
    });
  },

  /**
   * Checks if a symbol is in the current watchlist
   */
  isInWatchlist: (symbol: string) => {
    return get().watchlist.includes(symbol);
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

      const nextFiltered = applyFilters(nextStocks, state.filters);

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
