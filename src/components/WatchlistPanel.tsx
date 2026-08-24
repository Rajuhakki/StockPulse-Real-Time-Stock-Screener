'use client';

import React from 'react';
import { useStockStore } from '../store/useStockStore';
import { useIsMounted } from '../hooks/useIsMounted';
import { Star, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

export const WatchlistPanel: React.FC = React.memo(() => {
  const isMounted = useIsMounted();
  const { stocks, watchlist, toggleWatchlist, setSelectedStock, selectedStock, priceChanges } =
    useStockStore();

  const watchlistStocks = isMounted
    ? stocks.filter((s) => watchlist.includes(s.symbol))
    : [];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <h2 className="text-sm font-semibold text-slate-100">Favorite Watchlist</h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
          {isMounted ? watchlistStocks.length : 0} saved
        </span>
      </div>

      {/* List Container */}
      <div className="p-3 max-h-[320px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {!isMounted ? (
          <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-1.5">
            <p className="text-xs text-slate-500">Loading watchlist...</p>
          </div>
        ) : watchlistStocks.length > 0 ? (
          watchlistStocks.map((stock) => {
            const isSelected = selectedStock?.symbol === stock.symbol;
            const priceInfo = priceChanges[stock.symbol];
            const isRecent = priceInfo && Date.now() - priceInfo.timestamp < 1200;

            let priceColor = 'text-slate-200';
            if (isRecent) {
              priceColor = priceInfo.direction === 'up' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold';
            }

            return (
              <div
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(stock.symbol);
                    }}
                    title="Remove from watchlist"
                    className="text-amber-400 hover:text-slate-400 transition-colors cursor-pointer p-0.5"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>

                  <div>
                    <span className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors font-sans text-sm block">
                      {stock.symbol}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Vol: {(stock.volume / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className={`text-sm block transition-colors ${priceColor}`}>
                      ${stock.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500">P/E: {stock.pe.toFixed(1)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(stock.symbol);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all cursor-pointer p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-1.5">
            <AlertCircle className="w-6 h-6 text-slate-600" />
            <p className="text-xs font-medium text-slate-400">No stocks in watchlist</p>
            <p className="text-[11px] text-slate-500">Click the ⭐ icon on any stock row to add it.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click stock to switch chart</span>
        <span className="flex items-center gap-1 text-amber-400">
          <TrendingUp className="w-3 h-3" /> Live Tracking
        </span>
      </div>
    </div>
  );
});

WatchlistPanel.displayName = 'WatchlistPanel';
