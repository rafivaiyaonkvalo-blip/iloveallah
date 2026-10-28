import React from 'react';
import { Clock, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { IntervalDefinition, SafeStatus } from '../types';
import { toBengaliNumber } from '../utils/hijri';

interface CurrentWaqtBannerProps {
  currentIntervalDef: IntervalDefinition;
  minutesLeft: number;
  progressPercent: number;
  currentStatus: SafeStatus;
  onSetStatus: (status: SafeStatus) => void;
  onOpenDetails: () => void;
}

export const CurrentWaqtBanner: React.FC<CurrentWaqtBannerProps> = ({
  currentIntervalDef,
  minutesLeft,
  progressPercent,
  currentStatus,
  onSetStatus,
  onOpenDetails
}) => {
  const hoursLeft = Math.floor(minutesLeft / 60);
  const minsRemainder = minutesLeft % 60;
  const timeRemainingStr = hoursLeft > 0 
    ? `${toBengaliNumber(hoursLeft)} ঘণ্টা ${toBengaliNumber(minsRemainder)} মিনিট`
    : `${toBengaliNumber(minsRemainder)} মিনিট`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-5 sm:p-6 shadow-xl mb-6">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              বর্তমান চলমান ওয়াক্ত
            </span>
            <span className="text-xs text-slate-400 font-arabic text-emerald-300">
              {currentIntervalDef.arabicName}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <span>{currentIntervalDef.nameBn}</span>
            <span className="text-sm font-normal text-slate-400">({currentIntervalDef.timeRangeDefault})</span>
          </h2>

          <p className="text-sm text-slate-300 mb-4 max-w-2xl leading-relaxed">
            {currentIntervalDef.descriptionBn}
          </p>

          {/* Key Hazard / Focus Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">প্রধান সতর্কতা:</span>
            {currentIntervalDef.keyHazardsBn.slice(0, 3).map((hazard, idx) => (
              <span key={idx} className="text-xs bg-slate-800/80 text-rose-300/90 px-2.5 py-1 rounded-md border border-rose-900/30">
                ⚠️ {hazard}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Quick Action & Progress */}
        <div className="lg:w-80 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                সময় বাকি:
              </span>
              <span className="text-amber-400 font-bold text-sm">{timeRemainingStr}</span>
            </div>

            {/* Interval progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick status selection buttons */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>এই ওয়াক্তে আপনার অবস্থা:</span>
              <button 
                onClick={onOpenDetails}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 underline underline-offset-2"
              >
                বিস্তারিত নোট <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSetStatus('safe')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all border ${
                  currentStatus === 'safe'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>নিরাপদ</span>
              </button>

              <button
                onClick={() => onSetStatus('struggled')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all border ${
                  currentStatus === 'struggled'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                    : 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/40'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>ঝুঁকিপূর্ণ</span>
              </button>

              <button
                onClick={() => onSetStatus('breached')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all border ${
                  currentStatus === 'breached'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/40'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>বিচ্যুত</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
