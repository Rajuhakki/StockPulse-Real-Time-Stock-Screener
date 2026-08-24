export interface CandleData {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LineDataPoint {
  time: string;
  value: number;
}

export interface MACDPoint {
  time: string;
  macd: number;
  signal: number;
  histogram: number;
}

export interface BollingerBandPoint {
  time: string;
  upper: number;
  middle: number;
  lower: number;
}

/**
 * Generates realistic mock historical daily OHLC candles for a stock
 */
export function generateMockOHLC(basePrice: number, count: number = 180): CandleData[] {
  const candles: CandleData[] = [];
  const now = new Date();
  let currentPrice = Math.max(1, basePrice);

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const timeStr = date.toISOString().split('T')[0];
    
    // Random daily volatility (-3% to +3%)
    const dailyChange = (Math.random() * 0.06 - 0.03) * currentPrice;
    const open = Math.round(currentPrice * 100) / 100;
    const close = Math.max(0.5, Math.round((open + dailyChange) * 100) / 100);
    
    const highVal = Math.max(open, close) + Math.random() * 0.015 * currentPrice;
    const lowVal = Math.min(open, close) - Math.random() * 0.015 * currentPrice;
    
    const high = Math.round(highVal * 100) / 100;
    const low = Math.max(0.1, Math.round(lowVal * 100) / 100);
    const volume = Math.floor(100000 + Math.random() * 5000000);

    candles.push({
      time: timeStr,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * 1. Simple Moving Average (SMA)
 */
export function calculateSMA(data: CandleData[], period: number = 20): LineDataPoint[] {
  const result: LineDataPoint[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const avg = sum / period;
    result.push({
      time: data[i].time,
      value: Math.round(avg * 100) / 100,
    });
  }

  return result;
}

/**
 * 2. Exponential Moving Average (EMA)
 */
export function calculateEMA(data: CandleData[], period: number = 20): LineDataPoint[] {
  const result: LineDataPoint[] = [];
  if (data.length < period) return result;

  const multiplier = 2 / (period + 1);
  let prevEMA = data.slice(0, period).reduce((sum, c) => sum + c.close, 0) / period;

  result.push({
    time: data[period - 1].time,
    value: Math.round(prevEMA * 100) / 100,
  });

  for (let i = period; i < data.length; i++) {
    const currentClose = data[i].close;
    const currentEMA = (currentClose - prevEMA) * multiplier + prevEMA;
    result.push({
      time: data[i].time,
      value: Math.round(currentEMA * 100) / 100,
    });
    prevEMA = currentEMA;
  }

  return result;
}

/**
 * 3. Relative Strength Index (RSI)
 */
export function calculateRSI(data: CandleData[], period: number = 14): LineDataPoint[] {
  const result: LineDataPoint[] = [];
  if (data.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = 100 - 100 / (1 + firstRS);

  result.push({
    time: data[period].time,
    value: Math.round(firstRSI * 100) / 100,
  });

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      time: data[i].time,
      value: Math.round(rsi * 100) / 100,
    });
  }

  return result;
}

/**
 * 4. Moving Average Convergence Divergence (MACD)
 */
export function calculateMACD(
  data: CandleData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDPoint[] {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Map slow EMA times to fast EMA values
  const fastMap = new Map(fastEMA.map((d) => [d.time, d.value]));
  const macdRaw: LineDataPoint[] = [];

  slowEMA.forEach((slow) => {
    const fastVal = fastMap.get(slow.time);
    if (fastVal !== undefined) {
      macdRaw.push({
        time: slow.time,
        value: Math.round((fastVal - slow.value) * 100) / 100,
      });
    }
  });

  // Convert MACD raw to pseudo-candles to reuse calculateEMA for signal line
  const macdCandles: CandleData[] = macdRaw.map((m) => ({
    time: m.time,
    open: m.value,
    high: m.value,
    low: m.value,
    close: m.value,
    volume: 0,
  }));

  const signalLine = calculateEMA(macdCandles, signalPeriod);
  const signalMap = new Map(signalLine.map((s) => [s.time, s.value]));

  const result: MACDPoint[] = [];
  macdRaw.forEach((m) => {
    const signalVal = signalMap.get(m.time);
    if (signalVal !== undefined) {
      const histogram = Math.round((m.value - signalVal) * 100) / 100;
      result.push({
        time: m.time,
        macd: m.value,
        signal: signalVal,
        histogram,
      });
    }
  });

  return result;
}

/**
 * 5. Bollinger Bands
 */
export function calculateBollingerBands(
  data: CandleData[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandPoint[] {
  const result: BollingerBandPoint[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((sum, c) => sum + c.close, 0) / period;

    const variance =
      slice.reduce((sum, c) => sum + Math.pow(c.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const upper = Math.round((mean + stdDev * stdDevMultiplier) * 100) / 100;
    const lower = Math.round((mean - stdDev * stdDevMultiplier) * 100) / 100;
    const middle = Math.round(mean * 100) / 100;

    result.push({
      time: data[i].time,
      upper,
      middle,
      lower,
    });
  }

  return result;
}
