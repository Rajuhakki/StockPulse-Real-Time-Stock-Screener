'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Moon, Bell, Save, Check } from 'lucide-react';

export interface UserSettingsData {
  darkMode: boolean;
  enableAlertToasts: boolean;
  defaultMinPrice: string;
  defaultMinVolume: string;
  refreshInterval: string;
}

const DEFAULT_SETTINGS: UserSettingsData = {
  darkMode: true,
  enableAlertToasts: true,
  defaultMinPrice: '10',
  defaultMinVolume: '1000000',
  refreshInterval: '1500',
};

export const UserSettings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettingsData>(DEFAULT_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stockpulse_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('stockpulse_settings', JSON.stringify(settings));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed saving user settings', err);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl text-slate-100 space-y-5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Screener & Account Preferences</h3>
        </div>
        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-medium">
            <Check className="w-3.5 h-3.5" /> Settings Saved!
          </span>
        )}
      </div>

      {/* Toggles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-purple-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Dark Mode</span>
              <span className="text-[11px] text-slate-400">High-contrast dark terminal theme</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Popup Price Alerts</span>
              <span className="text-[11px] text-slate-400">Show floating toasts on target hits</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.enableAlertToasts}
            onChange={(e) => setSettings({ ...settings, enableAlertToasts: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Default Screener Preference Inputs */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Default Screener Preferences
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Default Minimum Price ($)</label>
            <input
              type="number"
              value={settings.defaultMinPrice}
              onChange={(e) => setSettings({ ...settings, defaultMinPrice: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Default Minimum Volume</label>
            <input
              type="number"
              value={settings.defaultMinVolume}
              onChange={(e) => setSettings({ ...settings, defaultMinVolume: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-lg transition-colors shadow cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </form>
  );
};
