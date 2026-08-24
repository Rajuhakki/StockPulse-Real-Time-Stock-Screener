# StockPulse – Real-Time Stock Screener 📈⚡

**StockPulse** is a production-grade, high-performance financial stock screener and technical analysis terminal built using **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, **Zustand**, **TanStack Table & Virtual**, and **TradingView Lightweight Charts**.

Designed for speed and scalability, StockPulse simulates live WebSocket market feeds across **5,000+ stock records** with real-time price flashing, sub-200ms multi-criteria filtering, DOM virtualization, technical indicators, watchlist bookmarking, target price alerts, and URL filter synchronization.

---

## 🔥 Key Features

### 1. 🚀 Scalable Data Engine & Virtualization
- **5,000+ Stock Records**: Realistic stock tickers, daily volume, prices ($5 - $2,500), and P/E ratios generated dynamically.
- **DOM Virtualization**: Powered by `@tanstack/react-virtual` (`useVirtualizer`), rendering only the ~20-30 visible rows in the viewport for 60fps smooth scrolling.
- **Multi-Column Sorting**: Built with `@tanstack/react-table` for instant sorting by Symbol, Price, Volume, and P/E ratio.

### 2. ⚡ Real-Time WebSocket Simulation
- **Live Price Updates**: Simulates a high-frequency WebSocket stream emitting price updates for 20–50 random stocks every 1.5 seconds.
- **Visual Price Flashing**: Sub-second glowing pulse indicators (Green for price increases, Red for price decreases).
- **Sub-200ms State Updates**: Immutable Zustand state management for lag-free performance.

### 3. 🎯 Multi-Criteria Filtering & Two-Way Sync
- **4 Filter Inputs**: Min Price, Max Price, Min Volume, and Max P/E ratio.
- **300ms Input Debouncing**: Smooth typing experience with zero UI stutter.
- **Two-Way Synchronization**: Automatically reads and syncs filters with **URL Query Parameters** (`?minPrice=100&maxPrice=500...`) and **`localStorage`**.

### 4. 📊 Financial Charting & 5 Technical Indicators
- **TradingView Canvas Chart**: Powered by `lightweight-charts` for responsive candlestick charting.
- **5 Technical Indicators**:
  1. **SMA (20)**: Simple Moving Average
  2. **EMA (20)**: Exponential Moving Average
  3. **RSI (14)**: Relative Strength Index
  4. **MACD**: Moving Average Convergence Divergence (Histogram)
  5. **Bollinger Bands**: Upper, Middle, and Lower Bands
- **Row-Click Selection**: Click any stock row in the table to instantly load its candlestick chart and technical overlays.

### 5. ⭐ Watchlist System
- **Favorite Bookmarks**: Click the ⭐ star button on any stock row to bookmark it.
- **Watchlist Panel**: Dedicated side panel displaying saved favorites with live streaming quotes and one-click chart loading.
- **Persistence**: Saved automatically in browser `localStorage`.

### 6. 🚨 Price Target Alerts & Floating Toasts
- **Alert Engine**: Configure target price thresholds (Price ≥ Target or Price ≤ Target).
- **Live Stream Evaluation**: Evaluates live WebSocket updates against target prices in real time.
- **Toast Overlay**: Displays floating notification toasts whenever target prices are crossed.

### 7. 👤 User Profile & Preferences (`/profile`)
- **User Dashboard**: Profile details, avatar, account tier, and quantitative trader stats.
- **Custom Settings**: Preferences for dark mode, popup alert toasts, and default screener filters saved in `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: [React 18](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Table Engine**: [@tanstack/react-table](https://tanstack.com/table/v8)
- **Virtualization**: [@tanstack/react-virtual](https://tanstack.com/virtual/v3)
- **Charting**: [lightweight-charts](https://tradingview.github.io/lightweight-charts/) (TradingView)

---

## 📁 Project Folder Structure

```
StockPulse-Real-Time-Stock-Screener/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global CSS & Tailwind imports
│   │   ├── layout.tsx           # App Router Root Layout & Metadata
│   │   ├── page.tsx             # Main 3-Column Dashboard Layout
│   │   └── profile/
│   │       └── page.tsx         # User Profile & Settings Page Route
│   ├── components/
│   │   ├── AlertPanel.tsx       # Price target alerts management panel
│   │   ├── Filter.tsx           # 4-input debounced screener filter card
│   │   ├── ProfileCard.tsx      # User avatar and account tier details
│   │   ├── StockChart.tsx       # TradingView candlestick chart & 5 indicators
│   │   ├── StockTable.tsx       # Virtualized & sortable TanStack stock table
│   │   ├── ToastContainer.tsx   # Floating popup notification toast overlay
│   │   ├── UserSettings.tsx     # Account preferences form
│   │   └── WatchlistPanel.tsx   # Bookmarked favorite stocks panel
│   ├── data/
│   │   └── stocks.ts            # 5,000 dummy stock record generator
│   ├── hooks/
│   │   ├── useFilters.ts        # Debounced filter hook with URL & localStorage sync
│   │   ├── useIsMounted.ts      # SSR hydration mismatch protection hook
│   │   └── useWebSocket.ts      # Live subscription lifecycle hook
│   ├── services/
│   │   └── mockWebSocket.ts     # High-frequency mock WebSocket update service
│   ├── store/
│   │   ├── useAlertStore.ts     # Target price alerts & toast notification store
│   │   └── useStockStore.ts     # Main Zustand stock, filter, and watchlist store
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces (Stock, Filter, etc.)
│   └── utils/
│       └── indicators.ts        # OHLC generator & 5 technical indicator algorithms
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rajuhakki/StockPulse-Real-Time-Stock-Screener.git
   cd StockPulse-Real-Time-Stock-Screener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at **`http://localhost:3000`** (or `http://localhost:3001`).

---

## ⚙️ Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles optimized production static site build.
- `npm run start`: Runs production server.
- `npm run lint`: Runs ESLint checks.

---

## 📜 License

This project is licensed under the MIT License.