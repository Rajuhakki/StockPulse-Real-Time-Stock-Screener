import { Stock } from '../types';

const WELL_KNOWN_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B', 'JNJ', 'V',
  'WMT', 'JPM', 'PG', 'UNH', 'MA', 'HD', 'DIS', 'PYPL', 'BAC', 'NFLX',
  'ADBE', 'CRM', 'CMCSA', 'PFE', 'ABT', 'NKE', 'TMO', 'COST', 'PEP', 'AVGO',
  'CSCO', 'XOM', 'ABBV', 'ACN', 'QCOM', 'DHR', 'TXN', 'AMD', 'WFC', 'NEE',
  'LIN', 'UNP', 'PM', 'LOW', 'BMY', 'HON', 'ORCL', 'UPS', 'RTX', 'INTC'
];

/**
 * Generates a unique 3 to 4 letter stock ticker symbol based on index.
 */
function generateSymbol(index: number): string {
  if (index < WELL_KNOWN_SYMBOLS.length) {
    return WELL_KNOWN_SYMBOLS[index];
  }
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const offset = index - WELL_KNOWN_SYMBOLS.length;
  
  const char1 = chars[Math.floor(offset / (26 * 26)) % 26];
  const char2 = chars[Math.floor(offset / 26) % 26];
  const char3 = chars[offset % 26];
  const char4 = chars[(offset * 7) % 26];
  
  return `${char1}${char2}${char3}${char4}`;
}

/**
 * Pseudo-random generator with seed for reproducible stock data generation
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 5,000 dummy stock records generated using Array.from()
 */
export const STOCKS: Stock[] = Array.from({ length: 5000 }, (_, index) => {
  const seed = index + 1;
  const symbol = generateSymbol(index);
  
  // Price between $5.00 and $2,450.00
  const rawPrice = 5 + pseudoRandom(seed * 1.1) * 2445;
  const price = Math.round(rawPrice * 100) / 100;
  
  // Volume between 10,000 and 45,000,000 shares
  const rawVolume = 10000 + Math.floor(pseudoRandom(seed * 2.3) * 44990000);
  const volume = rawVolume;
  
  // P/E ratio between 5.00 and 115.00
  const rawPe = 5 + pseudoRandom(seed * 3.7) * 110;
  const pe = Math.round(rawPe * 100) / 100;
  
  return {
    symbol,
    price,
    volume,
    pe,
  };
});
