import { Stock } from '../types';

export interface PriceUpdate {
  symbol: string;
  newPrice: number;
  changeDirection: 'up' | 'down';
}

type UpdateCallback = (updates: PriceUpdate[]) => void;

class MockWebSocketService {
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<UpdateCallback> = new Set();
  private isRunning: boolean = false;

  /**
   * Subscribe a listener callback to receive price updates
   */
  public subscribe(callback: UpdateCallback): () => void {
    this.listeners.add(callback);

    if (!this.isRunning) {
      this.startSimulation();
    }

    // Unsubscribe function
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopSimulation();
      }
    };
  }

  /**
   * Starts the mock WebSocket interval (every 1.5 seconds)
   */
  public startSimulation(stocksSupplier?: () => Stock[]): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.tick(stocksSupplier);
    }, 1500);
  }

  /**
   * Stops the simulation and clears interval
   */
  public stopSimulation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * Generates a batch of 20-50 random stock price updates
   */
  private tick(stocksSupplier?: () => Stock[]): void {
    if (this.listeners.size === 0) return;

    const allStocks = stocksSupplier ? stocksSupplier() : [];
    if (allStocks.length === 0) return;

    // Pick between 20 and 50 random stocks
    const countToUpdate = Math.floor(Math.random() * 31) + 20; // 20 to 50
    const updates: PriceUpdate[] = [];
    const chosenIndices = new Set<number>();

    while (chosenIndices.size < countToUpdate && chosenIndices.size < allStocks.length) {
      const idx = Math.floor(Math.random() * allStocks.length);
      chosenIndices.add(idx);
    }

    chosenIndices.forEach((idx) => {
      const stock = allStocks[idx];
      // Random price delta between -2.0% and +2.0%
      const percentageChange = (Math.random() * 4 - 2) / 100;
      const rawDelta = stock.price * percentageChange;
      
      // Ensure minimum price of $0.05
      const newPrice = Math.max(0.05, Math.round((stock.price + rawDelta) * 100) / 100);
      
      if (newPrice !== stock.price) {
        updates.push({
          symbol: stock.symbol,
          newPrice,
          changeDirection: newPrice > stock.price ? 'up' : 'down',
        });
      }
    });

    if (updates.length > 0) {
      this.listeners.forEach((callback) => callback(updates));
    }
  }
}

export const mockWebSocket = new MockWebSocketService();
