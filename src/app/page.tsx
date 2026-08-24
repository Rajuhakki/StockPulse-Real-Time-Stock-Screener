'use client';

import React from 'react';
import Link from 'next/link';
import { Filter } from '../components/Filter';
import { StockTable } from '../components/StockTable';
import { StockChart } from '../components/StockChart';
import { WatchlistPanel } from '../components/WatchlistPanel';
import { AlertPanel } from '../components/AlertPanel';
import { ToastContainer } from '../components/ToastContainer';
import { useWebSocket } from '../hooks/useWebSocket';
import { Activity, Radio, LineChart, User } from 'lucide-react';

export default function Home() {
  // Activate live mock WebSocket updates subscription and price alerts engine
  useWebSocket();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification Container */}
      <ToastContainer />

      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Container */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                StockPulse Professional Suite
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              StockPulse – Real-Time Stock Screener
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Real-time stock discovery terminal with TradingView charts, price target alerts & watchlist persistence.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live WS Engine</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400 font-medium">
              <LineChart className="w-3.5 h-3.5" />
              <span>Technical Indicators</span>
            </div>

            {/* Profile Navigation Button */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-800 transition-colors shadow"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>User Profile</span>
            </Link>
          </div>
        </header>

        {/* 3-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filters + Watchlist */}
          <div className="lg:col-span-3 space-y-6">
            <Filter />
            <WatchlistPanel />
          </div>

          {/* Center Column: Main Screener Table */}
          <div className="lg:col-span-5">
            <StockTable />
          </div>

          {/* Right Column: Chart + Price Alerts */}
          <div className="lg:col-span-4 space-y-6">
            <StockChart />
            <AlertPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
