'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  LineStyle,
} from 'lightweight-charts';
import { useStockStore } from '../store/useStockStore';
import {
  generateMockOHLC,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from '../utils/indicators';
import { CandlestickChart, Sliders, TrendingUp } from 'lucide-react';

export const StockChart: React.FC = React.memo(() => {
  const selectedStock = useStockStore((state) => state.selectedStock);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Indicator Toggle States
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(false);
  const [showBB, setShowBB] = useState<boolean>(false);
  const [showRSI, setShowRSI] = useState<boolean>(false);
  const [showMACD, setShowMACD] = useState<boolean>(false);

  // Generate mock OHLC dataset for selected stock
  const ohlcData = useMemo(() => {
    if (!selectedStock) return [];
    return generateMockOHLC(selectedStock.price, 150);
  }, [selectedStock?.symbol, selectedStock?.price]);

  useEffect(() => {
    if (!chartContainerRef.current || ohlcData.length === 0) return;

    // Clean up previous chart instance if present
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Main Candlestick Series using lightweight-charts v4+ addSeries API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(
      ohlcData.map((d) => ({
        time: d.time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))
    );

    // 1. Simple Moving Average (SMA) Overlay
    if (showSMA) {
      const smaData = calculateSMA(ohlcData, 20);
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
        title: 'SMA 20',
      });
      smaSeries.setData(smaData);
    }

    // 2. Exponential Moving Average (EMA) Overlay
    if (showEMA) {
      const emaData = calculateEMA(ohlcData, 20);
      const emaSeries = chart.addSeries(LineSeries, {
        color: '#a855f7',
        lineWidth: 2,
        title: 'EMA 20',
      });
      emaSeries.setData(emaData);
    }

    // 3. Bollinger Bands Overlay
    if (showBB) {
      const bbData = calculateBollingerBands(ohlcData, 20, 2);
      const bbUpper = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'BB Upper',
      });
      const bbMiddle = chart.addSeries(LineSeries, {
        color: '#d97706',
        lineWidth: 1,
        title: 'BB Mid',
      });
      const bbLower = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        title: 'BB Lower',
      });

      bbUpper.setData(bbData.map((d) => ({ time: d.time, value: d.upper })));
      bbMiddle.setData(bbData.map((d) => ({ time: d.time, value: d.middle })));
      bbLower.setData(bbData.map((d) => ({ time: d.time, value: d.lower })));
    }

    // 4. Relative Strength Index (RSI) Overlay
    if (showRSI) {
      const rsiData = calculateRSI(ohlcData, 14);
      const rsiSeries = chart.addSeries(LineSeries, {
        color: '#ec4899',
        lineWidth: 2,
        title: 'RSI 14',
      });
      rsiSeries.setData(rsiData);
    }

    // 5. MACD Histogram Overlay
    if (showMACD) {
      const macdData = calculateMACD(ohlcData);
      const macdSeries = chart.addSeries(HistogramSeries, {
        color: '#10b981',
        title: 'MACD Hist',
      });
      macdSeries.setData(
        macdData.map((d) => ({
          time: d.time,
          value: d.histogram,
          color: d.histogram >= 0 ? '#10b981' : '#f43f5e',
        }))
      );
    }

    chart.timeScale().fitContent();

    // Responsive window resize listener
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [ohlcData, showSMA, showEMA, showBB, showRSI, showMACD]);

  if (!selectedStock) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Select a stock from the table to view technical charting.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header Info Panel */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-white font-sans">{selectedStock.symbol}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
              Technical Chart
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>Price: <strong className="text-slate-100">${selectedStock.price.toFixed(2)}</strong></span>
            <span>Vol: <strong className="text-slate-100">{selectedStock.volume.toLocaleString()}</strong></span>
            <span>P/E: <strong className="text-slate-100">{selectedStock.pe.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Technical Indicators Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Indicators:</span>
          </div>

          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              showSMA
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            SMA (20)
          </button>

          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              showEMA
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            EMA (20)
          </button>

          <button
            onClick={() => setShowBB(!showBB)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              showBB
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            Bollinger
          </button>

          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              showRSI
                ? 'bg-pink-500/20 text-pink-400 border-pink-500/50 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            RSI (14)
          </button>

          <button
            onClick={() => setShowMACD(!showMACD)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              showMACD
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            MACD
          </button>
        </div>
      </div>

      {/* TradingView Chart Container */}
      <div ref={chartContainerRef} className="w-full h-[420px]" />

      {/* Chart Footer */}
      <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CandlestickChart className="w-3.5 h-3.5 text-emerald-400" />
          <span>TradingView Lightweight Candlestick Engine</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          <span>150 Daily Bars</span>
        </div>
      </div>
    </div>
  );
});

StockChart.displayName = 'StockChart';
