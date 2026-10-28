import React from 'react';
import { Shield, Sparkles, AlertCircle, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import { HijriDateInfo, toBengaliNumber } from '../utils/hijri';

interface HeaderProps {
  hijriInfo: HijriDateInfo;
  currentIntervalName: string;
  minutesLeft: number;
  onOpenTawbah: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({
  hijriInfo,
  currentIntervalName,
  minutesLeft,
  onOpenTawbah,
  onOpenAnalytics,
  onOpenSettings,
  streak
}) => {
  const hoursLeft = Math.floor(minutesLeft / 60);
  const minsRemainder = minutesLeft % 60;
  const timeRemainingStr = hoursLeft > 0 
    ? `${toBengaliNumber(hoursLeft)} ঘণ্টা ${toBengaliNumber(minsRemainder)} মিনিট`
    : `${toBengaliNumber(minsRemainder)} মিনিট`;

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Hijri Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                  <span>SafeZone</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>I Love Allah</span>
                    <span className="font-arabic text-xs font-bold text-amber-400">ﷻ</span>
                  </span>
                  <span className="text-emerald-400 text-sm font-medium">– Rafi Ibrahim</span>
                </h1>
                {streak > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    🔥 {toBengaliNumber(streak)} দিন স্ট্রিক
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>সূর্যাস্ত (মাগরিব) হতে পরবর্তী মাগরিব পর্যন্ত হিজরি ট্র্যাকিং</span>
              </p>
            </div>
          </div>

          {/* Action buttons on mobile */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenTawbah}
              title="তাওবা ও রিস্টার্ট"
              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all text-xs flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAnalytics}
              title="পরিসংখ্যান"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              title="সেটিংস"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Prominent Hijri Date Header */}
        <div className="bg-slate-950/70 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center justify-between sm:justify-center gap-4">
          <div className="text-left sm:text-center">
            <div className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{hijriInfo.formattedBn}</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>{hijriInfo.gregorianStartStr} ➔ {hijriInfo.gregorianEndStr}</span>
              {hijriInfo.isPostMaghrib && (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  মাগরিব পরবর্তী নতুন দিন
                </span>
              )}
            </div>
          </div>

          <div className="hidden lg:block border-l border-slate-800 pl-4 text-right">
            <div className="text-xs text-slate-400">বর্তমান ওয়াক্ত: <strong className="text-slate-200">{currentIntervalName}</strong></div>
            <div className="text-[11px] text-amber-400">বাকি: {timeRemainingStr}</div>
          </div>
        </div>

        {/* Right Actions for Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenTawbah}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>তাওবা ও রিস্টার্ট</span>
          </button>
          <button
            onClick={onOpenAnalytics}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-xs font-medium flex items-center gap-1.5 border border-slate-700"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>পরিসংখ্যান</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
            title="সেটিংস ও হিজরি তারিখ পরিবর্তন"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
