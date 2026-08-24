'use client';

import React from 'react';
import { useStockStore } from '../store/useStockStore';
import { useFilters } from '../hooks/useFilters';
import { Filter as FilterIcon, RotateCcw, DollarSign, BarChart3, PieChart } from 'lucide-react';

export const Filter: React.FC = React.memo(() => {
  const { filtered, stocks } = useStockStore();
  const { inputState, updateField, handleReset, hasActiveFilters } = useFilters(300);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-xl mb-6">
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FilterIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Multi-Criteria Stock Screener</h2>
            <p className="text-xs text-slate-400">
              Filter 5,000+ stocks in real time (&lt;200ms) with debounced inputs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            Total: {stocks.length.toLocaleString()}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
            Matching: {filtered.length.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grid of 4 Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Min Price */}
        <div>
          <label htmlFor="min-price" className="block text-xs font-medium text-slate-300 mb-1">
            Min Price ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <input
              id="min-price"
              type="number"
              min="0"
              placeholder="e.g. 10"
              value={inputState.minPrice}
              onChange={(e) => updateField('minPrice', e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="max-price" className="block text-xs font-medium text-slate-300 mb-1">
            Max Price ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            <input
              id="max-price"
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={inputState.maxPrice}
              onChange={(e) => updateField('maxPrice', e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Min Volume */}
        <div>
          <label htmlFor="min-volume" className="block text-xs font-medium text-slate-300 mb-1">
            Min Volume
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <input
              id="min-volume"
              type="number"
              min="0"
              placeholder="e.g. 1000000"
              value={inputState.minVolume}
              onChange={(e) => updateField('minVolume', e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Max P/E */}
        <div>
          <label htmlFor="max-pe" className="block text-xs font-medium text-slate-300 mb-1">
            Max P/E Ratio
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <PieChart className="w-3.5 h-3.5" />
            </div>
            <input
              id="max-pe"
              type="number"
              min="0"
              placeholder="e.g. 30"
              value={inputState.maxPE}
              onChange={(e) => updateField('maxPE', e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950/70 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Filters apply automatically after 300ms</span>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
});

Filter.displayName = 'Filter';
