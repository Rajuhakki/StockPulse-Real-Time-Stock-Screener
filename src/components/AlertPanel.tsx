'use client';

import React, { useState } from 'react';
import { useAlertStore } from '../store/useAlertStore';
import { useStockStore } from '../store/useStockStore';
import { Bell, Plus, Trash2, CheckCircle2, DollarSign } from 'lucide-react';

export const AlertPanel: React.FC = React.memo(() => {
  const selectedStock = useStockStore((state) => state.selectedStock);
  const { alerts, addAlert, removeAlert, clearTriggeredAlerts } = useAlertStore();

  const [symbol, setSymbol] = useState<string>(selectedStock?.symbol || 'AAPL');
  const [targetPrice, setTargetPrice] = useState<string>(
    selectedStock ? (selectedStock.price * 1.05).toFixed(2) : '150.00'
  );
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  // Update form if selectedStock changes
  React.useEffect(() => {
    if (selectedStock) {
      setSymbol(selectedStock.symbol);
      setTargetPrice((selectedStock.price * 1.05).toFixed(2));
    }
  }, [selectedStock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(targetPrice);
    if (!symbol.trim() || isNaN(parsed) || parsed <= 0) return;

    addAlert({
      symbol: symbol.trim(),
      targetPrice: parsed,
      condition,
    });
  };

  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">Price Target Alerts</h2>
        </div>
        {triggeredCount > 0 && (
          <button
            type="button"
            onClick={clearTriggeredAlerts}
            className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
          >
            Clear Triggered ({triggeredCount})
          </button>
        )}
      </div>

      {/* Add Alert Form */}
      <form onSubmit={handleSubmit} className="p-4 border-b border-slate-800 bg-slate-950/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
              className="w-full px-2.5 py-1.5 bg-slate-950/80 border border-slate-700 rounded text-xs text-slate-100 uppercase font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Price ($)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-slate-500">
                <DollarSign className="w-3 h-3" />
              </div>
              <input
                type="number"
                step="any"
                min="0"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="150.00"
                className="w-full pl-6 pr-2 py-1.5 bg-slate-950/80 border border-slate-700 rounded text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="w-full px-2.5 py-1.5 bg-slate-950/80 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="above">Price ≥ Target</option>
              <option value="below">Price ≤ Target</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded transition-colors shadow cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Price Alert
        </button>
      </form>

      {/* Alerts List */}
      <div className="p-3 max-h-[220px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors ${
                alert.triggered
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {alert.triggered ? (
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold text-slate-100 font-mono">{alert.symbol}</span>
                  <span className="text-slate-400 ml-1.5">
                    {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {alert.triggered ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold uppercase">
                    Triggered
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeAlert(alert.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Delete alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6 text-center text-slate-500 text-xs">
            No price alerts configured. Set an alert above.
          </div>
        )}
      </div>
    </div>
  );
});

AlertPanel.displayName = 'AlertPanel';
