'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useStockStore } from '../store/useStockStore';
import { Stock } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, Layers, AlertCircle, Radio, Star } from 'lucide-react';

/**
 * Animated Price Cell Component that flashes green/red on price update
 */
const PriceCell: React.FC<{ symbol: string; price: number }> = React.memo(({ symbol, price }) => {
  const priceChanges = useStockStore((state) => state.priceChanges[symbol]);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (!priceChanges) return;

    const isRecent = Date.now() - priceChanges.timestamp < 1200;
    if (isRecent) {
      setFlash(priceChanges.direction);
      const timer = setTimeout(() => {
        setFlash(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [priceChanges, price]);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  let bgClass = 'text-slate-100 bg-transparent';
  if (flash === 'up') {
    bgClass = 'text-emerald-400 bg-emerald-500/20 ring-1 ring-emerald-500/50 shadow-sm shadow-emerald-500/30';
  } else if (flash === 'down') {
    bgClass = 'text-rose-400 bg-rose-500/20 ring-1 ring-rose-500/50 shadow-sm shadow-rose-500/30';
  }

  return (
    <div className="flex items-center justify-end gap-1.5 font-mono">
      <span className={`px-2 py-0.5 rounded transition-all duration-300 font-medium ${bgClass}`}>
        {formattedPrice}
      </span>
      {flash === 'up' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />}
      {flash === 'down' && <ArrowDown className="w-3.5 h-3.5 text-rose-400 animate-bounce" />}
    </div>
  );
});

PriceCell.displayName = 'PriceCell';

/**
 * Watchlist Star Toggle Cell
 */
const WatchlistCell: React.FC<{ symbol: string }> = React.memo(({ symbol }) => {
  const { watchlist, toggleWatchlist } = useStockStore();
  const isStarred = watchlist.includes(symbol);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleWatchlist(symbol);
      }}
      title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
      className="p-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
    >
      <Star
        className={`w-4 h-4 transition-all ${
          isStarred ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-600 hover:text-amber-300'
        }`}
      />
    </button>
  );
});

WatchlistCell.displayName = 'WatchlistCell';

export const StockTable: React.FC = React.memo(() => {
  const { filtered, selectedStock, setSelectedStock } = useStockStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  // Column definitions using TanStack Table
  const columns = useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        id: 'watchlist',
        header: 'Fav',
        cell: (info) => <WatchlistCell symbol={info.row.original.symbol} />,
      },
      {
        accessorKey: 'symbol',
        header: 'Symbol',
        cell: (info) => (
          <span className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors font-sans">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: (info) => (
          <PriceCell symbol={info.row.original.symbol} price={info.getValue<number>()} />
        ),
      },
      {
        accessorKey: 'volume',
        header: 'Volume',
        cell: (info) => {
          const val = info.getValue<number>();
          return (
            <span className="text-slate-300 font-mono">
              {new Intl.NumberFormat('en-US').format(val)}
            </span>
          );
        },
      },
      {
        accessorKey: 'pe',
        header: 'P/E Ratio',
        cell: (info) => {
          const val = info.getValue<number>();
          return (
            <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
              {val.toFixed(2)}
            </span>
          );
        },
      },
    ],
    []
  );

  // Initialize TanStack Table instance
  const table = useReactTable({
    data: filtered,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  // Initialize TanStack Virtual virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 15,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-6 py-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-slate-200">
            Real-Time Screener Table
          </span>
          <span className="text-xs text-slate-400">
            (Click row to view chart • ⭐ to bookmark)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            Live WS
          </span>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            {rows.length.toLocaleString()} matches
          </span>
        </div>
      </div>

      {/* Virtualized Scrollable Table Container */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
      >
        <table className="w-full text-left text-sm border-collapse">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider shadow-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const isWatchlistCol = header.id === 'watchlist';

                  return (
                    <th
                      key={header.id}
                      scope="col"
                      onClick={
                        !isWatchlistCol
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={`py-3.5 px-6 select-none ${
                        !isWatchlistCol ? 'cursor-pointer hover:bg-slate-800/60' : ''
                      } transition-colors ${
                        header.id !== 'symbol' && !isWatchlistCol ? 'text-right' : ''
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          header.id !== 'symbol' && !isWatchlistCol ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {!isWatchlistCol && (
                          <span className="text-slate-500">
                            {isSorted === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isSorted === 'desc' ? (
                              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Table Body with Virtualization */}
          <tbody>
            {rows.length > 0 ? (
              <tr style={{ height: `${virtualItems[0]?.start ?? 0}px` }}>
                <td colSpan={columns.length} />
              </tr>
            ) : null}

            {rows.length > 0 ? (
              virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index];
                const isSelected = selectedStock?.symbol === row.original.symbol;

                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedStock(row.original)}
                    className={`cursor-pointer transition-colors border-b border-slate-800/50 group ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/30 font-medium'
                        : 'hover:bg-slate-800/50'
                    }`}
                    style={{ height: `${virtualRow.size}px` }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`py-3 px-6 ${
                          cell.column.id !== 'symbol' && cell.column.id !== 'watchlist'
                            ? 'text-right'
                            : ''
                        }`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-16 px-6 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-500" />
                    <p className="text-base font-medium text-slate-300">
                      No stocks match your filter criteria
                    </p>
                    <p className="text-xs text-slate-500">
                      Adjust or reset your filter constraints to see stock details.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {rows.length > 0 ? (
              <tr
                style={{
                  height: `${
                    totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0)
                  }px`,
                }}
              >
                <td colSpan={columns.length} />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
        <span>Click ⭐ to add stock to watchlist</span>
        <span>
          Selected: <strong className="text-emerald-400 font-semibold">{selectedStock?.symbol || 'None'}</strong>
        </span>
      </div>
    </div>
  );
});

StockTable.displayName = 'StockTable';
