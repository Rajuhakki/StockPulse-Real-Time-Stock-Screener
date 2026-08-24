import React from 'react';
import Link from 'next/link';
import { ProfileCard } from '../../components/ProfileCard';
import { UserSettings } from '../../components/UserSettings';
import { ArrowLeft, Activity, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Screener Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-sm font-extrabold text-white">StockPulse Account</span>
          </div>
        </div>

        {/* Profile Card Section */}
        <section aria-label="User Profile Details">
          <ProfileCard />
        </section>

        {/* Settings Section */}
        <section aria-label="Account Settings">
          <UserSettings />
        </section>

        {/* Security Footer */}
        <footer className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Local Storage Encryption Active</span>
          </div>
          <span>StockPulse v1.4.0</span>
        </footer>
      </div>
    </main>
  );
}
