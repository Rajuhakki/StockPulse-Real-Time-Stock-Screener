import { create } from 'zustand';
import { PriceUpdate } from '../services/mockWebSocket';

export interface AlertItem {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  triggered: boolean;
  createdAt: number;
}

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success';
  timestamp: number;
}

interface AlertStore {
  alerts: AlertItem[];
  toasts: ToastItem[];

  addAlert: (alert: { symbol: string; targetPrice: number; condition: 'above' | 'below' }) => void;
  removeAlert: (id: string) => void;
  checkAlerts: (updates: PriceUpdate[]) => void;
  dismissToast: (id: string) => void;
  clearTriggeredAlerts: () => void;
}

function getInitialAlerts(): AlertItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('stockpulse_alerts');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: getInitialAlerts(),
  toasts: [],

  /**
   * Adds a new price alert for a stock
   */
  addAlert: ({ symbol, targetPrice, condition }) => {
    set((state) => {
      const newAlert: AlertItem = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        symbol: symbol.toUpperCase().trim(),
        targetPrice,
        condition,
        triggered: false,
        createdAt: Date.now(),
      };

      const nextAlerts = [newAlert, ...state.alerts];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('stockpulse_alerts', JSON.stringify(nextAlerts));
        } catch (e) {
          console.error('Failed to save alerts to localStorage', e);
        }
      }

      return { alerts: nextAlerts };
    });
  },

  /**
   * Removes an alert by ID
   */
  removeAlert: (id: string) => {
    set((state) => {
      const nextAlerts = state.alerts.filter((a) => a.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('stockpulse_alerts', JSON.stringify(nextAlerts));
        } catch (e) {
          console.error('Failed to update alerts in localStorage', e);
        }
      }
      return { alerts: nextAlerts };
    });
  },

  /**
   * Checks price updates against active alerts and triggers toast notifications
   */
  checkAlerts: (updates: PriceUpdate[]) => {
    const currentAlerts = get().alerts;
    if (currentAlerts.length === 0) return;

    const updateMap = new Map<string, PriceUpdate>(updates.map((u) => [u.symbol, u]));
    const newToasts: ToastItem[] = [];
    let updatedAlerts = false;

    const nextAlerts = currentAlerts.map((alert) => {
      if (alert.triggered) return alert;

      const u = updateMap.get(alert.symbol);
      if (!u) return alert;

      const isTriggered =
        (alert.condition === 'above' && u.newPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && u.newPrice <= alert.targetPrice);

      if (isTriggered) {
        updatedAlerts = true;
        newToasts.push({
          id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: `Price Alert Triggered! 🚨`,
          message: `${alert.symbol} reached $${u.newPrice.toFixed(2)} (${alert.condition} target $${alert.targetPrice.toFixed(2)})`,
          type: 'alert',
          timestamp: Date.now(),
        });

        return { ...alert, triggered: true };
      }

      return alert;
    });

    if (updatedAlerts) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('stockpulse_alerts', JSON.stringify(nextAlerts));
        } catch (e) {
          console.error('Failed to save alerts to localStorage', e);
        }
      }

      set((state) => ({
        alerts: nextAlerts,
        toasts: [...newToasts, ...state.toasts].slice(0, 5), // keep last 5 toasts
      }));
    }
  },

  /**
   * Dismisses a toast notification by ID
   */
  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  /**
   * Clears triggered alerts
   */
  clearTriggeredAlerts: () => {
    set((state) => {
      const nextAlerts = state.alerts.filter((a) => !a.triggered);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('stockpulse_alerts', JSON.stringify(nextAlerts));
        } catch (e) {
          console.error('Failed to save alerts to localStorage', e);
        }
      }
      return { alerts: nextAlerts };
    });
  },
}));
