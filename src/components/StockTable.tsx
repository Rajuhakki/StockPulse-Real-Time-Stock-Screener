'use client';

import React, { useMemo, useRef, useState } from 'react';
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
import { ArrowUpDown, ArrowUp, ArrowDown, Layers, AlertCircle } from 'lucide-react';

export const StockTable: React.FC = React.memo(() => {
  const { filtered } = useStockStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  // Column definitions using TanStack Table
  const columns = useMemo<ColumnDef<Stock>[]>(
    () => [
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
        cell: (info) => {
          const val = info.getValue<number>();
          return (
            <span className="font-medium text-slate-100 font-mono">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(val)}
            </span>
          );
        },
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
            Virtualized Stock Table
          </span>
          <span className="text-xs text-slate-400">
            ({rows.length.toLocaleString()} records rendered smoothly via virtual scrolling)
          </span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          DOM Nodes: {virtualItems.length} visible
        </span>
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
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      onClick={header.column.getToggleSortingHandler()}
                      className={`py-3.5 px-6 select-none cursor-pointer hover:bg-slate-800/60 transition-colors ${
                        header.id !== 'symbol' ? 'text-right' : ''
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          header.id !== 'symbol' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <span className="text-slate-500">
                          {isSorted === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isSorted === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                          )}
                        </span>
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
              // Spacer top for virtualization window
              <tr style={{ height: `${virtualItems[0]?.start ?? 0}px` }}>
                <td colSpan={columns.length} />
              </tr>
            ) : null}

            {rows.length > 0 ? (
              virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 group"
                    style={{ height: `${virtualRow.size}px` }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`py-3 px-6 ${
                          cell.column.id !== 'symbol' ? 'text-right' : ''
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 px-6 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-500" />
                    <p className="text-base font-medium text-slate-300">
                      No stocks match your filter criteria
                    </p>
                    <p className="text-xs text-slate-500">
                      Adjust or reset your filter constraints to see more records.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {rows.length > 0 ? (
              // Spacer bottom for virtualization window
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
        <span>Click column headers to sort</span>
        <span>
          Showing {rows.length.toLocaleString()} of {filtered.length.toLocaleString()} matching
        </span>
      </div>
    </div>
  );
});

StockTable.displayName = 'StockTable';
