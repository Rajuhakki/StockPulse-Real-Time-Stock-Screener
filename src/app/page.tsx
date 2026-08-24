import React from 'react';
import { Filter } from '../components/Filter';
import { StockTable } from '../components/StockTable';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Header Container */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Step 1 Screener Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              StockPulse – Real-Time Stock Screener
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              High-performance stock discovery engine built with Next.js 14, TypeScript & Zustand.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>5,000 Stocks Loaded</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zustand State Active</span>
            </div>
          </div>
        </header>

        {/* Filter Component Section */}
        <section aria-label="Stock Screener Filters">
          <Filter />
        </section>

        {/* Stock Table Component Section */}
        <section aria-label="Stock Data Table">
          <StockTable />
        </section>
      </div>
    </main>
  );
}
