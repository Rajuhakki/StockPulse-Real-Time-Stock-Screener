'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, Award, Calendar, Camera } from 'lucide-react';

export interface UserProfileData {
  name: string;
  email: string;
  avatarUrl: string;
  accountTier: 'Pro Trader' | 'Enterprise' | 'Free';
  memberSince: string;
  bio: string;
}

const DEFAULT_PROFILE: UserProfileData = {
  name: 'Alex Morgan',
  email: 'alex.morgan@quantpulse.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  accountTier: 'Pro Trader',
  memberSince: 'March 2024',
  bio: 'Algorithmic trader & quantitative analyst specializing in momentum stock screeners.',
};

export const ProfileCard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileData>(DEFAULT_PROFILE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stockpulse_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch {
      // fallback to default
    }
  }, []);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-xl text-slate-100">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Avatar Container */}
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500/80 shadow-lg"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold w-fit mx-auto sm:mx-0">
              <Award className="w-3.5 h-3.5" />
              {profile.accountTier}
            </span>
          </div>

          <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            {profile.email}
          </p>

          <p className="text-xs text-slate-300 mt-2 line-clamp-2">{profile.bio}</p>
        </div>
      </div>

      {/* Account Meta Bar */}
      <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">Joined</span>
            <span className="text-slate-200 font-medium">{profile.memberSince}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">Status</span>
            <span className="text-emerald-400 font-medium">Verified Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
          <User className="w-4 h-4 text-purple-400" />
          <div>
            <span className="block text-[10px] text-slate-500 uppercase">API Tier</span>
            <span className="text-slate-200 font-medium">Real-Time WS Live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
